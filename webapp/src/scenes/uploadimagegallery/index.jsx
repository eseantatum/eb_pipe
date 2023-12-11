import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { useTheme } from "@mui/material";
import ImageGallery from '../../components/ImageGallery';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

function UploadImageGallery() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDataset = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete the dataset?");
      if (!confirmed) {
        return;
      }

      setIsDeleting(true);
      const tablename = "upload";
      const response = await fetch(`${BASE_API_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uuid, tablename })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      navigate('/uploads');

    } catch (error) {
      console.error('A problem occurred when trying to delete the dataset:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Typography variant="h2" align="center">
        Manage Images for: {uuid}
      </Typography>
      <br></br>
      <br></br>
      <ImageGallery uuid={uuid} />
      <br></br>
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteDataset}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Dataset'}
      </Button>
    </div>
  );
}

export default UploadImageGallery;
