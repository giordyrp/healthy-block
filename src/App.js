

import React, { Component } from 'react';

import {Route, Switch, Redirect} from 'react-router-dom';

import Signup from './containers/Signup/Signup';
import Login from './containers/Login/Login';
import Home from './components/Home/Home';


class App extends Component {
  state = {
    loading: true,
    isAuth: false
  }

  componentDidMount() {
    if (localStorage.getItem('address')) {
      this.setState({isAuth: true},() => this.setState({loading: false}));
    } else {
      this.setState({loading: false});
    }
  }

  setAuth = (bool) => {
    this.setState({isAuth: bool});
  }


  render() {

    let routes = (
      <Switch>       
        <Route path='/' render={(props) => <Home setAuth={this.setAuth} {...props}/>}/>
      </Switch>
    );

    let redirect = <Redirect to="/"/>
    if (!this.state.loading && !this.state.isAuth) {
      redirect = <Redirect to="/login"/>
    }

    if (!this.state.isAuth) {
      routes = (
        <Switch>
          <Route path='/signup' exact render={(props) => <Signup setAuth={this.setAuth} {...props}/>}/>  
          <Route path='/login' exact render={(props) => <Login setAuth={this.setAuth} {...props}/>}/>
          {redirect}
        </Switch>
      );
    }

    return routes;
  }
}




export default App;
