import os
import yaml
from yaml.loader import SafeLoader
import uuid
import shutil
import zipfile
import fnmatch

### USAGE: 
# Expects a path to a .zip file as the input to the class. 
class DatasetIngest:
    def __init__(self, path=None, uuid=None):
        self.labeled = None
        self.path = path
        self.parent = None
        self.extract_path = None
        self.uuid = uuid
        self.validFiles = []
        self.yamlDict = {}
        self.labelDict = {}
        self.imageJSONS = []
        
    ### Unzips directory
    def unzip(self):
        """
        Unzips a zip file to a destination directory.
        """
        
        with zipfile.ZipFile(f'{self.path}', 'r') as zip_ref:
            target_directory = zip_ref.namelist()[0]
            zip_ref.extractall(self.parent)
        
        self.extract_path = f'{self.parent}/{target_directory}'
        return True, None
        
    ### Locates YAML File - if it exists,
    ### Returns a Dict of all the information in the YAML
    def yamlLoad(self):
        ### Check For A .yaml file in the directory
        exists = os.path.exists(self.extract_path)
        if not exists:
            return False, "Path does not exist."
        
        files = os.listdir(self.extract_path)
        mask = [file for file in files if file[-4:] == "yaml"]
        if len(mask) == 0:
            return False, "No YAML Found"
        elif len(mask) > 1:
            return False, "More than one YAML Present"
        
        with open(f'{self.extract_path}/{mask[0]}') as f:
            yamlDict = yaml.load(f, Loader=SafeLoader)
        
        self.yamlDict = yamlDict
        return True, None
    
    def makeLabelDict(self):
        classes = self.yamlDict.get('names',None)
        nc = self.yamlDict.get('nc',0)
        if (classes is not None) and (len(classes) == nc):
            labelDict = {}
            for i in range(len(classes)):
                labelDict[i] = classes[i]
            self.labelDict = labelDict
            return True, None
        else: 
            return False, "Error loading classes. Verify count and labels match up."
        
    def flattenDataset(self):
        ### TODO: This doesn't handle non JPG extensions...
        img_formats = ['bmp', 'jpg', 'jpeg', 'png', 'tif', 'tiff', 'dng'] 
        ### Dataset SHOULD Have Train/Test/Val Directories Present
        train_dir = self.yamlDict.get('train', None)
        test_dir = self.yamlDict.get('test', None)
        val_dir = self.yamlDict.get('val', None)
        dest_dir = f'{self.extract_path}/flattened'
        if not os.path.exists(dest_dir):
            os.mkdir(dest_dir)
        else:
            shutil.rmtree(dest_dir)
            os.mkdir(dest_dir)
        
        filectr = 0 ### Counter to keep track of all images being uploaded
        if train_dir is not None and os.path.exists(f'{self.extract_path}{train_dir}/images'):
            image_list = os.listdir(f'{self.extract_path}{train_dir}/images')
            for image in image_list:
                # Extract Extension
                extension = image[-3:]
                if not (extension in img_formats):
                    continue
            
                try:
                    label = image[0:-4]+'.txt'
                    impath = f'{dest_dir}/{self.uuid}_{filectr}.{extension}'
                    labpath = f'{dest_dir}/{self.uuid}_{filectr}.txt'
                    shutil.copy(f'{self.extract_path}{train_dir}/images/{image}', impath)
                    shutil.copy(f'{self.extract_path}{train_dir}/labels/{label}', labpath)
                    self.validFiles.append(f'{self.uuid}_{filectr}.{extension}')
                except Exception as e:
                    print(e)
                    continue
                filectr += 1 # Iterate File Counter
        if test_dir is not None and os.path.exists(f'{self.extract_path}{test_dir}/images'):
            image_list = os.listdir(f'{self.extract_path}{test_dir}/images')
            for image in image_list:
                # Extract Extension
                extension = image[-3:]
                if not (extension in img_formats):
                    continue
                    
                try:
                    label = image[0:-4]+'.txt'
                    impath = f'{dest_dir}/{self.uuid}_{filectr}.{extension}'
                    labpath = f'{dest_dir}/{self.uuid}_{filectr}.txt'
                    shutil.copy(f'{self.extract_path}{test_dir}/images/{image}', impath)
                    shutil.copy(f'{self.extract_path}{test_dir}/labels/{label}', labpath)
                    self.validFiles.append(f'{self.uuid}_{filectr}.{extension}')
                except Exception as e:
                    print(e)
                    continue
                filectr += 1 # Iterate File Counter
        if val_dir is not None and os.path.exists(f'{self.extract_path}{val_dir}/images'):
            image_list = os.listdir(f'{self.extract_path}{val_dir}/images')
            for image in image_list:
                # Extract Extension
                extension = image[-3:]
                if not (extension in img_formats):
                    continue
                    
                try:
                    label = image[0:-4]+'.txt'
                    impath = f'{dest_dir}/{self.uuid}_{filectr}.{extension}'
                    labpath = f'{dest_dir}/{self.uuid}_{filectr}.txt'
                    shutil.copy(f'{self.extract_path}{val_dir}/images/{image}', impath)
                    shutil.copy(f'{self.extract_path}{val_dir}/labels/{label}', labpath)
                    self.validFiles.append(f'{self.uuid}_{filectr}.{extension}')
                except Exception as e:
                    print(e)
                    continue
                filectr += 1 # Iterate File Counter

        ### Return Count of images 
        return filectr, dest_dir
    
    def transformLabels(self):
        ### Method to transform all labels from integer space to label space
        ### Safe assumption? All .txt files at this point are valid formatted darknet... 
        work_dir = f'{self.extract_path}/flattened'
        if not os.path.exists(work_dir):
            return False, "Flattened directory missing."
        
        img_files = self.validFiles
        txt_files = [f'{entry.split(".")[0]}.txt' for entry in img_files]
        ### Load Text File Lines 
        for i in range(len(txt_files)):
            filename = txt_files[i]
            imgname = img_files[i]
            labels_in_image = []
            with open(f'{work_dir}/{filename}', 'r') as file:
                lines = file.readlines()
                # Strip \n and split on space
                lines = [line.strip().split(" ") for line in lines] 
            ### Overwrite the integer label with a text label... 
            ### Grab all labels present in image...
            for line in lines:
                # Line of length == 5 (label, x center, y center, width, height)
                labels_in_image.append([self.labelDict[int(line[0])], line[1], line[2], line[3], line[4]])
            #labels_in_image = list(set(labels_in_image))
            self.imageJSONS.append({"image":f'{self.extract_path}flattened/{imgname}',"labels":labels_in_image})
            newLines = [" ".join([self.labelDict[int(entry[0])],entry[1],entry[2],entry[3],entry[4]]) for entry in lines]
            with open(f'{work_dir}/{filename}', 'w') as file:
                for item in newLines:
                    file.write("%s\n" % item)

        return True, None
            
    ### Method that runs all of the ingest methods in order
    def runIngest(self):
        ### Walk backwards up file path to parent directory (where the .zip will extract to)
        self.parent = os.path.dirname(self.path)
        
        val, ermsg = self.unzip()
        if not val:
            return ermsg
        
        ### Load the YAML
        val, ermsg = self.yamlLoad()
        if not val:
            if ermsg == "No YAML Found":
                self.labeled = False
                all_files = os.listdir(self.extract_path)
                img_files = [fn for fn in all_files if fn[-4:] == ".jpg" or fn[-4:] == ".png"]
                self.imageJSONS = []
                for file in img_files:
                    self.imageJSONS.append({"image":f'{self.extract_path}{file}',"labels":[]})
                    
                return {"labeled":self.labeled, "files":self.imageJSONS}
            return ermsg
        self.labeled = True
        ### Grab the Classes, load into dictionary
        val, ermsg = self.makeLabelDict()
        
        if not val:
            return ermsg
        
        count, path = self.flattenDataset()
        val, ermsg = self.transformLabels()
        if not val:
            return ermsg
        
        return {"labeled":self.labeled, "files":self.imageJSONS}
        

    def __str__(self):
        return f"{self.yamlDict},{self.uuid}"