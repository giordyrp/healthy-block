import React, { useEffect } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import Input from '../../UI/Input/Input';


const Form = (props) => {
  const formElementsArray = [];

  for (let key in props.form) {
    formElementsArray.push({
      id: key,
      config: props.form[key].config,
      ...props.form[key]
    });
  }

  const { classes } = props;

  let button =  <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={props.buttonClicked}
                >
                  {props.buttonLabel}
                </Button>;
  
  if (props.buttonHidden) {
    button = null;
  } 

  let form = (
    <div>
    <form
      className={classes.form} 
      >
      {formElementsArray.map(formElement => (
        <Input
          key={formElement.id}
          value={formElement.value} 
          error={formElement.error}         
          inputChanged={props.inputChanged}
          {...formElement.config}
          />
      ))}
      {button}
    </form>
    {props.error ? <Alert severity="error">{props.errorMessage}</Alert> : null}
    </div>
  );

  return form;

}

const styles = theme => ({
  form: {
    width: '100%', 
    marginTop: theme.spacing(1),
    minWidth: 120
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

export default withStyles(styles)(Form);
