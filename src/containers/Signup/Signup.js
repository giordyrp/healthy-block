import React, { Component } from 'react';

import Auth from '../../components/Auth/Auth';
import Form from '../../components/UI/Form/Form';
import FormDialog from '../../components/UI/FormDialog/FormDialog';
import { registerAgent } from '../../utils/methods';

const options = [
  { key: 'pt', value: 'Patient' },
  { key: 'dc', value: 'Doctor' },
  { key: 'lb', value: 'Laboratory' },
  { key: 'admin', value: 'Admin' },
];

const regex = {
  name: /^([A-Za-z ]{6,40})$/,
  uid: /^([A-Za-z0-9]{3,40})$/,
  did: /^([0-9]{7,10})$/,
  password: /^([\w]{6,40})$/
}

class Signup extends Component {
  state = {
    form: {
      name: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Name',
          id: 'name',
          disabled: false,
          required: true,
          errorMessage: 'Only letters. Min 6 , max 40 letters'
        },
        error: false
      },
      uid: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Username',
          id: 'uid',
          disabled: false,
          required: true,
          errorMessage: 'Only letters and numbers. Min 3 , max 40 letters'
        },
        error: false
      },
      did: {
        value: '',
        config: {
          element: 'input',
          type: 'number',
          label: 'ID Number',
          id: 'did',
          disabled: false,
          required: true,
          errorMessage: 'Only numbers. Min 7 , max 10 numbers'
        },
        error: false
      },
      password: {
        value: '',
        config: {
          element: 'input',
          type: 'password',
          label: 'Password',
          id: 'password',
          disabled: false,
          required: true,
          errorMessage: 'Min 6 , max 40 characters'
        },
        error: false
      },
      userType: {
        value: '',
        config: {
          element: 'select',
          label: 'User Type',
          id: 'userType',
          options: options,
          disabled: false,
          required: true,
          errorMessage: 'Please select a value'
        },
        error: false
      }
    },
    loading: false,
    formDialog: false,
    key: ''
  }

  validateInput(input, value) {
    let reg = regex[input];
    return reg.test(value);
  }

  validateForm() {
    let formIsValid = true, inputIsValid = true;
    for (let inputIdentifier in this.state.form) {
      inputIsValid = this.state.form[inputIdentifier].value !== "";
      /*if (!inputIsValid && regex[inputIdentifier]) {
        this.validateInput(inputIdentifier, "")
      }*/
      formIsValid  = inputIsValid && formIsValid;
    }
    console.log(formIsValid ? 'OK' : 'Fill out the form');
    return formIsValid;
  }

  inputChanged = (evt, id) => {
    const updatedForm = {
      ...this.state.form
    }

    const updatedFormElement = {
      ...updatedForm[id]
    }

    updatedFormElement.value = evt.target.value;
    updatedFormElement.error = regex[id] ? !this.validateInput(id, evt.target.value) : false;
    updatedForm[id] = updatedFormElement;
    this.setState({ form: updatedForm }); 
  }


  buttonClicked = () => {
    if (this.validateForm()) {
      const name = this.state.form["name"].value;
      const uid = this.state.form["uid"].value;
      const did = this.state.form["did"].value;
      const password = this.state.form["password"].value;
      const userType = this.state.form["userType"].value;
      if (userType === 'pt' && !localStorage.getItem('key')) {
        this.setState({formDialog: true});
      } else {
        const keyPair = window.forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
        const publicKeyPem = window.forge.pki.publicKeyToPem(keyPair.publicKey);
        const privateKeyPem = window.forge.pki.privateKeyToPem(keyPair.privateKey);
        registerAgent(name, uid, did, password, userType, uid + "*" + password, publicKeyPem)
          .then( address => {
            localStorage.setItem('address', address);
            localStorage.setItem('privateKey', privateKeyPem);
            this.props.setAuth(true);
            this.props.history.push({
              pathname: '/',
              state: { privateKey : privateKeyPem }
            });
          })
      }
    }
  }

  handleClose = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('privateKey');
    this.setState({formDialog: false});
  }
  
  onInputChange = (evt) => this.setState({key: evt.target.value});

  onOkClick = () => {
    if (this.state.key !== '') {
      localStorage.setItem('key', this.state.key);
      this.buttonClicked();
    }
  }

  render() {
    return (
      <Auth formName="Sign Up">
        <Form 
          form={this.state.form}
          inputChanged={this.inputChanged}
          buttonLabel="Signup"
          buttonClicked={this.buttonClicked}
        />
        <FormDialog 
          open={this.state.formDialog}
          message="Please fill in the next field with your key. This is the key which will be used to encrypt your medical history. Remember, you must never change it"
          handleClose={this.handleClose}
          onInputChange={this.onInputChange}
          onOkClick={this.onOkClick}
        />
      </Auth>
    )
  }
}

export default Signup;
