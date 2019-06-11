import React, {Fragment} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid, LinearProgress} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';

import { ImageDataSource } from '../../stem-image/data';
import { Vec4 } from '../../stem-image/types';
import STEMImage from '../stem-image';
import Overlay from '../overlay';
import SelectionOverlay from '../selection-overlay';
import { IImage } from '../../types';

const styles = (theme: Theme) => createStyles({
  title: {
    margin: theme.spacing(4, 0, 2)
  },
  image: {
    marginBottom: theme.spacing(2)
  },
  progress: {
    marginBottom: theme.spacing(1)
  },
  selection: {
    fontSize: theme.spacing(2),
    marginLeft: theme.spacing(4)
  },
  frameContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

interface Props extends WithStyles<typeof styles> {
  image: IImage;
  brightFieldSource: ImageDataSource;
  darkFieldSource: ImageDataSource;
  frameSource: ImageDataSource;
  progress: number;
  colors: RGBColor[];
  selection: Vec4;
  onSelectionChange?: (selection: Vec4) => void;
}

const ImageView: React.FC<Props> = ({
  image, colors, onSelectionChange, classes, progress,
  brightFieldSource, darkFieldSource, frameSource, selection
}) => {
  return (
    <Fragment>
      <Typography variant="h4" className={classes.title}>
        {image.name}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h5" className={classes.title}>
            Images
          </Typography>
          <div className={classes.image}>
            <STEMImage source={brightFieldSource} colors={colors}>
              <SelectionOverlay source={brightFieldSource} selection={selection} onSelectionChange={onSelectionChange}/>
            </STEMImage>
          </div>
          <div className={classes.image}>
            <STEMImage source={darkFieldSource} colors={colors}>
              <SelectionOverlay source={darkFieldSource} selection={selection} onSelectionChange={onSelectionChange}/>
            </STEMImage>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={`${classes.frameContainer} ${classes.title}`}>
            <Typography variant="h5">
              Frames
            </Typography>
            <Typography color='textSecondary'>
            {`position = (${selection[0]}, ${selection[2]}), width = ${selection[1] - selection[0]}, height = ${selection[3] - selection[2]}`}
            </Typography>
          </div>
          {progress < 100 &&
          <div className={classes.progress}>
            <LinearProgress variant='determinate' value={progress}/>
          </div>
          }
          <STEMImage source={frameSource} colors={colors}/>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default withStyles(styles)(ImageView);
