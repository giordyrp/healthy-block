import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const FormDialog = (props) => {
  return (
    <div>
      <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title" maxWidth="md">
        <DialogContent>
          <DialogContentText>{props.message}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="key"
            label="Key"
            type="password"
            fullWidth
            value={props.value}
            onChange={(evt) => props.onInputChange(evt)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOkClick} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FormDialog;
