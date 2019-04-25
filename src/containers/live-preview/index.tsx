import React, { Component, Fragment } from 'react';

import openSocket from 'socket.io-client';
import { StreamImageDataSource } from '../../stem-image/data';
import STEMImage from '../../components/stem-image';

interface Props {
}

interface State {
  connected: boolean;
  connecting: boolean;
  socket: any;
  serverUrl: string;
}

export default class LivePreviewContainer extends Component<Props> {
  state: State = {
    connected: false,
    connecting: false,
    socket: null,
    serverUrl: `${window.origin}/stem`
  }
  dataSource = new StreamImageDataSource();

  startPreview() {
    this.setState((state: State) => {
      state.connecting = true;
      return state;
    });

    const {serverUrl} = this.state;

    const socket = openSocket(serverUrl, {transports: ['websocket']});

    socket.on('connect', () => {
      socket.emit('subscribe', 'bright');
      this.setState((state: State) => {
        state.connected = true;
        state.connecting = false;
        state.socket = socket;
        return state;
      });
    });

    socket.on('disconnect', () => {
      socket.destroy();
      this.setState((state: State) => {
        state.connected = false;
        state.connecting = false;
        state.socket = null;
        return state;
      });
    });

    socket.on('stem.size', (msg: any) => {
      let {width, height} = msg;
      width = parseInt(width);
      height = parseInt(height);
      this.dataSource.setImageSize({width, height});
    });

    socket.on('stem.bright', (msg: any) => {
      let {values, indexes} = msg.data;
      values = new Float64Array(values);
      indexes = new Uint32Array(indexes);
      this.dataSource.updateImageChunk({indexes, values});
    });

    socket.on('error', (msg: any) => {
      console.log("SOCKET ERROR", msg);
    });
  }

  stopPreview() {
    const {socket} = this.state;
    if (socket) {
      socket.disconnect();
    }
  }

  render() {
    const {connected, connecting, serverUrl} = this.state;
    return (
      <Fragment>
        <input
          disabled={connected || connecting}
          value={serverUrl}
          onChange={(e) => {this.setState({serverUrl: e.target.value})}}
        />
        <button
          onClick={() => {connected ? this.stopPreview() : this.startPreview()}}
          disabled={connecting}
        >
          {connected ? 'Stop' : 'Start'}
        </button>
        {connected &&
        <div style={{width: '50%'}}>
          <STEMImage source={this.dataSource}/>
        </div>
        }
      </Fragment>
    )
  }
}
