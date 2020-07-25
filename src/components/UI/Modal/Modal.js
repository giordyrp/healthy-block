import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  withStyles
} from '@material-ui/core'

import { Close as CloseIcon } from '@material-ui/icons'




const Modal = (props) => {
  const { classes } = props;
  return (
    <Dialog maxWidth={props.maxWidth ? props.maxWidth : "xs"} onClose={props.handleClose} aria-labelledby="customized-dialog-title" open={props.open}>
      <DialogTitle id="customized-dialog-title" onClose={props.handleClose}>
        {props.title}
      </DialogTitle>
      <DialogContent className={classes.dialogContent} style={{width: props.width}} dividers>
        <IconButton aria-label="close" className={classes.closeButton}  onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
        {props.children}
        </DialogContent>
    </Dialog>
)}

const styles = theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(0.5),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingBottom: 30
  }
});

export default withStyles(styles)(Modal);
