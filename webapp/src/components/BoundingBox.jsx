import React, { useState, useEffect, useRef } from "react";
import { Button, Select, MenuItem, Chip } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const LabelChip = ({ label, selected, onClick }) => {
  return (
    <Chip
      label={label}
      color={selected ? "primary" : "default"}
      onClick={onClick}
      style={{ marginRight: "8px" }}
    />
  );
};

const BoundingBox = () => {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState([]);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [annotationsOptions, setAnnotationsOptions] = useState([]);
  const [imageSrc, setImageSrc] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const convertToYOLOFormat = (boxes, imageWidth, imageHeight) => {
    return boxes.map(box => {
      const centerX = ((box.x + box.width / 2) / imageWidth).toFixed(6);
      const centerY = ((box.y + box.height / 2) / imageHeight).toFixed(6);
      const width = (box.width / imageWidth).toFixed(6);
      const height = (box.height / imageHeight).toFixed(6);
      return {
        classId: box.annotation, // assuming only one class
        centerX,
        centerY,
        width,
        height
      };
    });
  };

  const handleAnnotationChange = (e) => {
    setAnnotation(e.target.value);
  };

  const handleAnnotationSubmit = () => {
    setShowAnnotation(false);
    setAnnotation("");
    const newBox = {
      x: startPosition.x,
      y: startPosition.y,
      width: endPosition.x - startPosition.x,
      height: endPosition.y - startPosition.y,
      annotation: annotation,
    };
    setBoxes([...boxes, newBox]);
  };

  const handleLabelChipClick = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((selectedLabel) => selectedLabel !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/labels`);
      setAnnotationsOptions(response.data.results.map(item => item.label));
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/images?offset=0&per_page=1`);
      const data = response.data;
      setHasMore(data.hasmore);
      if (data.hasmore == false) {
        navigate('/')
      } else {
        setImageSrc(data.images[0].src);
      }
      

    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
  };

  useEffect(() => {
    fetchLabels();
    fetchData();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = BASE_API_URL+imageSrc;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      setCanvasDimensions({ width: image.width, height: image.height });
      ctx.drawImage(image, 0, 0, image.width, image.height);
    };
  }, [imageSrc]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPosition({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEndPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setShowAnnotation(true);
  };

  const handleReset = () => {
    setBoxes([]);
    console.log("reset");
  };

  const handleSave = () => {
    const boxesInYOLOFormat = convertToYOLOFormat(boxes, canvasDimensions.width, canvasDimensions.height);
    const fd = new FormData();
    fd.append('boxes', JSON.stringify(boxesInYOLOFormat));
    fd.append('pkey', imageSrc)
    axios.post(BASE_API_URL + '/boxes', fd)
      .then(response => {
        console.log('Boxes saved:', response.data);
        setBoxes([])
        fetchData(); // Fetch data after successful response
      })
      .catch(error => {
        console.error('Failed to save boxes:', error);
      });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    const image = new Image();
    image.src = BASE_API_URL+imageSrc;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      boxes.forEach((box) => {
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        if (box.annotation) {
          ctx.font = "20px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(box.annotation, box.x, box.y - 5);
        }
      });
      if (isDrawing) {
        ctx.strokeRect(startPosition.x, startPosition.y, endPosition.x - startPosition.x, endPosition.y - startPosition.y);
      }
    };
  }, [canvasDimensions, boxes, isDrawing, startPosition, endPosition, imageSrc]);

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        {annotationsOptions.map((label, index) => (
          <LabelChip
            key={index}
            label={label}
            selected={selectedLabels.includes(label)}
            onClick={() => handleLabelChipClick(label)}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          Save Labels
        </Button>
        <Button variant="contained" color="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <br></br>
      <img src={BASE_API_URL+imageSrc} alt="Bounding box image" style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {showAnnotation && (
        <div className="annotation-form">
          <label htmlFor="annotation">Annotation:</label>
          <Select
            value={annotation}
            onChange={handleAnnotationChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {selectedLabels.map((option, index) => (
              <MenuItem key={index} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <button onClick={handleAnnotationSubmit}>Submit</button>
        </div>
      )}
      
    </>
  );
};

export default BoundingBox;
