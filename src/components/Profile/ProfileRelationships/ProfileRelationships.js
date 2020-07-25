import React, { Component } from 'react';

import { 
  Divider,
  CircularProgress,
  Grid,
  Button
 } from '@material-ui/core'

import Profile from '../Profile';
import Input from '../../UI/Input/Input';
import Auxiliary from '../../../hoc/Auxiliary/Auxiliary';
import { setAccess, setActive } from '../../../utils/methods';

const options = [
  { key: 'fa', value: 'Full Access' },
  { key: 'fal', value: 'Full Altered List' },
  { key: 'pl', value: 'Patial List'},
  { key: 'rg', value: 'Range'},
  { key: 'tr', value: 'Trend'},
  { key: 'na', value: 'No Access'},
]

class ProfileRelationships extends Component {

  state = {
    elements : {
      accessType : {
        value:  this.props.item.access,
        error: false,
        disabled: false,
        config: {
          element: 'select',
          label: 'Access Type',
          id: 'accessType',
          options: options,
          errorMessage: 'Please select a value'
        }
      },
      active: {
        value: this.props.item.active,
        error: false,
        disabled: false,
        config: {
          element: 'switch',
          label: 'Active',
          id: 'active'
        }
      }
    },
    accessType: '',
    changingAccessType: false,
    active: '',
    switchingActive: false
  }

  componentDidMount() {
    if (this.props.item.type === 'fd') {
      this.setElementDisabled(
        'accessType', 
        true, 
        () => this.setElementDisabled('active', true)
      );
      ;
    }
  }

  setElementDisabled(id, value, callback) {
    const updatedElements = {
      ...this.state.elements,
      [id]: {
        ...this.state.elements[id],
        disabled: value
      }
    }
    this.setState({ elements: updatedElements }, callback);
  }

  updateValue(id, value) {
    const updatedElements = {
      ...this.state.elements,
      [id] : {
        ...this.state.elements[id],
        value: value
      }
    }
    this.setState({ elements: updatedElements }); 
  }

  inputChanged = (evt, id) => {
   const value = id === 'active' ? evt.target.checked : evt.target.value;
    const address = localStorage.getItem('address');
    if (id === 'active') {
      setActive(this.props.item.id, evt.target.checked, address)
        .then( hash => {
          this.updateValue(id, value);
        })
    } else {
      setAccess(this.props.item.id, evt.target.value, address)
        .then( hash => {
          this.updateValue(id, value);
        })
    }
    
  }


  render() {
    let accessSelect = <Input
                          value={this.state.elements.accessType.value} 
                          error={false}
                          disabled={this.state.elements.accessType.disabled}         
                          inputChanged={this.inputChanged}
                          {...this.state.elements.accessType.config}
                        />

    if (this.state.changingAccessType) {
      accessSelect = <CircularProgress />
    }

    let activeSwitch= <Input
                          value={this.state.elements.active.value} 
                          disabled={this.state.elements.active.disabled}
                          inputChanged={this.inputChanged}
                          {...this.state.elements.active.config}
                        />

    if (this.state.switchingActive) {
      activeSwitch = <CircularProgress />
    }

    let additionalActions = null;

    if (this.props.agent.aType === 'pt') {
      additionalActions = <Grid container spacing={2} direction="row" justify="center" alignItems="center">
                            <Grid item xs={4} sm={8}>
                              {accessSelect}
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              {activeSwitch}
                            </Grid>
                          </Grid>
    } else if (this.props.item.active && this.props.item.access !== 'No Access'){
      additionalActions =   <Grid container direction="row" justify="center" alignItems="center" style={{marginTop: "10px"}}>
                              <Grid item xs={12} sm={12} ls={12} style={{textAlign: 'center'}}>
                                <Button 
                                  type="button"
                                  variant="contained"
                                  color="primary" 
                                  onClick={this.props.handleOpenMH}
                                >View Medical History</Button>
                              </Grid>
                            </Grid>
    }

    if (this.props.item.type === 'fd' && this.props.agent.aType === 'dc') {
      additionalActions =   <Auxiliary >
                              <Grid container direction="row" justify="center" alignItems="center">
                                <Grid item xs={4} sm={8}>
                                  <Button 
                                    type="button"
                                    variant="contained"
                                    color="primary" 
                                    onClick={this.props.handleOpenFD}
                                  >Manage Patient's Relationships</Button>
                                </Grid>
                              </Grid>
                              {additionalActions}
                            </Auxiliary>;
    }

    return (
      <Profile {...this.props}>
        {additionalActions}
      </Profile>
    )
  }
}

export default ProfileRelationships;
