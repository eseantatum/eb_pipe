import React, { useState, useRef, useEffect } from "react";
import { Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputLabel, FormControl, FormHelperText, Checkbox, FormControlLabel } from '@mui/material';
import { Box } from "@mui/system";
import axios from 'axios';

const BoundingBoxEditor = ({ imageUrl, menuOptions, setMenuOptions, offset, setOffset }) => {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [boxes, setBoxes] = useState([]);
  const [currentLabel, setCurrentLabel] = useState(menuOptions[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [retainBoxes, setRetainBoxes] = useState(false);
  const imageCanvasRef = useRef(null);
  const boxCanvasRef = useRef(null);
  const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

  useEffect(() => {
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = BASE_API_URL+imageUrl;

    image.onload = () => {
      const aspectRatio = image.width / image.height;
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;

      let canvasWidth = image.width;
      let canvasHeight = image.height;

      if (canvasWidth > maxWidth) {
        canvasWidth = maxWidth;
        canvasHeight = canvasWidth / aspectRatio;
      }

      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      boxCanvasRef.current.width = canvasWidth;
      boxCanvasRef.current.height = canvasHeight;
      setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    };
  }, [imageUrl]);

  const handleCheckboxChange = (event) => {
    setRetainBoxes(event.target.checked);
  };

  const handleMouseDown = (e) => {
    const canvas = boxCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPosition({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = boxCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEndPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (startPosition.x !== endPosition.x && startPosition.y !== endPosition.y) {
      setBoxes([...boxes, { start: startPosition, end: endPosition, label: currentLabel }]);
    }
    setStartPosition({ x: 0, y: 0 });
    setEndPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = boxCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.font = "bold 16px Arial"; //Increase the font size

    boxes.forEach(({ start, end, label }) => {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.fillText(label, Math.min(start.x, end.x), Math.min(start.y, end.y) > 0 ? Math.min(start.y, end.y) - 5 : 0);
    });
    if (isDrawing) {
      ctx.strokeRect(startPosition.x, startPosition.y, endPosition.x - startPosition.x, endPosition.y - startPosition.y);
    }
  }, [canvasDimensions, boxes, isDrawing, startPosition, endPosition]);

  const handleChange = (event) => {
    setCurrentLabel(event.target.value);
  };

  const formatBoundingBox = (box) => {
    const xMin = Math.min(box.start.x, box.end.x);
    const yMin = Math.min(box.start.y, box.end.y);
    const width = Math.abs(box.end.x - box.start.x);
    const height = Math.abs(box.end.y - box.start.y);
    const xCenter = xMin + width / 2;
    const yCenter = yMin + height / 2;

    // convert to YOLO format
    const objectClass = box.label;
    const yoloX = xCenter / canvasDimensions.width;
    const yoloY = yCenter / canvasDimensions.height;
    const yoloWidth = width / canvasDimensions.width;
    const yoloHeight = height / canvasDimensions.height;

    return [objectClass,yoloX.toFixed(6),yoloY.toFixed(6),yoloWidth.toFixed(6),yoloHeight.toFixed(6)];
  };

  const handleSave = async () => {
    const formattedBoxes = boxes.map(box => formatBoundingBox(box));
    const fd = new FormData();
    fd.append('boxes', JSON.stringify(formattedBoxes));
    fd.append('pkey', imageUrl)
    try {
      const response = await axios.post(BASE_API_URL + '/boxes', fd);
      console.log(response.data);
      setOffset(offset+1);
      if (!retainBoxes){
        handleReset();
      }
      // you may want to handle the response here
    } catch (error) {
      console.error('There was an error!', error);
      // you may want to handle the error here
    }
  };

  const handleReset = () => {
    setBoxes([]);
  };

  const handleAddLabel = () => {
    setIsAddingLabel(true);
  };

  const handleNewLabelChange = (event) => {
    setNewLabel(event.target.value);
  };

  const handleNewLabelSubmit = () => {
    if (newLabel.trim() !== "") {
      setCurrentLabel(newLabel.trim());
      setNewLabel("");
      setMenuOptions([...menuOptions,newLabel.trim()])
      setIsAddingLabel(false);
      // New label is ~~implicitly~~ sent to back end when you submit
      // an image with that label for the first time.
      

    }
  };

  const handleNewLabelCancel = () => {
    setNewLabel("");
    setIsAddingLabel(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Box sx={{ marginRight: "1rem" }}>
        <FormControl sx={{ width: 200 }}>
        <InputLabel id="label-id">Label</InputLabel>
        <Select
            defaultValue={menuOptions[0]}
            labelId="label-id"
            value={currentLabel}
            onChange={handleChange}
        >
            {menuOptions.map((option) => (
            <MenuItem key={option} value={option}>
                {option}
            </MenuItem>
            ))}
        </Select>
        <FormHelperText>Select A Label</FormHelperText>
        </FormControl>

        </Box>
        <Box sx={{ marginRight: "1rem" }}>
        <Button variant="contained" color="secondary" onClick={handleAddLabel}>
          Add New Label
        </Button>
        </Box>
        <Box sx={{ marginRight: "1rem" }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={retainBoxes}
                        onChange={handleCheckboxChange}
                        name="retainBoxes"
                        color="secondary"
                    />
                }
                label="Retain Boxes"
            />
        </Box>
        <Box sx={{ marginRight: "1rem" }}>
          <Button variant="contained" color="error" onClick={handleReset}>
            Reset
          </Button>
        </Box>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          Save Labels
        </Button>
      </div>
      <br />
      <div style={{ flexGrow: 1, position: "relative", overflow: 'auto' }}>
        <canvas ref={imageCanvasRef} style={{ position: 'absolute' }} />
        <canvas
          ref={boxCanvasRef}
          style={{ position: 'absolute' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      <Dialog open={isAddingLabel} onClose={handleNewLabelCancel}>
        <DialogTitle>Add New Label</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            type="text"
            value={newLabel}
            onChange={handleNewLabelChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewLabelCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleNewLabelSubmit} color="secondary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BoundingBoxEditor;
