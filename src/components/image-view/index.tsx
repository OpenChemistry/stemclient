import React, {Fragment} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';

import { ImageDataSource } from '../../stem-image/data';
import STEMImage from '../../components/stem-image';
import { IImage } from '../../types';

const styles = (theme: Theme) => createStyles({
  title: {
    margin: theme.spacing(4, 0, 2)
  }
});

interface Props extends WithStyles<typeof styles> {
  image: IImage;
  brightFieldSource: ImageDataSource;
  darkFieldSource: ImageDataSource;
  frameSource: ImageDataSource;
  colors: RGBColor[];
  onPixelClick?: (x: number, y: number) => void;
}

const ImageView: React.FC<Props> = ({
  image, colors, onPixelClick, classes,
  brightFieldSource, darkFieldSource, frameSource
}) => {
  return (
    <Fragment>
      <Typography variant="h4" className={classes.title}>
        {image.name}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h5" className={classes.title}>
            Fields
          </Typography>
          <STEMImage source={brightFieldSource} colors={colors} onPixelClick={onPixelClick}/>
          <STEMImage source={darkFieldSource} colors={colors} onPixelClick={onPixelClick}/>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h5" className={classes.title}>
            Frames
          </Typography>
          <STEMImage source={frameSource} colors={colors}/>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default withStyles(styles)(ImageView);
