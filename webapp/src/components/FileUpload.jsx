import React, { useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Box } from "@mui/material";
const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    input: {
      display: "none",
    },
    button: {
      margin: theme.spacing(2),
    },
    uploadContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginTop: theme.spacing(2),
    },
    progress: {
      marginRight: theme.spacing(1),
    },
  }));

const FileUpload = () => {
  const classes = useStyles();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [frames, setFrames] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFramesChange = (e) => {
    setFrames(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("frames", frames);
    setLoading(true);

    try {
      await axios.post(BASE_API_URL+"/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
      setFile(null);
      setDescription("");
      setFrames(0);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Upload a File
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          accept=".jpg,.png,.mp4"
          className={classes.input}
          id="contained-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            color="secondary"
            component="span"
            startIcon={<CloudUploadIcon />}
            className={classes.button}
          >
            Choose File
          </Button>
        </label>
        <TextField
          label="Frames"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
          className={classes.textField}
          value={frames}
          onChange={(e) => setFrames(e.target.value)}
        />
        <TextField
          label="Description"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
          className={classes.textField}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={!file}
          startIcon={<CloudUploadIcon />}
          className={classes.button}
        >
          Upload
        </Button>
        {loading && <CircularProgress color="secondary" className={classes.progress} />}
      </form>
      <Typography variant="caption" gutterBottom>
        Max File Size 100MB | Accepted file formats: jpg, png, mp4
      </Typography>
      <br></br>
      <br></br>
      <Typography variant="h3" gutterBottom>
        Usage
      </Typography>
      <Typography variant="body1" gutterBottom>
        <br></br>
        "Frames" refers to how often you want to capture a frame from the video for subsampling into images. For example, if the video is shot at 30 FPS 
        and you select "30" as the value for frames, you will extract one frame per second from the video. This will dictate how many images are generated for labeling. 
      </Typography>
      <Typography variant="body1" gutterBottom>
        <br></br>
        "Description" is where you can describe the footage, limit 250 characters. 
      </Typography>
      <Box mt={10}>
        <Typography variant="h5" gutterBottom>
          This page is kind of empty, and I don't know what to put here... so here's a comic.
        </Typography>
        <img src="https://www.explainxkcd.com/wiki/images/3/3f/drone_training.png" alt="xkcd comic"></img>
      </Box>
    </div>
  );
  
};

export default FileUpload;