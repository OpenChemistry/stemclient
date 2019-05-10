import React from 'react';
import { IImage } from '../../types';

import { Paper, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';

interface Props {
  images: IImage[];
}

const ImagesList: React.FC<Props> = ({images}) => {
  return (
    <Paper>
      <List>
        {images.map(image => (
          <ListItem key={image._id} button>
            <ListItemIcon><ImageIcon/></ListItemIcon>
            <ListItemText>{image._id}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default ImagesList;
