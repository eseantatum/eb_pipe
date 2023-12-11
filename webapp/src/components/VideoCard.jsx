import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { useNavigate } from 'react-router-dom';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const handleDoubleClick = () => {
    navigate(`/video/${video.uuid}`);
  };

  return (
    <Card
      sx={{ maxWidth: 345, cursor: 'pointer' }}
      onDoubleClick={handleDoubleClick}
    >
      <CardMedia component="video" src={BASE_API_URL + video.src} title={video.title} controls />
      <CardContent>
        <h2>{video.title}</h2>
        <p>{video.desc}</p>
        <p>{video.date}</p>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
