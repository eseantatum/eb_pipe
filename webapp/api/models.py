from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

#################
### DB TABLES ###
#################

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

class Upload(db.Model):
    __tablename__ = "uploads"
    uuid = db.Column(db.String(36), primary_key=True, unique=True)
    name = db.Column(db.String(50))
    date = db.Column(db.String(12))
    thumb = db.Column(db.String(125))
    type = db.Column(db.String(4)) ### Types: mp4, ds (dataset)
    description = db.Column(db.String(150))
    sampleRate = db.Column(db.Integer)
    labeled = db.Column(db.Boolean)
    delete = db.Column(db.Boolean)


### Model Defining an image in the db and specific information about it. 
class Image(db.Model):
    __tablename__ = "images"
    src = db.Column(db.String(125), primary_key=True, unique=True) # Source -> Full path to file, INCLUDING EXTENSION
    uuid = db.Column(db.String(36)) #identifier to tie it back to original upload. 
    labeled = db.Column(db.Boolean) #Flag if image has been labeled 
    delete = db.Column(db.Boolean) #Flag for deletion later
    annotations = db.Column(db.String(250)) #Hopefully there isn't so much in an image that it overflows this! 

class Label(db.Model):
    __tablename__ = "labels"
    id = db.Column(db.String(50), primary_key=True, unique=True) #string for label
    count = db.Column(db.Integer) #number of items with this label present in the database. 

class YoloLabels(db.Model):
    __tablename__ = "Yolo-labels"
    id = db.Column(db.String(125), primary_key=True) #Path to image in static directory for (i.e. XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX_00001)
    label_num = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(50))
    x_center = db.Column(db.Float)
    y_center = db.Column(db.Float)
    width = db.Column(db.Float)
    height = db.Column(db.Float)