import React, { Component } from 'react';

import { Grid} from '@material-ui/core'

import Auth from '../../components/Auth/Auth';
import Form from '../../components/UI/Form/Form';
import FormDialog from '../../components/UI/FormDialog/FormDialog';

import { Link } from 'react-router-dom';


import {getAgentByPhrase, getAgentByAddress} from '../../utils/methods';

const regex = {
  uid: /^([A-Za-z0-9]{3,40})$/,
  password: /^([\w]{6,40})$/
}

class Login extends Component {
  state = {
    form: {
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
      privateKey: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Private Key',
          id: 'privateKey',
          disabled: false,
          required: true,
          errorMessage: ''
        },
        error: false
      }
    },
    loading: false,
    formError: false,
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
    this.setState({formError: false});
    if (this.validateForm()) {
      getAgentByPhrase(this.state.form['uid'].value + '*' + this.state.form['password'].value , "0xb8343c44CEb836B2432CA733072996feBCd3cBCC")
      .then( async address => {
        console.log(address);
        if (address !== "0x0000000000000000000000000000000000000000") {
        const agent = await getAgentByAddress(address);
        const privateKeyIsValid = await this.verifyPrivateKey(agent.publicKey, this.state.form.privateKey.value);
        console.log(privateKeyIsValid);
        localStorage.setItem("address", address);
        localStorage.setItem('privateKey', this.state.form.privateKey.value);
        if (privateKeyIsValid) {
          this.setState({formError: false});
          if (agent.aType === 'pt') {
            this.setState({formDialog: true});
          } else {
            this.props.setAuth(true);
            this.props.history.push('/');
          }
        } else {
          this.setState({formError: true});
        }

        }
      })
      .catch(console.log);
    } else {
      this.setState({formError: true});
    }  
  }

  async verifyPrivateKey(publicKeyPem, privateKeyPem) {
    let verified = false;
    try {
      const publicKey = window.forge.pki.publicKeyFromPem(publicKeyPem);
      const privateKey = window.forge.pki.privateKeyFromPem(privateKeyPem);
      const md = window.forge.md.sha1.create();
      md.update('sign this', 'utf8');
      const signature = privateKey.sign(md);
      const mdBytes = md.digest().bytes();
      verified = publicKey.verify(mdBytes, signature);
      
    } catch (error) {
      this.setState({formError: true});
    }
    return verified;
  }
  
  handleClose = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('privateKey');
    this.setState({formDialog: false});
  }
  
  onInputChange = (evt) => this.setState({key: evt.target.value});

  onOkClick = () => {
    localStorage.setItem('key', this.state.key);
    this.props.setAuth(true);
    this.props.history.push('/');
  }

  render() {
    return (
      <Auth formName="Log in">
        <Form 
          form={this.state.form}
          inputChanged={this.inputChanged}
          buttonLabel="Login"
          buttonClicked={this.buttonClicked}
          error={this.state.formError}
          errorMessage="Something is wrong. Please verify your username, password or private key"
        />
        <Grid 
          container
          alignItems="center"
          justify="center"
        >
          <Grid item >
            <Link to="/signup" variant="body2" >
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
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

export default Login;
