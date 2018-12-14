import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


import STEMImage from './STEMImage.js'
import openSocket from 'socket.io-client';

const NUMBER_OF_PIXELS = 160*160;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.stemData = new Float64Array(NUMBER_OF_PIXELS);
    this.images = 1;
  }

  componentDidMount() {
    this.socket = openSocket('http://localhost:5000/stem');
    this.socket.on('connect', () => {
      console.log('Connected');
    });

    this.socket.on('stem', (msg) => {
      const stemData = new Float64Array(msg.data);

      // Aggregate the values
      for(let i=0; i<NUMBER_OF_PIXELS; i++) {
        this.stemData[i] += stemData[i];
      }

      // Once we have aggregated all the values set the state so the STEMImage
      // gets generated.
      if (this.images == 32) {
        this.setState({
          data: this.stemData
        });
      }

      this.images +=1;
    })
  }

  render() {
    return (
      <div className="App">
        <STEMImage data={this.state.data} />
      </div>
    );
  }
}

export default App;
