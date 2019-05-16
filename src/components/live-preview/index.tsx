import React, { Component, Fragment } from 'react';
import { VIRIDIS, BLACK_WHITE } from '@colormap/presets';
import { StreamImageDataSource } from '../../stem-image/data';
import { StreamConnection } from '../../stem-image/connection';
import STEMImage from '../stem-image';

interface Props {
  loggedIn: boolean;
}

interface State {
  connected: boolean;
  connecting: boolean;
}

export default class LivePreviewContainer extends Component<Props> {
  state: State = {
    connected: false,
    connecting: false
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

    const [connected, disconnected] = this.connection.connect(window.origin, 'stem');

    connected.then(() => {
      this.setState((state: State) => {
        state.connected = true;
        state.connecting = false;
        return state;
      });
    });

    disconnected.then(() => {
      this.setState((state: State) => {
        state.connected = false;
        state.connecting = false;
        return state;
      });
    });
  }

  stopPreview() {
    this.connection.disconnect();
  }

  render() {
    const {loggedIn} = this.props;
    const {connected, connecting} = this.state;
    return (
      <Fragment>
        <button
          onClick={() => {connected ? this.stopPreview() : this.startPreview()}}
          disabled={!loggedIn || connecting}
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
