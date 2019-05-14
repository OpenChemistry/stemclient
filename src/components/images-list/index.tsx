import React from 'react';
import { IImage } from '../../types';

import { Paper, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';

interface Props {
  images: IImage[];
  onOpen?: (_id: string) => void;
}

const ImagesList: React.FC<Props> = ({images, onOpen = () => {}}) => {
  return (
    <Paper>
      <List>
        {images.map(image => (
          <ListItem key={image._id} button onClick={() => {onOpen(image._id);}}>
            <ListItemIcon><ImageIcon/></ListItemIcon>
            <ListItemText>{image._id}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default ImagesList;
