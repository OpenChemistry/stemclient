import React from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { red, green, yellow, grey } from '@material-ui/core/colors';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';

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
  workerStatus: ConnectionStatus;
  onWorkerRefresh?: () => void;
}

const StatusBar : React.FC<Props> = ({serverStatus, workerStatus, onServerRefresh, onWorkerRefresh, classes}) => {
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
        <Typography component='span'>Worker: {formatStatus(workerStatus)}</Typography>
        {onWorkerRefresh &&
        <IconButton onClick={onWorkerRefresh} disabled={workerStatus !== 'offline'} size='small'>
          <RefreshIcon fontSize='inherit' />
        </IconButton>
        }
      </div>
    </div>
  );
};

export default withStyles(styles)(StatusBar);
