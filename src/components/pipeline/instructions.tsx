import React from 'react';

import {
  Button,
  Dialog,
  DialogActions
} from '@material-ui/core';

interface Props {
  command: string;
  open: boolean;
  onClose: () => void;
}

const handleCopy = (event: any, text: string) => {
  const dummyEl = document.createElement('textarea');
  dummyEl.value = text;
  event.target.appendChild(dummyEl);
  dummyEl.select();
  document.execCommand('copy');
  event.target.removeChild(dummyEl);
}

const InstructionsDialog : React.FC<Props> = ({command, children, open, onClose}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
    >
      {children}
      <DialogActions>
        <Button color="secondary"
          onClick={(e) => {handleCopy(e, command)}}
        >
          Copy command
        </Button>
        <Button color="primary" onClick={onClose}>
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InstructionsDialog;
