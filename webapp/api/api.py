from flask import Flask, jsonify, flash, request, redirect, url_for, session, abort
import os
import json
import cv2
import math
from flask_cors import CORS, cross_origin
import datetime
from models import db, User, Upload, Image, Label, YoloLabels
from werkzeug.utils import secure_filename
import time
from sqlalchemy import or_, and_
import csv

from celery import Celery
from celery.result import AsyncResult

# User authentication imports. 
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

# POSTGRES DB IMPORTS
from config import Config

# Class Import
from DSIngestor import DatasetIngest



### File Upload Imports
from flask_socketio import SocketIO, emit
import threading


app = Flask(__name__, static_folder='static', static_url_path='/api')
cors = CORS(app)

app.config.from_object(Config)
app.config['CORS_HEADERS'] = 'Content-Type'
app.app_context().push()

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

db.init_app(app)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


# Start up celery connection... 
celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379")

# Setup Redis
from redis import Redis
r = Redis(host='redis', port=6379, db=0)



# Load in private key from the environment. 
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET", "sample key")
jwt = JWTManager(app)

app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif']
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 101 #100 MB File Upload Limit

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'csv', 'txt', 'pdf', 'doc', 'docx', 'jpg', 'mp4','png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

file_lock = threading.Lock() #Prevent race condition on file write. 

########################
### Helper Functions ###
########################



##################################################################################


# Function to lookup an entry, and create it if it is not already there. 
def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        session.commit()
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.commit()
        return instance  
    

### Modified implementation of get_or_create so that a primary key
### Can be specified and table won't be updated unless this pk is unique.
### Avoids uniqueness errors where pk is same but other columns are different.
def get_or_createMEDIA(session, model, pk, **kwargs):
    instance = session.query(model).filter_by(url = kwargs.get(pk)).first()
    if instance:
        session.commit()
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.commit()
        return instance

def iter_or_create_label(session, model, pk, iter_value, **kwargs):
    instance = session.query(model).filter_by(id = kwargs.get(pk)).first()
    if instance:
        instance.count = instance.count + iter_value
        session.commit()
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.commit()
        return instance

##############################
### Routes for Application ###
##############################
##############################

@app.route('/api/upload2', methods=['POST'])
def upload_chunk():
    chunk = request.files['chunk']
    total_chunks = int(request.form['totalChunks'])
    chunk_index = int(request.form['chunkIndex'])
    ul_uuid = request.form['uuid']
    fileType = request.form['fileType']
    temp_file_path = f'tmp/{ul_uuid}.{chunk_index}'
    chunk.save(temp_file_path)

    ### File Lock is used here to overcome race conditions in filesystem. 
    if len([entry.split(".")[0] for entry in os.listdir('tmp') if entry.split(".")[0] == ul_uuid]) == total_chunks:
        with file_lock:
            # Assemble the file
            if not os.path.exists(f'static/uploads/{ul_uuid}'):
                os.mkdir(f'static/uploads/{ul_uuid}')
            else:
                ### Path already created by a different thread :) 
                return 'OK'
            
            ### TODO: Fix file extension and naming convention...
            file_path = f'static/uploads/{ul_uuid}/{ul_uuid}{fileType}'
            with open(file_path, 'wb') as f:
                for i in range(total_chunks):
                    temp_file_path = f'tmp/{ul_uuid}.{i}'
                    with open(temp_file_path, 'rb') as chunk_file:
                        f.write(chunk_file.read())
                    os.remove(temp_file_path) #remove the chunk once it has been saved. 
            ### Now File Has Been Uploaded and Moved to it's destination...
            
            ### File type is mp4... 
            if fileType == ".mp4":
                ### Kick off a celery task to parse it at the specified frame rate. 
                ### Extract all frames out to the folder 
                ### Add all frames to the database during the celery task...
                frames = int(request.form['frames'])
                title = request.form['title']
                description = request.form['description']
                ### Insert into video database...
                ul_time = str(datetime.datetime.now().strftime("%Y%m%d%H%M"))

                ### Use placeholder video icon image until it has been processed to have a real thumbnail. 
                db_upload = get_or_create(db.session, Upload, uuid=ul_uuid, name=title, date=ul_time, type="mp4", 
                                            description=description, sampleRate=frames, labeled=False, delete=False,
                                            thumb="assets/video.png")  
                create_task.delay(1, path=f'static/uploads/{ul_uuid}/{ul_uuid}{fileType}', dest=f'static/uploads/{ul_uuid}/', 
                            frames=frames, uuid=ul_uuid)

            ### If it's a .zip directory...
            if fileType == ".zip":
                ### Run the decompression, expansion, etc. job in celery. 
                ### Give this the path to the zip file in storage..
                create_task.delay(2, path=f'static/uploads/{ul_uuid}/{ul_uuid}{fileType}', uuid=ul_uuid, 
                                  description=request.form['description'], title=request.form['title'])


    return 'OK'

