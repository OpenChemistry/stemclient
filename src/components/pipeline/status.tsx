import React from 'react';
import { Typography, IconButton, Select, MenuItem } from '@material-ui/core';
import { red, green, yellow, grey } from '@material-ui/core/colors';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import { Workers } from '.';

type ConnectionStatus = 'online' | 'offline' | 'pending';

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2)
  },
  online: {
    color: green[500]
  },
  offline: {
    color: red[500]
  },
  pending: {
    color: yellow[500]
  },
  unknown: {
    color: grey[500]
  }  
});

interface Props extends WithStyles<typeof styles> {
  serverStatus: ConnectionStatus;
  onServerRefresh?: () => void;
  workers: Workers;
  selectedWorker: string;
  onAddWorker?: () => void;
  onWorkerChange?: (workerId: string) => void;
  selectedPipeline: string;
  onPipelineChange?: (pipelineName: string) => void;
}

const StatusBar : React.FC<Props> = ({
  serverStatus, onServerRefresh, classes,
  workers, selectedWorker, selectedPipeline,
  onWorkerChange, onPipelineChange, onAddWorker
}) => {
  const formatStatus = (status: ConnectionStatus) => {
    let className: string;
    let label: string;

    switch(status) {
      case 'online': {
        className = classes.online;
        label = 'Online';
        break;
      }
      case 'offline': {
        className = classes.offline;
        label = 'Offline';
        break;
      }
      case 'pending': {
        className = classes.pending;
        label = 'Pending';
        break;
      }
      default: {
        className = classes.unknown;
        label = 'Unknown';
      }
    }

    return (<span className={className}>{label}</span>)
  }

  const pipelines = workers[selectedWorker] ? workers[selectedWorker].pipelines || {} : {};

  const onSelectChange = (callback: undefined | ((value: string) => void)) : React.ChangeEventHandler<{
      name?: string | undefined;
      value: unknown;
  }> => {
    return (e) => {
      if (callback) {
        callback(e.target.value as string);
      }
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.item}>
        <Typography component='span'>Server: {formatStatus(serverStatus)}</Typography>
        {onServerRefresh &&
        <IconButton onClick={onServerRefresh} disabled={serverStatus !== 'offline'} size='small'>
          <RefreshIcon fontSize='inherit' />
        </IconButton>
        }
      </div>
      <div className={classes.item}>
        <Typography component='span'>Worker:&nbsp;</Typography>
        <Select value={selectedWorker} onChange={onSelectChange(onWorkerChange)}>
            <MenuItem value="none"><em>None</em></MenuItem>
            {
              Object.entries(workers).map(([workerId, worker]) => (
                <MenuItem value={workerId} key={workerId}>
                  {`${workerId.slice(workerId.length - 6, workerId.length)} (${Object.keys(worker.ranks).length} nodes)`}
                </MenuItem>
              ))
            }
          </Select>
          {onAddWorker &&
          <IconButton onClick={onAddWorker} disabled={serverStatus !== 'online'} size='small'>
            <AddIcon fontSize='inherit' />
          </IconButton>
          }
      </div>
      <div className={classes.item}>
        <Typography component='span'>Pipeline:&nbsp;</Typography>
        <Select value={selectedPipeline} onChange={onSelectChange(onPipelineChange)}>
            <MenuItem value="none"><em>None</em></MenuItem>
            {
              Object.values(pipelines).map(({name, displayName}) => (
                <MenuItem value={name} key={name}>
                  {displayName}
                </MenuItem>
              ))
            }
          </Select>
      </div>
    </div>
  );
};

export default withStyles(styles)(StatusBar);
