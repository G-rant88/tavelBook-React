import React, { Component } from "react";
import '../App.css';
import Login from './login.js';
import Cookies from 'universal-cookie';
import Nav from './nav.js';
import Footer from './footer.js';
import List from './grouplist.js';
import Chat from './groupchat.js';
import Events from './events.js';
import axios from 'axios';


const cookies = new Cookies();

class Groups extends Component {

  state ={

    mygroup: "",
    eventAdded: false,
    newGroup: false
  };


  setgroup = (group) => {

this.setState({

    mygroup: group
})



// this.forceUpdate();

  };

  addedEvent = (change) => {
    this.setState({eventAdded: change});
    // this.setState({eventAdded: false});
  }

  createdNewGroup = (change) => {
    this.setState({newGroup: change});
  }

render() { 

  return ( 

cookies.get('name') === undefined ? (<Login {...this.props}/>):(
  
<div>
  <Nav/>
  <div className ="wrapper">
    
        <h1 className ="groupText center titles">Group Hub</h1>
   
   
        <div className="row toprow">
          <div className="col s12 top borders">
          <List 
           group={this.setgroup}
           newGroup={this.createdNewGroup}/>
          <Events 
          group={this.state.mygroup}/>
          <Chat 
          group={this.state.mygroup}
          addedEvent={this.addedEvent}/>
          </div>
        </div>
      </div>
    
    <Footer/>
  </div>

     )
    );
  };

};

export default Groups;