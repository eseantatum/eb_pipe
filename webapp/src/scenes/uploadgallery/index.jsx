import React, { useEffect, useState } from 'react';
import TileComponent from '../../components/TileComponent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const UploadGallery = () => {
  const [data, setData] = useState({ hasmore: false, results: [], total_pages: 1 });
  const baseUrl = process.env.REACT_APP_BASE_API_URL;

  useEffect(() => {
    fetch(`${baseUrl}/datasets`)
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => console.error('Error:', error));
  }, [baseUrl]);

  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        All Datasets
      </Typography>
      <Grid container spacing={3} justifyContent="left">
        {data.results.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <TileComponent item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UploadGallery;
