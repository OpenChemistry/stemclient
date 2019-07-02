import React from 'react';

import {
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@material-ui/core';

import InstructionDialog from './instructions';

interface Props {
  apiKey: string;
  open: boolean;
  onClose: () => void;
}

const AddWorker : React.FC<Props> = ({apiKey, open, onClose}) => {
  const { protocol, hostname } = window.location;

  const command = `mpiexec -n 1 stemworker -u ${protocol}//${hostname}:5000 -k ${apiKey}`;

  return (
    <InstructionDialog
      open={open}
      command={command}
      onClose={onClose}
    >
      <DialogTitle>
        Spawn a new worker
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Run the command below to spawn a new worker that can be used to execute pipelines.
        </DialogContentText>
        <pre style={{whiteSpace: 'pre-wrap'}}>
          {command}
        </pre>
      </DialogContent>
    </InstructionDialog>
  );
}

export default AddWorker;
