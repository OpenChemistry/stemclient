import React, { Component } from 'react';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';

import { StreamImageDataSource, ImageDataSource } from '../../stem-image/data';
import { StreamConnection } from '../../stem-image/connection';
import { PipelineInfo, PipelineCreationData, PipelineExecutionData, PipelineName } from '../../stem-image/pipelines';
import FormComponent from './form';
import { makeFormFields, ServerField, FormField } from '../../utils/forms';
import StatusBar from './status';
import Dialog from './dialog';
import AddWorker from './add-worker';
import SplitButton from '../split-button';

export enum ButtonOptions {
  GenerateImage = "generate-image",
  SelectParameters = 'select-parameters'
}

const ButtonOptionsLabels = {
  [ButtonOptions.GenerateImage]: 'Generate Image',
  [ButtonOptions.SelectParameters]: 'Select Parameters'
};

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

export type PipelineCreatedCallback = (pipelineId: string, workerId: string, name: string, pipelineInfo: PipelineInfo, parameters: {[name: string]: any}) => void;
export type PipelineExecutedCallback = (pipelineId: string, workerId: string, rank: number, pipelineInfo: PipelineInfo, previewSource: ImageDataSource) => void;
export type PipelineCompletedCallback = (pipelineId: string, workerId: string, rank: number, pipelineInfo: PipelineInfo, previewSource: ImageDataSource) => void;

interface RenderProps {
  previewSource: ImageDataSource;
  values: {[fieldName: string]: string | undefined};
  setValues: (values: {[fieldName: string]: string}) => void;
  pipeline: string;
  executing: boolean;
}

interface Props extends WithStyles<typeof styles> {
  loggedIn: boolean;
  apiKey: string;
  render: React.FC<RenderProps>;
  extraFields?: {[name: string]: FormField},
  extraValues?: {[name: string]: any}
  onCreated?: PipelineCreatedCallback;
  onExecuted?: PipelineExecutedCallback;
  onCompleted?: PipelineCompletedCallback;
  defaultGenerateOption: ButtonOptions;
  generateOptions: ButtonOptions[];
}

interface State {
  connected: boolean;
  connecting: boolean;
  executing: boolean;
  fieldValues: {[fieldName: string]: string};
  workers: Workers;
  openPipelineForm: boolean;
  openAddWorker: boolean;
  pipelineId: string;
  selectedWorker: string;
  selectedPipeline: string;
  currentGenerateOption: ButtonOptions;
}

interface Worker {
  pipelines: {[pipelineName: string]: PipelineInfo};
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

class PipelineWrapper extends Component<Props, State> {
  static defaultProps = {
    defaultGenerateOption: ButtonOptions.SelectParameters,
    generateOptions: [ButtonOptions.SelectParameters, ButtonOptions.GenerateImage]
  };

  connection: StreamConnection;
  source: StreamImageDataSource;
  anchorRef: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      connected: false,
      connecting: false,
      executing: false,
      fieldValues: {},
      workers: {},
      openPipelineForm: false,
      openAddWorker: false,
      pipelineId: '',
      selectedWorker: 'none',
      selectedPipeline: 'none',
      currentGenerateOption: props.defaultGenerateOption
    }

    this.connection = new StreamConnection();
    this.source = new StreamImageDataSource();
    this.source.setConnection(this.connection, 'stem.size', 'stem.pipeline.executed');
    this.generateImage = this.generateImage.bind(this);
    this.onReceiveWorkers = this.onReceiveWorkers.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.connection.subscribe('stem.workers', this.onReceiveWorkers);
    this.onPipelineCreated = this.onPipelineCreated.bind(this);
    this.connection.subscribe('stem.pipeline.created', this.onPipelineCreated);
    this.onPipelineCompleted = this.onPipelineCompleted.bind(this);
    this.connection.subscribe('stem.pipeline.completed', this.onPipelineCompleted);
    this.onPipelineExecuted = this.onPipelineExecuted.bind(this);
    this.onWorkerChange = this.onWorkerChange.bind(this);
    this.onPipelineChange = this.onPipelineChange.bind(this);
    this.onAddWorker = this.onAddWorker.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.setValues = this.setValues.bind(this);
    this.source.subscribe('stem.pipeline.executed', this.onPipelineExecuted);
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
    this.connection.unsubscribe('stem.pipeline.created', this.onPipelineCreated);
    this.connection.unsubscribe('stem.pipeline.completed', this.onPipelineCompleted);
    this.source.unsubscribe('stem.pipeline.executed', this.onPipelineExecuted);
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

  onPipelineCreated(pipeline: PipelineCreationData) {
    const { extraValues } = this.props;
    const { pipelineId, workerId, name, info } = pipeline;
    const executeParams = {
      pipelineId,
      workerId,
      params: {...(extraValues || {}), ...this.state.fieldValues}
    }
    this.setState((state: State) => {
      state.pipelineId = pipelineId;
        state.executing = true;
      return state;
    });

    this.connection.socket.emit('stem.pipeline.execute', executeParams);

    const { onCreated } = this.props;
    if (onCreated) {
      onCreated(pipelineId, workerId, name, info, {...this.state.fieldValues});
    }
  }

  onPipelineExecuted(executedData: PipelineExecutionData) {
    const { pipelineId, rank, workerId, info } = executedData;

    const { onExecuted } = this.props;
    if (onExecuted) {
      onExecuted(pipelineId, workerId, rank, info, this.source);
    }
  }

  onPipelineCompleted(completedData: PipelineExecutionData) {
    const { pipelineId, rank, workerId, info } = completedData;

    const deleteParams = {
      pipelineId,
    }

    this.setState((state: State) => {
      state.executing = false;
      return state;
    });
    this.connection.socket.emit('stem.pipeline.delete', deleteParams);

    const { onCompleted } = this.props;
    if (onCompleted) {
      onCompleted(pipelineId, workerId, rank, info, this.source);
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

  onSelectGenerateOption(option: ButtonOptions) {
    this.setState({currentGenerateOption: option});
  }

  onClickGenerateOption(params: {[name: string]: any}) {
    switch (this.state.currentGenerateOption) {
      case ButtonOptions.GenerateImage: {
        this.generateImage(params);
        break;
      }
      case ButtonOptions.SelectParameters: {
        this.setState({openPipelineForm: true})
        break;
      }
    }
  }

  render() {
    const { classes, apiKey, render, extraFields, generateOptions } = this.props;
    const {
      connected, connecting, executing, workers, fieldValues,
      selectedWorker, selectedPipeline, openPipelineForm, openAddWorker,
      currentGenerateOption
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

        <SplitButton
          options={generateOptions.reduce((cumulated, option) => {
            cumulated[option] = ButtonOptionsLabels[option];
            return cumulated;
          }, {} as {[key: string]: string})}
          value={currentGenerateOption}
          onChange={(value) => {this.onSelectGenerateOption(value as ButtonOptions)}}
          onClick={() => {this.onClickGenerateOption(values)}}
        />

        {render({
          previewSource: this.source,
          values,
          executing,
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
