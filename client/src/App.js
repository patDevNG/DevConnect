import React, { Fragment } from 'react';
import {BrowserRouter as Router, Route,Switch} from 'react-router-dom';
import Navbar from '../src/component/layout/navbar';
import Landing from '../src/component/layout/landing';
import Register from '../src/component/auth/register';
import Login from '../src/component/auth/login';
import './App.css';

const App= () => {
  return (
    <Router>
    <Fragment>
      <Navbar/>
      <Route exact path ="/" component ={Landing}/>
      <section className="container">
        <Switch>
        <Route exact path ="/register" component ={Register}/>
        <Route exact path ="/login" component ={Login}/>
        </Switch>
     
      </section>
    </Fragment>
    </Router>
  );
}

export default App;
