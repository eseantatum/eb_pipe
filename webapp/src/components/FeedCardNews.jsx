import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function MultiActionAreaCardNews(props) {
    // Open link to article if it is clicked. 
    // https://stackoverflow.com/questions/67935510/material-ui-card-open-in-new-tab-on-ctrlclick
    const handleCardClick = async (e) => {
        window.open(props.link, '_blank');
    }
    const mediaPresent = (props.image!=="{}" ? true : false);
    console.log(mediaPresent);
    if (mediaPresent){
      return (
        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea onClick= {handleCardClick}>
            <CardMedia
              component="img"
              height="140"
              src={props.image}
              alt={props.source}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {props.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {props.text}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Source: {props.source}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    }
    return (
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea onClick= {handleCardClick}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {props.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.text}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Source: {props.source}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );

}