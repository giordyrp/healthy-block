import React, { Component } from 'react';

import {Route, Switch, Redirect} from 'react-router-dom';


import Relationships from '../../containers/Relationships/Relationships';
import Search from '../../containers/Search/Search';
import MyProfile from '../../containers/MyProfile/MyProfile';
import Patients from '../../containers/Patients/Patients';
import NavBar from '../UI/NavBar/NavBar';



import { 
  withStyles, 
  Container,
  CircularProgress 
} from '@material-ui/core';

import { getAgentByAddress } from '../../utils/methods';



class Home extends Component {

  state = {
    agent: null,
    menu: [ 
      {
        name: 'Relationships',
        icon: 'insert_drive_file',
        route: 'relationships'
      },
      {
        name: 'Search',
        icon: 'search',
        route: 'search'
      },
      {
        name: 'My Profile',
        icon: 'person',
        route: 'myprofile'
      }
    ]
  }

  componentDidMount () {
    const address = localStorage.getItem('address');
    getAgentByAddress(address)
      .then( agent => {
        if (agent.aType === 'pt') {
          this.state.menu.splice(1,1);
        } else if (agent.aType === 'admin') {
          this.state.menu.splice(0,2);
          const patients = {
            name: 'Patients',
            icon: 'insert_drive_file',
            route: 'patients'
          };
          this.setState({menu: [patients, ...this.state.menu]})

        }
        this.setState({agent: agent});
      })   
  }

  menuClicked = (menuItem) => {
    this.props.history.push('/'+menuItem)
  }

  logoutClicked = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('privateKey');
    localStorage.removeItem('key');
    this.props.setAuth(false);
    this.props.history.push('/login');
  }

  render() {
    let defaultRoute = <Route path='/' render={ (props) => <Relationships agent={this.state.agent} {...props}/>}/>
    
    if (this.state.agent && this.state.agent.aType === 'admin') {
      defaultRoute = <Route path='/' render={ (props) => <Patients agent={this.state.agent} {...props}/>}/>
    }
    
    let home = (
      <NavBar 
          title="HealthyBlock"
          style={{color: 'white', fontSize: 'italic'}} 
          src={require('../../assets/images/logoTP.png')} menu={this.state.menu}
          menu={this.state.menu} 
          menuClicked={this.menuClicked}
          logoutClicked={this.logoutClicked}
          agent={this.state.agent}
        >
          <Switch>
            <Route path='/search'  exact render={ (props) => <Search agent={this.state.agent} {...props}/>}/>
            <Route path='/myprofile'  exact render={ (props) => <MyProfile agent={this.state.agent} {...props}/>}/>
            <Route path='/patients'  exact render={ (props) => <Patients agent={this.state.agent} {...props}/>}/>
            <Route path='/relationships' exact render={ (props) => <Relationships agent={this.state.agent} {...props}/>}/>
            {defaultRoute}
            <Redirect to='/'/>
          </Switch>
        </NavBar>
    );

    if (this.state.agent === null) {
      home = <CircularProgress />;
    }
    return home;
  }
}



export default Home;