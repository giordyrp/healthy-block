import React, { Component } from 'react';

import { 
  Grid, 
  Typography,
  List,
  ListItem,
  Divider,
  ListItemText 
} from '@material-ui/core';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


import Form from '../../components/UI/Form/Form';

import { 
  getMHInfo, 
  SetMHistoryAll, 
  addHaemoglobinRecord,
  addAppointment 
} from '../../utils/methods';




const regex = {
  fullName: /^([A-Za-z ]{6,40})$/,
  phoneNumber: /^([0-9]{7,10})$/,
  //haemoglobinLevel: /^([0-9]{1,3})$/
}

class MedicalHistory extends Component {
  state = {
    form: {
      fullName: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Full Name',
          id: 'fullName',
          disabled: true,
          required: false,
          errorMessage: 'Only letters. Min 3 , max 40 letters'
        },
        error: false
      },
      homeAddress: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Home Address',
          id: 'homeAddress',
          disabled: true,
          required: false,
          errorMessage: 'Min 3 , max 40 letters'
        },
        error: false
      },
      phoneNumber: {
        value: '',
        config: {
          element: 'input',
          type: 'number',
          label: 'Phone Number',
          id: 'phoneNumber',
          disabled: true,
          required: false,
          errorMessage: 'Only numbers. Min 7 , max 10 numbers'
        },
        error: false
      }
    },
    formHaemoglobin: {
      haemoglobinLevel: {
        value: '',
        config: {
          element: 'input',
          type: 'number',
          label: 'Haemoglobin Level',
          id: 'haemoglobinLevel',
          disabled: false,
          required: true,
          errorMessage: 'Only numbers. Min 1 , max 3 numbers'
        },
        error: false
      },
      date: {
        value: new Date(),
        config: {
          element: 'date',
          label: 'Date',
          id: 'date',
          disabled: false,
          required: true,
          errorMessage: 'Only numbers. Min 1 , max 3 numbers'
        },
        error: false
      }
    },
    formAppointment: {
      description: {
        value: '',
        config: {
          element: 'input',
          type: 'text',
          label: 'Description',
          id: 'description',
          multiline: true,
          rows: 4,
          disabled: false,
          required: true,
          errorMessage: 'Min 10 characters'
        },
        error: false
      },
      date: {
        value: new Date(),
        config: {
          element: 'date',
          label: 'Date',
          id: 'date',
          disabled: false,
          required: true,
          errorMessage: 'Only numbers. Min 1 , max 3 numbers'
        },
        error: false
      }
    },
    formButtonHidden : true,
    loading: false,
    haemoglobinRecords: [],
    appointments: []
  }

  componentDidMount() {
    getMHInfo(this.props.item.agent.mHistory, this.props.item.access)
      .then(mhInfo => {
        this.setElementValue('fullName', mhInfo.fullName);
        this.setElementValue('homeAddress', mhInfo.homeAddress);
        this.setElementValue('phoneNumber', mhInfo.phoneNumber);
        let appointments = mhInfo.appointments ? mhInfo.appointments : [];
        appointments.sort((a,b) => new Date(a.apDate) - new Date(b.apDate)).reverse();
        appointments = appointments.map(item => { 
          const nItem = {...item}; 
          nItem.apDate = new Date(nItem.apDate).toLocaleDateString(); 
          return nItem
        });
        this.setState({
          haemoglobinRecords: mhInfo.hemoglobinRecords, 
          appointments: appointments});

        if (this.props.item.type === 'fd') {
          this.setElementDisabled('fullName', false);
          this.setElementDisabled('homeAddress', false);
          this.setElementDisabled('phoneNumber', false);
          this.setState({formButtonHidden: false});
        }
      })
  }

  setElementDisabled(id, value) {
    const updatedElements = {
      ...this.state.form,
      [id]: {
        ...this.state.form[id],
        config: {
          ...this.state.form[id].config,
          disabled: value
        }
      }
    }
    this.setState({ form: updatedElements });
  }

  setElementValue(id, value) {
    const updatedElements = {
      ...this.state.form,
      [id]: {
        ...this.state.form[id],
        value: value
      }
    }
    this.setState({ form: updatedElements });
  }

  inputChanged = (evt, id) => {
    this.setElementValue(id, evt.target.value);
  }

  inputChangedHaemoglobin = (evt, id) => {
    const updatedElements = {
      ...this.state.formHaemoglobin,
      [id]: {
        ...this.state.formHaemoglobin[id],
        value: id === 'date' ? evt : evt.target.value
      }
    }
    this.setState({ formHaemoglobin: updatedElements });
  }

  inputChangedAppointment = (evt, id) => {
    const updatedElements = {
      ...this.state.formAppointment,
      [id]: {
        ...this.state.formAppointment[id],
        value: id === 'date' ? evt : evt.target.value
      }
    }
    this.setState({ formAppointment: updatedElements });
  }

  buttonClicked = () => { 
    SetMHistoryAll(
      this.props.item.agent.mHistory,
      this.state.form.fullName.value,
      this.state.form.homeAddress.value,
      this.state.form.phoneNumber.value,
      this.props.agent.address,
      this.props.item.agent.address
    ).then(console.log);
  }

  buttonClickedHaemoglobin = async () => { 
    await addHaemoglobinRecord(
      this.props.item.agent.mHistory,
      this.state.formHaemoglobin.haemoglobinLevel.value + '',
      this.getDate(this.state.formHaemoglobin.date.value),
      this.props.agent.address,
      this.props.item.agent.address
    );

    const mhInfo = await getMHInfo(this.props.item.agent.mHistory, this.props.item.access)
    this.setState({haemoglobinRecords: mhInfo.hemoglobinRecords});
  }

  buttonClickedAppointment = () => { 
    addAppointment(
      this.props.item.agent.mHistory,
      this.state.formAppointment.description.value,
      this.getDate(this.state.formAppointment.date.value),
      this.props.agent.name,
      this.props.agent.address,
      this.props.item.agent.address
    ).then(() => {
      
      const newAppointment = {
        mhAddress: this.props.item.agent.mHistory, 
        apDate: this.state.formAppointment.date.value.toLocaleDateString(),
        apDescription: this.state.formAppointment.description.value,
        doctor: this.props.agent.name
      };
      const appointmentsUpdated = [newAppointment, ...this.state.appointments];
      this.setState({appointments: appointmentsUpdated});
    });
  }

  getDate(date) {
    if (parseInt(new Date().toJSON().split('T')[0].split('-')[2]) - parseInt(new Date(date).toJSON().split('T')[0].split('-')[2]) === 1) {
      return new Date().toJSON();
    } else {
      return new Date(date).toJSON().split('T')[0] + 'T' + new Date().toJSON().split('T')[1];
    }
  }

  render() {

    let addHaemoglobinRecord = null;
    if (this.props.agent.aType === 'lb' && this.props.item.access === 'fa') {
      addHaemoglobinRecord = <Form
                                form={this.state.formHaemoglobin}
                                inputChanged={this.inputChangedHaemoglobin}
                                buttonLabel="Add"
                                buttonClicked={this.buttonClickedHaemoglobin}
                              />
    }

    let addAppointment = null;
    if (this.props.agent.aType === 'dc' && this.props.item.access === 'fa') {
      addAppointment =  <Form
                          form={this.state.formAppointment}
                          inputChanged={this.inputChangedAppointment}
                          buttonLabel="Save"
                          buttonClicked={this.buttonClickedAppointment}
                        />
    }

    let chart = <p>No Records</p>;
    if (this.state.haemoglobinRecords.length > 0) {
        chart = <div>
                  <Grid style={{ height: 400, overflow: 'auto', maxWidth: 800 }} >
                    <ResponsiveContainer>
                      <LineChart
                        data={this.state.haemoglobinRecords}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}

                      >
                        <XAxis dataKey="x" name="Date"  angle={-45} textAnchor="end" tick={{fontSize: 12}} height={80}/>
                        <YAxis type={this.props.item.access == "rg" ? "category" : "number"} domain={[2, 20]}/>
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend verticalAlign="top"/>
                        <Line
                          type="monotone"
                          dataKey="y"
                          name="Level"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        /> 
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                  
                </div>
      }

    let appointments = <p>No Appointments</p>;
    if (this.state.appointments.length > 0) {
      appointments = this.state.appointments.map((item, index) => {
        let app = <ListItem key={item.apDate + index} alignItems="flex-start">
                      <ListItemText
                        primary={item.apDate}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              //className={classes.inline}
                              color="textPrimary"
                            >
                              {`${item.doctor} - `}
                            </Typography>
                            {item.apDescription}
                          </React.Fragment>
                        }
                      />
                    </ListItem>;
        if (index < (this.state.appointments.length-1)) app =  [app, <Divider component="li" />];
        return app;
      })
      
      appointments =  <List >
                        {appointments}
                      </List>
    }
    

    


    return (
      <div>
        <Typography variant="h6">Basic Information</Typography>
        <Form
          form={this.state.form}
          inputChanged={this.inputChanged}
          buttonLabel="Save"
          buttonClicked={this.buttonClicked}
          buttonHidden={this.state.formButtonHidden}
        />
        <Typography variant="h6">Appointments</Typography>
        {addAppointment}
        {appointments}
        <Typography variant="h6">Hemoglobin Records</Typography>
        {addHaemoglobinRecord}
        {chart}
      </div>
    )
  }
}

export default MedicalHistory;
