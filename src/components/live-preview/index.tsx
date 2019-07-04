import React, { Component, Fragment } from 'react';
import { VIRIDIS } from '@colormap/presets';
import { Button } from '@material-ui/core';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';

import { StreamImageDataSource } from '../../stem-image/data';
import { StreamConnection } from '../../stem-image/connection';
import STEMImage from '../stem-image';
import FormComponent from './form';
import { composeValidators, requiredValidator, integerValidator } from '../../utils/forms';
import StatusBar from './status';
import Dialog from './dialog';
import AddWorker from './add-worker';

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
  apiKey: string;
}

interface State {
  connected: boolean;
  connecting: boolean;
  fieldValues: {[fieldName: string]: string};
  workers: Workers;
  openPipelineForm: boolean;
  openAddWorker: boolean;
  pipelineId: string;
  selectedWorker: string;
  selectedPipeline: string;
}

interface Pipeline {
  name: string;
  description: string;
  displayName: string;
}

interface Worker {
  pipelines: {[pipelineName: string]: Pipeline};
  ranks: {[rank: number]: string};
}

export interface Workers {
  [workerId: string]: Worker;
}

interface PipelineCreatedReply {
  id: string,
  pipelineId: string;
  workerId: string
}

class LivePreviewComponent extends Component<Props> {
  state: State = {
    connected: false,
    connecting: false,
    fieldValues: {},
    workers: {},
    openPipelineForm: false,
    openAddWorker: false,
    pipelineId: '',
    selectedWorker: 'none',
    selectedPipeline: 'none'
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
    this.onWorkerChange = this.onWorkerChange.bind(this);
    this.onPipelineChange = this.onPipelineChange.bind(this);
    this.onAddWorker = this.onAddWorker.bind(this);
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
        state.workers = {};
        return state;
      });
    });
  }

  onReceiveWorkers(workers: Workers) {
    let { selectedWorker, selectedPipeline } = this.state;
    if (!workers[selectedWorker]) {
      const workerIds = Object.keys(workers);
      selectedWorker = workerIds.length > 0 ? workerIds[0] : 'none';
    }

    if (!workers[selectedWorker] || !workers[selectedWorker].pipelines) {
      selectedPipeline = 'none';
    } else if (!workers[selectedWorker].pipelines[selectedPipeline]) {
      const pipelineIds = Object.keys(workers[selectedWorker].pipelines);
      selectedPipeline = pipelineIds.length > 0 ? pipelineIds[0] : 'none';
    }

    this.setState((state: State) => {
      state.workers = workers;
      state.selectedWorker = selectedWorker;
      state.selectedPipeline = selectedPipeline;
      return state;
    });
  }

  onWorkerChange(workerId: string) {
    this.setState((state: State) => {
      state.selectedWorker = workerId;
      return state;
    });
  }

  onPipelineChange(pipelineName: string) {
    this.setState((state: State) => {
      state.selectedPipeline = pipelineName;
      return state;
    });
  }

  onAddWorker() {
    this.setState({openAddWorker: true});
  }

  onPipelineCreated(pipeline: PipelineCreatedReply) {
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
    const { selectedWorker, selectedPipeline } = this.state;
    this.setState((state: State) => {
      state.fieldValues = {...params};
      return state;
    })

    const createParams = {
            // Use the client id as a correlation id
            id: this.connection.socket.io.engine.id,
            name: selectedPipeline,
            workerId: selectedWorker
    };
    // Reset the the image.
    this.connection.emit('stem.size', {width: 1, height: 1});
    this.connection.socket.emit('stem.pipeline.create', createParams);

  }

  render() {
    const { classes, apiKey } = this.props;
    const {
      connected, connecting, workers, fieldValues,
      selectedWorker, selectedPipeline, openPipelineForm, openAddWorker
    } = this.state;
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
            workers={workers}
            onServerRefresh={this.connectSocket}
            selectedWorker={selectedWorker}
            onWorkerChange={this.onWorkerChange}
            onAddWorker={this.onAddWorker}
            selectedPipeline={selectedPipeline}
            onPipelineChange={this.onPipelineChange}
          />
        </div>
        <Button
          className={classes.row}
          variant='contained' color='secondary' disabled={Object.keys(workers).length < 1}
          onClick={() => {this.setState({openPipelineForm: true})}}
        >
          Generate Image
        </Button>
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
        <Dialog open={openPipelineForm} onClose={() => {this.setState({openPipelineForm: false})}} title='Generate Image'>
          <FormComponent fields={fields} initialValues={initialValues} disabled={Object.keys(workers).length < 1} onSubmit={(values) => {this.setState({openPipelineForm: false}); this.generateImage(values)}}/>
        </Dialog>
        <AddWorker open={openAddWorker} onClose={() => {this.setState({openAddWorker: false})}} apiKey={apiKey}/>
      </div>
    )
  }
}

export default withStyles(styles)(LivePreviewComponent);
