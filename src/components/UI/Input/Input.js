import React, { useEffect } from 'react';

import {
  MenuItem,
  TextField,
  Switch,
  Grid
} from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from  '@date-io/date-fns';

import Auxiliary from '../../../hoc/Auxiliary/Auxiliary';

const Input = (props) => {
  let inputElement = null; 

  switch (props.element) {
    case ('input'):
      let multiline = {}
      if (props.multiline) {
        multiline = {
          multiline: true,
          rows: props.rows
        }
      }
      inputElement =  <TextField
                        type={props.type}
                        id={props.id}
                        label={props.label}
                        name={props.id}
                        autoComplete={props.label}
                        value={props.value}
                        autoFocus
                        onChange={(evt) => props.inputChanged(evt, props.id)}
                        error={props.error}
                        helperText={props.error ? props.errorMessage : ''}
                        variant="outlined"
                        margin="normal"
                        required={props.required}
                        disabled={props.disabled}
                        fullWidth
                        {...multiline}
                      />
      break;
    case ('select'):
      
      inputElement =  <TextField
                        id={props.id}
                        select
                        label={props.label}
                        value={props.value}
                        onChange={(evt) => props.inputChanged(evt, props.id)}
                        variant="outlined"
                        fullWidth
                        required={props.required}
                        disabled={props.disabled}
                        margin="normal"
                        
                      >
                        {props.options.map(option => (
                          <MenuItem key={option.key} value={option.key}>
                            {option.value}
                          </MenuItem>
                        ))}
                      </TextField>

      break;
    case ('switch'):
      inputElement =  <Switch
                        checked={props.value}
                        onChange={(evt) => props.inputChanged(evt, props.id)}
                        value={props.value}
                        disabled={props.disabled}
                        color="primary"
                      />
      break;
    case ('date'):
      inputElement =  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid container justify="space-around">
                          <KeyboardDatePicker
                            margin="normal"
                            variant="dialog"
                            inputVariant="outlined"
                            fullWidth
                            id={props.id}
                            label={props.label}
                            format="MM/dd/yyyy"
                            value={props.value}
                            onChange={(evt) => props.inputChanged(evt, props.id)}
                            required={props.required}
                            disabled={props.disabled}
                            KeyboardButtonProps={{
                              'aria-label': 'change date',
                            }}
                          />
                        </Grid>
                      </MuiPickersUtilsProvider>
      break;
    default:
      inputElement = <p>Input not found!</p>
  }
  return inputElement;
}

export default Input;
