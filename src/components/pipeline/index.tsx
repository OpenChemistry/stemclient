import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';

import { StreamImageDataSource, ImageDataSource } from '../../stem-image/data';
import { StreamConnection } from '../../stem-image/connection';
import FormComponent from './form';
import { makeFormFields, ServerField, FormField } from '../../utils/forms';
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

interface RenderProps {
  source: ImageDataSource;
  values: {[fieldName: string]: string};
  setValues: (values: {[fieldName: string]: string}) => void;
  pipeline: string;
}

interface Props extends WithStyles<typeof styles> {
  loggedIn: boolean;
  apiKey: string;
  render: React.FC<RenderProps>;
  extraFields?: {[name: string]: FormField},
  extraValues?: {[name: string]: any}
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
  parameters: {[name: string]: ServerField};
}

interface Worker {
  pipelines: {[pipelineName: string]: Pipeline};
  ranks: {[rank: number]: string};
}

export interface Workers {
  [workerId: string]: Worker;
}

const pipelineParameters = (workers: Workers, workerId: string, pipelineName: string) : {[name:string]: ServerField} => {
  if (!(workerId in workers)) {
    return {};
  }
  const worker = workers[workerId];
  if (!worker.pipelines || !worker.pipelines[pipelineName]) {
    return {};
  }
  return worker.pipelines[pipelineName].parameters;
}

interface PipelineCreatedReply {
  id: string,
  pipelineId: string;
  workerId: string
}

class PipelineWrapper extends Component<Props> {
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
  source: StreamImageDataSource;

  constructor(props: Props) {
    super(props);
    this.connection = new StreamConnection();
    this.source = new StreamImageDataSource();
    this.source.setConnection(this.connection, 'stem.size', 'stem.pipeline.executed');
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
    this.onFieldChange = this.onFieldChange.bind(this);
    this.setValues = this.setValues.bind(this);
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

  onFieldChange(name: string, value: any) {
    this.setState((state: State) => {
      state.fieldValues[name] = value;
      return state;
    });
  }

  setValues(values: {[fieldName: string]: string}) {
    this.setState((state: State) => {
      state.fieldValues = {...values};
      return state;
    });
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
    const { extraValues } = this.props;
    const executeParams = {
      pipelineId: pipeline.pipelineId,
      workerId: pipeline.workerId,
      params: {...(extraValues || {}), ...this.state.fieldValues}
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
    const { classes, apiKey, render, extraFields } = this.props;
    const {
      connected, connecting, workers, fieldValues,
      selectedWorker, selectedPipeline, openPipelineForm, openAddWorker
    } = this.state;

    const fields = Object.values(extraFields || {}).concat(
      makeFormFields(pipelineParameters(workers, selectedWorker, selectedPipeline))
    );

    const values = fields.reduce((total: {[name: string]: string | undefined}, {name, initial}) => {
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
        {render({
          source: this.source,
          values,
          setValues: this.setValues,
          pipeline: selectedPipeline

        })}
        <Dialog open={openPipelineForm} onClose={() => {this.setState({openPipelineForm: false})}} title='Generate Image'>
          <FormComponent fields={fields} onChange={this.onFieldChange} values={values} disabled={Object.keys(workers).length < 1} onSubmit={(values) => {this.setState({openPipelineForm: false}); this.generateImage(values)}}/>
        </Dialog>
        <AddWorker open={openAddWorker} onClose={() => {this.setState({openAddWorker: false})}} apiKey={apiKey}/>
      </div>
    )
  }
}

export default withStyles(styles)(PipelineWrapper);
