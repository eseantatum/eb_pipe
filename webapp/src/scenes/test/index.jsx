import React, { useEffect, useState } from 'react';
import BoundingBoxEditor from '../../components/BoundingBoxEditor';
import { Box, Typography, useTheme, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Test = () => {
  const theme = useTheme();
  const bugs = [
    "Resizing the page causes the image and canvas to become out of sync with one another",
    "Another known bug description...",
    // add more bugs here...
  ];
  const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(1);
  const [imageSrc, setImageSrc] = useState("");
  const [annotationsOptions, setAnnotationsOptions] = useState([""]);
  const navigate = useNavigate();
  

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
      //This API request hits the backend to get the first unlabeled image off the pile
      const response = await axios.get(`${BASE_API_URL}/images?offset=${offset}&per_page=1`);
      const data = response.data;
      setHasMore(data.hasmore);
      if (data.hasmore == false) {
        alert('No more images left to label. Redirecting to home page...');
        navigate('/')
      } else {
        setImageSrc(data.images[0].src);
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
  };

  const handlePrevious = () => {
    setOffset((prevOffset) => Math.max(prevOffset - 1, 1));
  };

  const handleNext = () => {
    if (hasMore) {
      setOffset((prevOffset) => prevOffset + 1);
    }
  };

  useEffect(() => {
    fetchLabels();
    fetchData();
  }, [offset]);

  return (
    <div>
      <BoundingBoxEditor 
        imageUrl={imageSrc} 
        menuOptions={annotationsOptions}
        setMenuOptions={setAnnotationsOptions}
      />

      <Box mt={1} display="flex" justifyContent="center">
        <Button variant="outlined" color="secondary" onClick={handlePrevious} disabled={offset === 1}>
          Previous
        </Button>
        <Typography variant="h6" sx={{ margin: '0 10px' }}>
          {offset}
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleNext} disabled={!hasMore}>
          Next
        </Button>
      </Box>
    </div>
  );
};

export default Test;