### Route for saving annotations from data labeling
@app.route('/api/boxes', methods=['POST'])
def boxes():
    boxesList = request.form.get('boxes')
    boxesList = json.loads(boxesList)
    imageSrc = [request.form.get('pkey')]
    try:
        # Lookup the entry by primary key
        ### This comes back as a list because of laziness... not because it needs to (TODO)
        entries = Image.query.filter(Image.src.in_(imageSrc)).all()
        # Change the desired field in all the entries
        for entry in entries:
            entry.labeled = True
            lab_ctr = 0
            annotations = []
            for label in boxesList:
                annotations.append(label[0])
                get_or_create(db.session, YoloLabels, id=imageSrc[0], label_num=lab_ctr, label=label[0],  
                              x_center=float(label[1]), y_center=float(label[2]), width=float(label[3]), height=float(label[4]))
                ### DO LABEL BOOK-KEEPING FOR COUNTERS 
                iter_or_create_label(db.session, Label, "id", 1, id=label[0], count=1)
                lab_ctr += 1 
            annotations = list(set(annotations))
            entry.annotations = ",".join(annotations)

        # Commit the changes to the database
        db.session.commit()
        ### TODO: Make this not hardcoded to accomodate extensions other than jpg or png
        with open(f'static{imageSrc[0][0:-4]}.txt', 'w', newline='') as file:
            writer = csv.writer(file, delimiter=' ')
            # Write each sublist to the file
            for sublist in boxesList:
                writer.writerow(sublist)
        return 'OK'
    
    except Exception as e:
        print("EXCEPTION ")
        print(e)
        db.session.rollback()
        return f'Error updating entries: {str(e)}', 500

    ### TODO:
    ### Add label to tracking in database. 
    ### Iterate over the list and make a text file for the specific image loaded, and save
    ### in YOLO Darknet Format for training later. 
    ### This will require annotating which annotations are in the image, updating all of the places in the DB where this is tracked, etc. 
    ### Write this value out to a text file.. 

    return "OK"

@app.route('/api/user', methods=["GET"])
@jwt_required()
def user_profile():
    response_body = { "message":{
        "user_name": "Adam Kratch",
        "profile_pic" :"../../assets/adam.png",
        "user_org" : "AI2C/O&I",
        "privs" : "Admin"
    }
        
    }

    return response_body

### Method to implement JWT access to website. 
@app.route("/api/token", methods=["POST"])
def user_auth():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    ### Find user in the database with that username...
    user = User.query.filter_by(username=username).first() #Grab first even though this has to be unique...
    access_token = None
    if user is not None: 
        ### User exists in DB, therefore validate the login password and go forth...
        if(user.check_password(password)):
           ### Password is also good
           access_token = create_access_token(identity=username)

    if access_token is None: 
        return jsonify({"msg": "Bad username or password"}), 401

    

    # Generate response body including access token and user profile...
    response_body = { "user_profile":{
        "user_name": "Adam Kratch",
        "profile_pic" :"../../assets/adam.png",
        "user_org" : "AI2C/O&I",
        "privs" : "Admin"
    },
    "access_token":access_token
    }

    return response_body

### Route for grabbing a batch of images for viewing...

### PAGINATION DOCUMENTATION ###
''' During a request, this will take page and per_page arguments from the query string request.args. 
Pass max_per_page to prevent users from requesting too many results on a single page. If not given, 
the default values will be page 1 with 20 items per page.
'''


### This route is accessed by:
# "Gallery" component where images are filtered based on datasets. 
# "Labeling" component where bounding boxes can be drawn on images. 


