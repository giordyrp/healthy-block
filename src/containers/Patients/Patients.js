import React, { Component } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@material-ui/core';

import Input from '../../components/UI/Input/Input';

import { 
  getPatientsDoctors, 
  getFamilyDoctorRelationship,
  getRelationshipByAddresses,
  addRelationship,
  setOne,
  setBoth,
  setOther
 } from '../../utils/methods';

 import Modal from '../../components/UI/Modal/Modal';


class Patients extends Component {

  state = {
    patients: [], 
    doctorSelects: {},
    openPK: false,
    loading: true
  }

  componentDidMount() {
    if (this.props.location && this.props.location.state && this.props.location.state.privateKey) {
      this.toggleOpen('openPK');
    }
    getPatientsDoctors()
    .then(patsDocs => {
      const options = [];
      for (let doc of patsDocs.doctors) {
        options.push({ key: doc.address, value: doc.name });
      }

      const docSelects = {};
      let element = {}
      for (let pat of patsDocs.patients) {
        element = {
          value: pat.fdAddress,
          config: {
            element: 'select',
            label: '',
            id: 'select_' + pat.uid,
            options: options,
            disabled: false,
            required: false,
            errorMessage: 'Please select a value'
          },
          error: false
        }
        docSelects[pat.uid] = element;
      }
      this.setState({patients: patsDocs.patients, doctorSelects: docSelects, loading: false})
    });
  }

  inputChanged = (evt, id, address) => {
    const updatedElements = {
      ...this.state.doctorSelects,
      [id]: {
        ...this.state.doctorSelects[id],
        value: evt.target.value
      }
    }

    const value = evt.target.value;

    getFamilyDoctorRelationship(address).then((rsFd) => {
      getRelationshipByAddresses(address, value, 'nm').then((rsNm) => {
        if (rsFd == null && rsNm == null) {
          addRelationship(address, value, "fa", "fd", true, this.props.agent.address)
            .then(hash => {
              this.setState({ doctorSelects: updatedElements });
            });
        } else if (rsFd == null && rsNm != null) {
          setOne(rsNm.id, this.props.agent.address)
            .then(hash => {
              this.setState({ doctorSelects: updatedElements });
            });
        } else if (rsFd != null && rsNm == null) {
          setOther(rsFd.id, value, this.props.agent.address)
            .then(hash => {
              this.setState({ doctorSelects: updatedElements });
            });
        } else {
          setBoth(rsFd.id, rsNm.id, this.props.agent.address)
            .then(hash => {
              this.setState({ doctorSelects: updatedElements });
            });
        }
      });
    });

    
  }

  toggleOpen = (open) => {
    this.setState({ [open]: !this.state[open]});
  };

  render() {

    let rows = this.state.patients.map(pat => (
      <TableRow key={pat.uid}>
        <TableCell>{pat.name}</TableCell>
        <TableCell>{pat.uid}</TableCell>
        <TableCell>
          <Input
            key={pat.uid}
            value={this.state.doctorSelects[pat.uid].value} 
            error={this.state.doctorSelects[pat.uid].error}         
            inputChanged={(evt) => this.inputChanged(evt, pat.uid, pat.address)}
            {...this.state.doctorSelects[pat.uid].config}
          />
        </TableCell>
      </TableRow>
    ));

    let patientList = <div>
                          <TableContainer component={Paper}>
                          <Table aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Family Doctor</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Modal title="Private Key" maxWidth="lg" open={this.state.openPK} handleClose={() => this.toggleOpen("openPK")}>
                          <p>This is your private key : {this.props.location && this.props.location.state ? this.props.location.state.privateKey : ""}</p>
                          <p>This key is going to be asked when you log in next time.</p>
                        </Modal>
                      </div>;
    if (this.state.loading) patientList = <CircularProgress />
    return patientList;
  }
}

export default Patients;
