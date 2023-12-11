import React, { useState } from "react";
import axios from "axios";
import { Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import HealthBar from "./HealthBar";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import IconButton from "@mui/material/IconButton";
import {Typography} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import Alert from '@mui/material/Alert';


const MAX_CHUNK_SIZE = 1024 * 1024; // 1 MB
const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;


const BigUpload = () => {
    const [file, setFile] = useState(null);
    const [percentDone, setPercentDone] = useState(null);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frames, setFrames] = useState('30');

    const handleTitleChange = (event) => {
        setTitle(event.target.value.slice(0, 50));
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value.slice(0, 150));
    };

    const handleChange = (event) => {
      setFile(event.target.files[0]);
      setIsError(false);
      setIsSuccess(false);
    };
  
    function handleRemove() {
      console.log("Button clicked!");
      setFile(null);
    }

    const handleFramesChange = (event) => {
        const value = event.target.value.replace(/\D/, ''); // remove non-digit characters
        setFrames(value);
      };

    const handleUpload = async () => {
        //Check for fileType is performed here, so modify this list for approved files...
      if ([".mp4", ".jpg", ".png", ".zip"].includes(file.name.slice(-4))) {
        const totalChunks = Math.ceil(file.size / MAX_CHUNK_SIZE);
        const chunkPromises = [];
        let chunksDone = 0;
        let myuuid = uuidv4();
        let fileType = file.name.slice(-4);
        for (let i = 0; i < totalChunks; i++) {
          const start = i * MAX_CHUNK_SIZE;
          const end = Math.min(start + MAX_CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);
  
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("totalChunks", totalChunks);
          formData.append("chunkIndex", i);
          formData.append("uuid", myuuid);
          formData.append("fileType", fileType);
          formData.append("frames", frames);
          formData.append("title",title);
          formData.append("description",description);
  
          const promise = axios.post(BASE_API_URL + "/upload2", formData);
          chunkPromises.push(promise);
        }
  
        await Promise.all(chunkPromises.map((promise, index) => {
            return promise.then(() => {
              chunksDone++; // increment the counter variable when the promise resolves successfully
              setPercentDone((chunksDone/totalChunks)*100);
            }).catch(error => {
              console.error(error);
              setIsError(true);
              setErrorMessage(String(error));
            });
          })).then(() => {
            console.log(`All ${chunkPromises.length} promises resolved successfully.`);
            setIsSuccess(true);
            setFile(null);
            setPercentDone(null);
          }).catch(error => {
            console.error(error);
            setIsError(true);
            setErrorMessage(String(error));
          });
        // Notify server that all chunks have been uploaded
        // await axios.post("/upload-complete");
      } else {
        setIsError(true);
        setErrorMessage("Invalid file type. Please select a file with one of the following extensions: .mp4, .jpg, .png, .zip");
      }
    };

  return (
    <div className="test">
      {isSuccess && (
        <Alert severity="success" onClose={() => setIsSuccess(false)}>
          File upload success!
        </Alert>
      )}
      {isError && (
        <Alert severity="error" onClose={() => setIsError(false)}>
          {errorMessage}
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <input
            type="file"
            id="upload-file"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <label htmlFor="upload-file">
            <Button variant="contained" component="span" color="secondary">
              Choose file
            </Button>
          </label>
          <Button
            variant="contained"
            color="secondary"
            disabled={!file}
            onClick={handleUpload}
            sx={{ marginLeft: "16px" }}
          >
            Upload
          </Button>
        </Box>
        <br/>
        <br/>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Title"
                variant="outlined"
                value={title}
                onChange={handleTitleChange}
                inputProps={{ maxLength: 50 }}
            />
            <TextField
                label="Description"
                multiline
                rows={4}
                variant="outlined"
                value={description}
                onChange={handleDescriptionChange}
                inputProps={{ maxLength: 150 }}
            />
            <TextField
                label="Frames"
                variant="outlined"
                value={frames}
                onChange={handleFramesChange}
                inputProps={{ maxLength: 9, pattern: '[0-9]*' }}
            />
        </Box>
        
        {file && (
          <div className="test" style={{ display: "flex", alignItems: "center" }}>
            <TextField
              label="Selected file"
              value={file.name}
              variant="filled"
              sx={{ marginTop: "16px", width: "50%" }}
            />
            <IconButton size="large" style={{ verticalAlign: "middle" }} onClick={handleRemove}>
              <RemoveCircleIcon fontSize="large" />
            </IconButton>
          </div>
        )}
        <Box sx={{ display: "flex", alignItems: "center", marginTop: "16px" }}>
          <Typography variant="body2" sx={{ marginRight: "8px" }}>
            200MB Upload Limit. Supported file formats are:
          </Typography>
          <Typography variant="body2" color="secondary">
            .mp4, .jpg, .png, and .zip (for archives of images)
          </Typography>
        </Box>
      </Box>
      {percentDone && (
        <HealthBar count={Math.floor(percentDone)} max={100} lowThresh={99} highThresh={99} uom={"%"} label={"Upload Progress"} />
      )}
    </div>
  );
      }

export default BigUpload;