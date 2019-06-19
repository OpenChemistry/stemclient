import React, {Fragment} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid, LinearProgress} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';

import { ImageDataSource } from '../../stem-image/data';
import { Vec2 } from '../../stem-image/types';
import STEMImage from '../stem-image';
import Overlay from '../overlay';
import SelectionOverlay from '../selection-overlay';
import { IImage } from '../../types';
import { SquareSelection, CircleSelection } from '../../stem-image/selection';

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
  selection: Vec2[];
  mask: Vec2[];
  onSelectionChange?: (handlePositions: Vec2[]) => void;
  onMaskChange?: (handlePositions: Vec2[]) => void;
}

const ImageView: React.FC<Props> = ({
  image, colors, onSelectionChange, onMaskChange, classes, progress,
  brightFieldSource, darkFieldSource, frameSource, selection, mask
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
              <SelectionOverlay source={brightFieldSource} selection={selection} onChange={onSelectionChange} selectionClass={SquareSelection}/>
            </STEMImage>
          </div>
          <div className={classes.image}>
            <STEMImage source={darkFieldSource} colors={colors}>
              <SelectionOverlay source={darkFieldSource} selection={selection} onChange={onSelectionChange} selectionClass={SquareSelection}/>
            </STEMImage>
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={`${classes.frameContainer} ${classes.title}`}>
            <Typography variant="h5">
              Frames
            </Typography>
            <Typography color='textSecondary'>
            {`position = (${selection[0][0]}, ${selection[0][1]}), width = ${selection[1][0] - selection[0][0]}, height = ${selection[1][1] - selection[0][1]}`}
            </Typography>
          </div>
          {progress < 100 &&
          <div className={classes.progress}>
            <LinearProgress variant='determinate' value={progress}/>
          </div>
          }
          <STEMImage source={frameSource} colors={colors}>
            <SelectionOverlay source={frameSource} selection={mask} onChange={onMaskChange} selectionClass={CircleSelection}/>
          </STEMImage>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default withStyles(styles)(ImageView);
