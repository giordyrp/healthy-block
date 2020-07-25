import React from 'react';

import {
  withStyles,
  Button,
  Card,
  CardHeader,
  Avatar
}  from '@material-ui/core'


const Result = (props) => {
  const { classes } = props;
  return (
    <Button className={classes.button}> 
      <Card  onClick={() => props.handleOpen(props.item)}>
        <CardHeader
          avatar={
            <Avatar alt="Remy Sharp" src={require('../../assets/images/user.png')} />
          }
          titleTypographyProps={{variant:'h6'}}
          title={props.item.name}
          subheader="Patient"/>
      </Card>
    </Button>
  )
}

const styles = theme => ({
  button:{
    margin:0,
    padding:0,
    textTransform : 'none'
  }
});


export default withStyles(styles)(Result);
