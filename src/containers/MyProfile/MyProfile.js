import React, { Component } from 'react';

import {
  Card,
  CardContent,
  Grid,
  Button
} from '@material-ui/core';

import Modal from '../../components/UI/Modal/Modal';
import Profile from '../../components/Profile/Profile';
import MedicalHistory from '../MedicalHistory/MedicalHistory';

class MyProfile extends Component {
  state = {
    open: false,
    item: {}
  }

  componentDidMount() {
    const item = {};
    item.agent = this.props.agent;
    this.setState({item: item})
  }

  handleOpen = () => {
    this.setState({ open: true});
  };

  handleClose = () => {
    this.setState({ open: false});
  };


  render() {
    let myMedicalHistory = <Grid item xs={4} sm={12}>
                              <Button 
                                style={{ margin: 'auto' }} 
                                variant="contained" 
                                color="primary" 
                                onClick={this.handleOpen}
                              > My Medical History </Button>
                            </Grid>
    if (this.props.agent.aType !== 'pt') {
      myMedicalHistory = null;
    }
    return (
      <div>
        <Card style={{width: 350}}>
          <CardContent>
            <Profile item={this.props.agent} {...this.props}>
              {myMedicalHistory}
            </Profile>
          </CardContent>
        </Card>
        <Modal title="Medical History" open={this.state.open} handleClose={this.handleClose}>
          <MedicalHistory 
            agent={this.props.agent} 
            item={this.state.item}
          />
        </Modal> 
      </div>   
    )
  }
}

export default MyProfile;