### TODO: Make this very simple with **kwargs and a standardized format between front end and back end... 
@app.route('/api/images', methods=["GET"])
def images():
    ### Set offset from query param
    offset  = int(request.args.get('offset', 1))

    ### Set number of results per page
    per_page = int(request.args.get('per_page', 10))

    ### Grab the UUID For Viewing

    ul_uuid = request.args.get('uuid', None)

    ### Set Label status 
    labeled = request.args.get('labeled',"All")

    ### Grab desired page from database
    ### error_out = False prevents 404 from happening, and allows for "hasmore" to be set... 
    ### could just have the client side interpret 404 as hasmore = false I guess. Same amount of traffic either way. 

    ### Default endpoint for unlabeled data. 
    if ul_uuid is None:
        ### Grab all that are UNLABELED
        currPage = db.paginate(db.select(Image).filter_by(delete=False, labeled=False).order_by(Image.src),page=offset,per_page=per_page, error_out=False)
    else: ### Grab specified batch by uuid 
        if labeled == "Labeled":
            currPage = db.paginate(db.select(Image).filter_by(uuid=ul_uuid, delete=False,labeled=True).order_by(Image.src),page=offset,per_page=per_page, error_out=False)
        
        elif labeled == "Unlabeled":
            currPage = db.paginate(db.select(Image).filter_by(uuid=ul_uuid, delete=False,labeled=False).order_by(Image.src),page=offset,per_page=per_page, error_out=False)
        
        else: #Default behavior have all images shown regardless of label status
            currPage = db.paginate(db.select(Image).filter_by(uuid=ul_uuid, delete=False).order_by(Image.src),page=offset,per_page=per_page, error_out=False)
    
    ### List comprehension to package up JSON
    outList = [{"src": entry.src, "uuid": entry.uuid, "labeled":entry.labeled, "annotations":entry.annotations}
                for entry in currPage]
    hasmore = True
    ### Calculate 'hasmore' variable
    if len(outList) != per_page:
        hasmore = False

    response_body = {"images":outList,
                     "hasmore":hasmore}
    return response_body


### API Route for flagging images for deletion (they will no longer appear on the front end)
### TODO: Add a cron job that will actually go and delete these from the file system. 
@app.route('/api/delete', methods=["POST"])
def flag_delete():
    ### Grab relevent params out of the POST from the front end. 
    data = request.get_json()
    
    tableName = data.get('tablename',None)

    if tableName == "images":
        images_to_delete = data.get('imagesToDelete',None)
        if images_to_delete is None:
            return 'No primary keys provided', 400

        try:
            # Lookup the entries by primary key
            entries = Image.query.filter(Image.src.in_(images_to_delete)).all()
            # Change the desired field in all the entries
            for entry in entries:
                entry.delete = True
                entry_labels = entry.annotations
                if entry_labels is not None:
                    label_list = entry_labels.split(",")
                    for label in label_list:
                        label_entry = iter_or_create_label(db.session, Label, "id", 1, id=label, count=0) 
                        #default count to 0 when you decrement if it doesn't already exist. 
                        #print(f'{label_entry.id}, {label_entry.count}')


            # Commit the changes to the database
            db.session.commit()

            return 'OK'
        except Exception as e:
            db.session.rollback()
            return f'Error updating entries: {str(e)}', 500
        
    if tableName == "upload":
        ul_uuid = data.get('uuid', None)
        ### Lookup entry for this primary key

        ### Set flag to "delete"

        ### Lookup all associated entries that have the UUID in Images, set to delete

        if ul_uuid is None:
            return "No upload pkey provided", 400
        
        try:
            # Lookup the entries by primary key
            entry = Upload.query.filter_by(uuid=ul_uuid).first()
            # Change the desired field in all the entries
            entry.delete = True

            entries = Image.query.filter_by(uuid=ul_uuid).all()
            print(len(entries))
            for entry in entries:
                entry.delete = True
            # Commit the changes to the database
            db.session.commit()

            return 'OK'
        except Exception as e:
            db.session.rollback()
            return f'Error updating entries: {str(e)}', 500

    else:
        return "OK"
### Route for grabbing a videos from the DB and then rendering them into a gallery. 
@app.route('/api/videos', methods=["GET"])
def videos():

    ### Example Query: 

    ### Set offset from query param
    offset  = int(request.args.get('offset', 1))

    ### Set number of results per page
    per_page = int(request.args.get('per_page', 20))

    ### Grab desired page from database
    ### error_out = False prevents 404 from happening, and allows for "hasmore" to be set... 
    ### could just have the client side interpret 404 as hasmore = false I guess. Same amount of traffic either way. 

    numEntries = Upload.query.filter_by(delete=False,type="mp4").order_by(Upload.date).count()
    num_pages = math.ceil(numEntries/per_page)

    currPage = db.paginate(db.select(Upload).filter_by(delete=False,type="mp4").order_by(Upload.date),page=offset,per_page=per_page, error_out=False)


    ### List comprehension to package up JSON
    outList = [{"src": f'/uploads/{entry.uuid}/{entry.uuid}.mp4', "uuid": entry.uuid, "desc":entry.description, "title":entry.name, "date":entry.date}
                for entry in currPage]
    hasmore = True
    ### Calculate 'hasmore' variable
    if len(outList) != per_page:
        hasmore = False

    response_body = {"results":outList,
                     "hasmore":hasmore,
                     "total_pages":num_pages}
    
    return response_body

