import React from 'react';

import {
  Grid,
  Avatar,
  Typography,
  withStyles
} from '@material-ui/core';

const agentTypes = {
  pt: 'Patient',
  dc: 'Doctor',
  lb: 'Laboratory',
  admin: 'Admin'
}

const Profile = (props) => {
  const {classes} = props;
  return (
    <Grid container spacing={3} direction="row" justify="center" alignItems="center">
      <Grid item xs={4} sm={6}>
      <Avatar alt="Remy Sharp" src={require('../../assets/images/user.png')} className={classes.bigAvatar} />
      </Grid>
      <Grid item xs={8} sm={6}>

      <Typography variant="h5" component="h2">
        {props.item.name}
      </Typography>
      <Typography className={classes.pos} color="textSecondary">
        {props.item.uid}
      </Typography>
      <Typography variant="body2" component="p">
        {agentTypes[props.item.aType]} of HealthyBlock
      </Typography>
      </Grid>

      {props.children}
    </Grid>
  )
}

const styles = theme => ({
  pos: {
    marginBottom: 12,
  },
  bigAvatar: {
    margin: 10,
    width: 120,
    height: 120,
  }
});

export default withStyles(styles)(Profile);
