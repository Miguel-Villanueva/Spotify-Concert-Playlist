import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import {Collapse} from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Link} from "react-router-dom";

import ArtistPic from '../../images/concert.jpg'

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
    background: '#997799',
    margin: '30px'
  },
  media: {
    height: 440,
  },
  title: {
    fontWeight: 'bold',
    fontSize: '2rem',
    color: '#02FE8F'
  },
  description: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#02FE8F'
  },
  content:{
    height: 250
  }
});

export default function ImageCard({checked}) {
  const classes = useStyles();

  return (
    <Collapse in={checked}
    {...(checked ? {timeout: 1000} : {})} >
      <Card className={classes.root}>
    
          <CardMedia
            className={classes.media}
            image={ArtistPic}
         
          />
          <CardContent>
           
            <Typography className={classes.description} variant="body2" color="textSecondary" component="p">
            Make a playlist based on concerts in your area!
            </Typography>

            <Typography gutterBottom variant="h5" component="h2" className={classes.title}>
              <Link to={{
                              pathname:'../concertPlaylist',
                      
                          }}><Button id="buttonLink" variant="contained" type="submit">Create by Concerts</Button></Link>

            </Typography>
          </CardContent>
      
      </Card>
    </Collapse>
  );
}
