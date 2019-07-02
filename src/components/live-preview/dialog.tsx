import React from 'react';

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
}

const DialogComponent : React.FC<Props> = ({open, onClose, title, children}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
};

export default DialogComponent;
