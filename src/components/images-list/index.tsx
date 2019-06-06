import React, { Fragment } from 'react';
import filesize from 'filesize';
import moment from 'moment';
import { IImage } from '../../types';

import { Paper, List, ListItem, ListItemIcon, ListItemText, Typography, withStyles } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import { createStyles, WithStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({
  title: {
    margin: theme.spacing(2, 0, 1)
  }
});
interface Props extends WithStyles<typeof styles> {
  images: IImage[];
  onOpen?: (_id: string) => void;
}

const ImagesList: React.FC<Props> = ({images, onOpen = () => {}, classes}) => {
  return (
    <Fragment>
      <Typography variant="h6" className={classes.title}>
        Images
      </Typography>
      <Paper>
        <List>
          {images.map(image => (
            <ListItem key={image._id} button onClick={() => {onOpen(image._id);}}>
              <ListItemIcon><ImageIcon/></ListItemIcon>
              <ListItemText
                primary={`${image.name} (${filesize(image.size || 0)})`}
                secondary={moment(image.created).format('MMM D YYYY HH:mm:ss')}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Fragment>
  )
}

export default withStyles(styles)(ImagesList);