### Route for grabbing all DATASETS from the db and rendering them to the front end based on filters. 

### Query Paramters:
# offset -> int (page offset for pagination)
# per_page -> int (number to render per page)
# type -> string, mp4 or ds are valid values. 
# labeled -> comes in as 0 or 1, must be cast to bool.
@app.route('/api/datasets', methods=["GET"])
def datasets():
    ### PAGINATION QUERY PARAMS ###
    offset  = int(request.args.get('offset', 1))
    per_page = int(request.args.get('per_page', 20))

    ### Other Params
    ds_type = request.args.get("type", None) ### Filter by type
    label_status = request.args.get("labeled", None) ### Filter by labeled or not
    ### Make Filters
    filters = []
    if ds_type is not None:
        filters.append(getattr(Upload, "type") == str(ds_type))

    if label_status is not None:
        ### Cast to int followed by cast to bool is necessary here because "0" and "1" will both cast to TRUE
        filters.append(getattr(Upload, "labeled") == bool(int(label_status)))

    ### Always filter to only yield videos NOT flagged for deletion. 
    filters.append(getattr(Upload, "delete") == False)
    print(filters)

    ### Grab desired page from database
    ### error_out = False prevents 404 from happening, and allows for "hasmore" to be set... 
    ### could just have the client side interpret 404 as hasmore = false I guess. Same amount of traffic either way. 

    numEntries = Upload.query.filter(and_(*filters)).count()
    num_pages = math.ceil(numEntries/per_page)

    #currPage = db.paginate(db.select(Upload).query.filter(or_(*filters)).order_by(Upload.date),page=offset,per_page=per_page, error_out=False)
    query = Upload.query.filter(and_(*filters)).order_by(Upload.date)
    pagination = query.paginate(page=offset, per_page=per_page, error_out=False)
    currPage = pagination.items #list of items in current page. 
    ### List comprehension to package up JSON
    outList = [{"type": entry.type, "src": f'/uploads/{entry.uuid}/{entry.uuid}.mp4', "uuid": entry.uuid, "desc":entry.description, "title":entry.name, "date":entry.date, "thumb":entry.thumb, "labeled":entry.labeled}
                for entry in currPage]
    hasmore = True
    ### Calculate 'hasmore' variable
    if len(outList) != per_page:
        hasmore = False

    response_body = {"results":outList,
                     "hasmore":hasmore,
                     "total_pages":num_pages}
    
    return response_body
    
### Route to handle all database lookups related to labels of images (summary stats, etc).  
@app.route('/api/labels', methods=['GET'])
def labels():
    request_type  = request.args.get('type', "summary")
    ### Generate Summary statistics for labels in database. 
    if request_type == "summary": 
        all_labels = Label.query.all()
        if all_labels is not None:
            outList = [{"label":entry.id,"count":entry.count} for entry in all_labels]
        else: 
            outList = []
        response_body = {"results":outList}
        return response_body
    
    ### RESTART FROM HERE !!! --> Need to escape encode to test API back end. 
    if request_type == "imlabels":
        ### Grab image id from args
        im_id = request.args.get('id', None)
        if im_id is None:
            return "No image ID provided", 500
        im_labels = YoloLabels.query.filter_by(id = im_id).all()

        #im_labels = YoloLabels.query.all()
        print(len(im_labels))
        ### Pack up into an output JSON
        outList = [{'label':entry.label,'x_center':entry.x_center, 'y_center':entry.y_center, 'width':entry.width,"height":entry.height} for entry in im_labels]
        response_body = {"results":outList}
        return response_body
    return "OK"

