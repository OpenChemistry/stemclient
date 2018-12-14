import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


import STEMImage from './STEMImage.js'
import openSocket from 'socket.io-client';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.socket = openSocket('http://localhost:5000/stem');
    this.socket.on('connect', () => {
      console.log('connected');
    });

    this.socket.on('stem', (data) => {
      this.setState(data);
    })
  }

  render() {
    console.log(this.state.data);
    return (
      <div className="App">
        <STEMImage data={this.state.data} />
      </div>
    );
  }
}

export default App;
