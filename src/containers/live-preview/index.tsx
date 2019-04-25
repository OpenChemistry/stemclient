import React from 'react';

import STEMImage from '../../components/stem-image'
import openSocket from 'socket.io-client';

interface Props {

}

interface State {
  data?: Float64Array;
  width?: number;
  height?: number;
}

class App extends React.Component<Props, State> {
  stemData: Float64Array = new Float64Array(1);
  socket: any;
  images: number = 1;
  state: State = {
    data: undefined,
    width: undefined,
    height: undefined
  };

  componentDidMount() {
    const {hostname, protocol} = window.location;
    this.socket = openSocket(`${protocol}//${hostname}:5000/stem`, {transports: ['websocket']});
    // this.socket = openSocket(`${window.origin}/stem`, {transports: ['websocket']});

    this.socket.on('connect', () => {
      this.socket.emit('subscribe', 'bright');
    });

    this.socket.on('stem.bright', (msg: any) => {
      console.log('DATA');
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

    this.socket.on('stem.size', (msg: any) => {
      console.log('SIZE');
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
