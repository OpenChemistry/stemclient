import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {load} from './load.js';

import STEMImage from './STEMImage.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
 
  
  componentDidMount() {
    load(arrayBuffer =>
      this.setState({ data: arrayBuffer }));
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
