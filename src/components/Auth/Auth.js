import React, { useState, useEffect } from 'react';

import { Avatar, CssBaseline, Paper, Grid, Typography } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { withStyles } from '@material-ui/core/styles';

import Background from '../../assets/images/banner.png';

const Auth = (props) => {
  const { classes } = props;
  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image}>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {props.formName}
          </Typography>
          {props.children}
          </div>
      </Grid>
    </Grid>
  )
}

const styles = theme => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(' + Background + ')',
    backgroundColor: '#01b750',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  }
});

export default withStyles(styles)(Auth);