### CELERY TASKS
#TODO: Modularize a lot of the code present in this task handler :) 
### These tasks can be run like normal functions, just using the async caller to push
### To the celery worker..
### Print statements will go to the celery log file. 
@celery.task(name="create_task")
def create_task(task_type, **kwargs):
    ### Unroll an mp4 into its frames. 
    if task_type == 1:
        videoPath = kwargs.get('path')
        imgDest = kwargs.get('dest')
        n_frame = kwargs.get('frames', 30)
        ul_uuid = kwargs.get('uuid')
        print(videoPath)
        exists = os.path.exists(videoPath)
        if not exists:
            print("Video File not Found. Ingest Task Failed.")
            return True
        
        vidObj = cv2.VideoCapture(videoPath)
        
        try:
            os.mkdir(imgDest+"stills")
        except OSError as error:
            print(error)
            return True

        # Used as counter variable
        count = 0
        name_ctr = 0
        # checks whether frames were extracted
        success = 1
        
        while success:
            # vidObj object calls read
            # function extract frames
            success, image = vidObj.read()
            
            # Saves the frames with frame-count
            try:
                if count % n_frame == 0:
                    # Save image to folder.
                    ### This lexicographical ordering structure may cause bugs if more than 1 million frames :)
                    ### Pick really big number 
                    cv2.imwrite(imgDest+"stills/"+ul_uuid+f'_{name_ctr:06d}.jpg', image)
                    # Write image to database. 
                    imageUpload = get_or_create(db.session, Image, src=f'/uploads/{ul_uuid}/stills/{ul_uuid}_{name_ctr:06d}.jpg',
                                                uuid=ul_uuid, labeled=False, delete=False) 
                    # Extract a thumbnail from the video to be used in the databse. 
                    if count == 0:
                        thumbNailOut = f'/uploads/{ul_uuid}/stills/{ul_uuid}_{name_ctr:06d}.jpg'
                    name_ctr += 1 # move the name counter up 1
                    
            except:
                break
    
            count += 1 # move the frame counter up 1
        print("Frame Subsample Job Complete")

        # Fetch the associated database reference and update. 
        vid_entity = Upload.query.get(ul_uuid)
        vid_entity.thumb = thumbNailOut
        db.session.commit()
        db.session.close()

        return True
    
    ### Task for handling zip file expansion and check if labeled or unlabeled dataset. 
    if task_type == 2:

        # Grab KWARGS
        zipPath = kwargs.get('path')
        ul_uuid = kwargs.get('uuid')
        description = kwargs.get('description',"No Description.")
        title = kwargs.get('title',"Untitled")
        ul_time = str(datetime.datetime.now().strftime("%Y%m%d%H%M"))

        # Init a datasetingestor
        d = DatasetIngest(zipPath,ul_uuid)
        output = d.runIngest()
        ermsg = output.get("ermsg")
        if ermsg is not None:
            print(f'ERROR: {ermsg}')
        else:
            labeled = output.get('labeled', False)
            files = output.get('files', [])

            ### Log this upload into the database. 
            db_upload = get_or_create(db.session, Upload, uuid=ul_uuid, name=title, date=ul_time, type="ds", 
                            description=description, labeled=labeled, delete=False) 
            ### labeled = True -> annotations exist because it is a dataset.. 
            fp = "/some/file/path" ### TODO: update this with a real path to a real asset...
            if labeled:
                print("LABELED DS")
                for file in files:
                    ### ALWAYS STRIP 'static' from beginning of filepath
                    fp = file.get('image')[6:]
                    labels = file.get('labels') ### Comes out as a list of labels, such as ['penguin','0.4114583333333333', 0.802734375','0.5755208333333334','0.3056640625']
                    
                    ### Lookup an entry for this label, if it doesn't exist, make it, otherwise iterate by +1
                    label_num = 0
                    for label in labels:
                        # Iterate the label counter appropriately for each label in the summaries table. 
                        label_entry = iter_or_create_label(db.session, Label, "id", 1, id=label[0], count=1)
                        ### DEBUG HERE
                        # print(f'{label_entry.id}, {label_entry.count}')
                        # Do upload into actual table for annotating labels. 
                        label_upload = get_or_create(db.session, YoloLabels, id=fp, label_num = label_num, label=label[0],
                                                x_center=label[1], y_center=label[2], width=label[3], height=label[4])
                        label_num += 1
                    
                    just_labels = [entry[0] for entry in labels] #Grab just the text of labels 
                    just_labels = list(set(just_labels)) #Delete duplicates from the list
                    annotations = ",".join(just_labels)

                    imageUpload = get_or_create(db.session, Image, src=fp,
                                                uuid=ul_uuid, labeled=True, delete=False, annotations=annotations)
                    
                    #db.session.close() #Close connector database at the end here. 
            else:
                print("UNLABELED DS")
                for file in files:
                    fp = file.get('image')[6:]
                    imageUpload = get_or_create(db.session, Image, src=fp,
                                                uuid=ul_uuid, labeled=False, delete=False)
            db_upload.thumb = fp ### Thumbnail is functionally the final image in the dataset... 
            db.session.commit()
            db.session.close()

        return True
    