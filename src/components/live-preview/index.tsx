import React, { Component, Fragment } from 'react';
import { VIRIDIS } from '@colormap/presets';
import { Button, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';

import { StreamImageDataSource } from '../../stem-image/data';
import { StreamConnection } from '../../stem-image/connection';
import STEMImage from '../stem-image';
import FormComponent from './form';
import { composeValidators, requiredValidator, integerValidator } from '../../utils/forms';
import StatusBar from './status';

const styles = (theme: Theme) => createStyles({
  root: {
    textAlign: 'center'
  },
  row: {
    marginBottom: theme.spacing(2)
  },
  imageContainer: {
    display: 'flex'
  },
  image: {
    width: '50%'
  }
});

interface Props extends WithStyles<typeof styles> {
  loggedIn: boolean;
}

interface State {
  connected: boolean;
  connecting: boolean;
  fieldValues: {[fieldName: string]: string};
  workers: string[];
  open: boolean;
  pipelineId: string;
}

interface Pipeline {
  pipelineId: string;
  workerId: string
}

class LivePreviewComponent extends Component<Props> {
  state: State = {
    connected: false,
    connecting: false,
    fieldValues: {},
    workers: [],
    open: false,
    pipelineId: ''
  }
  connection: StreamConnection;
  brightSource: StreamImageDataSource;
  darkSource: StreamImageDataSource;

  constructor(props: Props) {
    super(props);
    this.connection = new StreamConnection();
    this.brightSource = new StreamImageDataSource();
    this.brightSource.setConnection(this.connection, 'stem.size', 'stem.pipeline.executed');
    this.darkSource = new StreamImageDataSource();
    this.darkSource.setConnection(this.connection, 'stem.size', 'stem.dark');
    this.generateImage = this.generateImage.bind(this);
    this.onReceiveWorkers = this.onReceiveWorkers.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.connection.subscribe('stem.workers', this.onReceiveWorkers);
    this.onPipelineCreated = this.onPipelineCreated.bind(this);
    this.connection.subscribe('stem.pipeline.created', this.onPipelineCreated);
    this.onPipelineExecuted = this.onPipelineExecuted.bind(this);
    this.connection.subscribe('stem.pipeline.executed', this.onPipelineExecuted);
  }

  componentDidMount() {
    this.onLoginChange();
  }

  componentDidUpdate(prevProps: Props) {
    const { loggedIn } = this.props;
    if (loggedIn !== prevProps.loggedIn) {
      this.onLoginChange();
    }
  }

  componentWillUnmount() {
    this.connection.unsubscribe('stem.worker', this.onReceiveWorkers);
  }

  onLoginChange() {
    const { loggedIn } = this.props;
    if (loggedIn) {
      this.connectSocket();
    }
  }

  connectSocket() {
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
        state.workers = [];
        return state;
      });
    });
  }

  onReceiveWorkers(workers: string[]) {
    this.setState((state: State) => {
      state.workers = workers;
      return state;
    });
  }

  onPipelineCreated(pipeline: Pipeline) {
    const executeParams = {
      pipelineId: pipeline.pipelineId,
      workerId: pipeline.workerId,
      params: this.state.fieldValues
    }
    this.setState((state: State) => {
      state.pipelineId = pipeline.pipelineId;

      return state;
    });

    this.connection.socket.emit('stem.pipeline.execute', executeParams);
  }

  onPipelineExecuted(result: any) {
    const deleteParams = {
      pipelineId: this.state.pipelineId,
    }
    if (result.rank == 0) {
      this.connection.socket.emit('stem.pipeline.delete', deleteParams);
    }
  }


  disconnectSocket() {
    this.connection.disconnect();
  }

  generateImage(params: {[name: string]: any}) {
    this.setState((state: State) => {
      state.fieldValues = {...params};
      return state;
    })
    // For now we just pick the first worker.
    const workerId = Object.keys(this.state.workers)[0];
    // For now just run annular pipeline.
    const createParams = {
            name: 'annular',
            workerId
    };
    // Reset the the image.
    this.connection.emit('stem.size', {width: 1, height: 1});
    this.connection.socket.emit('stem.pipeline.create', createParams);

  }

  render() {
    const { classes } = this.props;
    const {connected, connecting, workers, open, fieldValues} = this.state;
    const fields = [
      {name: 'path', label: 'File Path', initial: undefined, validator: composeValidators(requiredValidator)},
      {name: 'centerX', label: 'Center X', initial: undefined, validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
      {name: 'centerY', label: 'Center Y', initial: undefined, validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
      {name: 'minRadius', label: 'Min Radius', initial: undefined, validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
      {name: 'maxRadius', label: 'Max Radius', initial: undefined, validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'}
    ];

    const initialValues = fields.reduce((total: {[name: string]: string | undefined}, {name, initial}) => {
      if (fieldValues[name] !== undefined) {
        total[name] = fieldValues[name];
      } else if (initial !== undefined) {
        total[name] = initial;
      }
      return total;
    }, {});

    return (
      <div className={classes.root}>
        <div className={classes.row}>
          <StatusBar
            serverStatus={connecting ? 'pending' : connected ? 'online' : 'offline'}
            workerStatus={workers.length > 0 ? 'online' : 'offline'}
            onServerRefresh={this.connectSocket}
          />
        </div>
        <Button
          className={classes.row}
          variant='contained' color='secondary' disabled={workers.length < 1}
          onClick={() => {this.setState({open: true})}}
        >
          Generate Image
        </Button>
        <Dialog open={open} onClose={() => {this.setState({open: false})}}>
          <DialogTitle>Generate Image</DialogTitle>
          <DialogContent>
            <FormComponent fields={fields} initialValues={initialValues} disabled={workers.length < 1} onSubmit={(values) => {this.setState({open: false}); this.generateImage(values)}}/>
          </DialogContent>
        </Dialog>
        {connected &&
        <Fragment>
          <div className={classes.imageContainer}>
            <div className={classes.image}>
              <STEMImage source={this.brightSource} colors={VIRIDIS}/>
            </div>
            <div className={classes.image}>
              <STEMImage source={this.darkSource} colors={VIRIDIS}/>
            </div>
          </div>
        </Fragment>
        }
      </div>
    )
  }
}

export default withStyles(styles)(LivePreviewComponent);
