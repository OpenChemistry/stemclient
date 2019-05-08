import React, { Component, Fragment } from 'react';
import { VIRIDIS, BLACK_WHITE } from '@colormap/presets';
import { StreamImageDataSource } from '../../stem-image/data';
import STEMImage from '../../components/stem-image';
import { StreamConnection } from '../../stem-image/connection';

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
  connection: StreamConnection;
  brightSource: StreamImageDataSource;
  darkSource: StreamImageDataSource;

  constructor(props: Props) {
    super(props);
    this.connection = new StreamConnection();
    this.brightSource = new StreamImageDataSource();
    this.brightSource.setConnection(this.connection, 'stem.size', 'stem.bright');
    this.darkSource = new StreamImageDataSource();
    this.darkSource.setConnection(this.connection, 'stem.size', 'stem.dark');
  }

  startPreview() {
    this.setState((state: State) => {
      state.connecting = true;
      return state;
    });

    const {serverUrl} = this.state;
    const rooms = ['bright', 'dark'];

    const [connected, disconnected] = this.connection.connect(serverUrl, rooms);

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
    this.connection.disconnect();
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
        <div style={{display: 'flex'}}>
          <div style={{width: '25%'}}>
            <STEMImage source={this.brightSource} colors={BLACK_WHITE}/>
          </div>
          <div style={{width: '25%'}}>
            <STEMImage source={this.brightSource} colors={VIRIDIS}/>
          </div>
          <div style={{width: '25%'}}>
            <STEMImage source={this.darkSource} colors={BLACK_WHITE}/>
          </div>
          <div style={{width: '25%'}}>
            <STEMImage source={this.darkSource} colors={VIRIDIS}/>
          </div>
        </div>
        }
      </Fragment>
    )
  }
}
