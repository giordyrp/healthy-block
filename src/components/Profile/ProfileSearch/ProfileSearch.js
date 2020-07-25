import React, { Component } from 'react';

import { 
  Divider,
  CircularProgress,
  Button
 } from '@material-ui/core'

import Profile from '../Profile';

import { addRelationship, getRelationshipByAddresses, getRelationships } from '../../../utils/methods';

class ProfileSearch extends Component {

  state = {
    sendingRequest: false,
    sent: false
  }

  componentDidMount() {
    getRelationshipByAddresses(this.props.item.address, this.props.agent.address)
    .then(relationship => {
      if (relationship) {
        this.setState({sent: true});
      }
    });
  }

  sendRequest() {
    const address = localStorage.getItem('address');
    //this.watchEvents();
    this.setState({ sendingRequest: true });
    addRelationship(this.props.item.address, address, "na", "nm", false, address)
      .then(hash => {
        this.setState({sendingRequest: false, sent: true})
      })
      .catch((err) => this.setState({ sendingRequest: false }));
  }

  render() {
    let requestButton = <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={()=>this.sendRequest()}
                          style={{textAlign: "center"}}
                        >
                          Request Medical History
                        </Button>;
    if (this.state.sendingRequest) {
      requestButton = <CircularProgress />
    }

    if (this.state.sent) {
      requestButton = <p>You have already sent a request to this patient</p>
    }
    return (
      <Profile {...this.props}>
        <Divider variant="middle" />
        { requestButton }
      </Profile>
    )
  }
}

export default ProfileSearch;
