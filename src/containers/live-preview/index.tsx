import React, { Component, Fragment } from 'react';

import { StreamImageDataSource } from '../../stem-image/data';
import STEMImage from '../../components/stem-image';
import { StreamSourceOptions } from '../../stem-image/types';

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

    const options: StreamSourceOptions = {
      url: serverUrl,
      room: 'bright',
      sizeEvent: 'stem.size',
      dataEvent: 'stem.bright'
    }

    const [connected, disconnected] = this.dataSource.connect(options);

    connected.then(() => {
      this.setState((state: State) => {
        state.connected = true;
        state.connecting = false;
        state.socket = null;
        return state;
      });
    });

    disconnected.then(() => {
      this.setState((state: State) => {
        state.connected = false;
        state.connecting = false;
        state.socket = null;
        return state;
      });
    });
  }

  stopPreview() {
    this.dataSource.disconnect();
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
