import React, { Component } from 'react';
import './App.css';


import STEMImage from './STEMImage.js'
import openSocket from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.images = 1;
  }

  componentDidMount() {
    this.socket = openSocket(`${window.origin}/stem`, {transports: ['websocket']});


    this.socket.on('connect', (socket) => {
      this.socket.emit('subscribe', 'bright');

    });

    this.socket.on('stem.bright', (msg) => {
      const pixelValues = new Float64Array(msg.data.values);
      const pixelIndexes = new Uint32Array(msg.data.indexes);

      // Aggregate the values
      for(let i=0; i<pixelValues.length; i++) {
        this.stemData[pixelIndexes[i]] = pixelValues[i];
      }

      // Once we have aggregated all the values set the state so the STEMImage
      // gets generated.
      if (this.images === 32) {
        this.setState({
          data: this.stemData
        });
      }

      this.images +=1;
    })

    this.socket.on('stem.size', (msg) => {
      const {width, height}  = msg;
      if (width !== this.state.width || height !== this.state.height) {
        this.stemData = new Float64Array(width*height);
        this.setState({
          width,
          height
        });
      }
    });
  }

  render() {
    return (
      <div className="App">
        <STEMImage
          data={this.state.data}
          width={this.state.width}
          height={this.state.height} />
      </div>
    );
  }
}

export default App;
