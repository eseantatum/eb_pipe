import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Badge } from '@mui/material';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import { useNavigate } from 'react-router-dom';

const parseDate = (dateString) => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hour = dateString.substring(8, 10);
  const minute = dateString.substring(10, 12);

  return new Date(year, month - 1, day, hour, minute);
};

const TileComponent = ({ item }) => {
  const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/upload/${item.uuid}`); // Adjust according to your route
  };

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      badgeContent={item.labeled ? <BeenhereIcon color="secondary"/> : null}
    >
      <Card onClick={handleClick}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image={BASE_API_URL + item.thumb}
            alt={item.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.desc}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {parseDate(item.date).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.type}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Badge>
  );
};

export default TileComponent;