import React, {Fragment, useState, useEffect} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid, LinearProgress} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';

import { ImageDataSource } from '../../stem-image/data';
import { Vec2, ImageSize } from '../../stem-image/types';
import STEMImage from '../stem-image';
import SelectionOverlay from '../selection-overlay';
import { IImage } from '../../types';
import { SquareSelection, CircleSelection, calculateDistance } from '../../stem-image/selection';
import FormComponent from './form';
import { composeValidators, requiredValidator, integerValidator } from '../../utils/forms';

interface MaskParameters {
  centerX: number;
  centerY: number;
  minRadius: number;
  maxRadius: number;
}

const positionsToParameters = (positions: Vec2[], size: ImageSize) : MaskParameters => {
  const {width, height} = size;
  return {
    centerX: positions[0][0] - Math.floor(width / 2),
    centerY: Math.floor(height / 2) - positions[0][1],
    minRadius: 0,
    maxRadius: Math.round(calculateDistance(positions[0], positions[1]))
  }
}

const parametersToPositions = (parameters: MaskParameters, size: ImageSize) : Vec2[] => {
  const {width, height} = size;
  let { centerX, centerY, minRadius, maxRadius } = parameters;
  centerX = parseInt(centerX as any);
  centerY = parseInt(centerY as any);
  minRadius = parseInt(minRadius as any);
  maxRadius = parseInt(maxRadius as any);
  const centerPosition: Vec2 = [
    centerX + Math.floor(width / 2), Math.floor(height /2) - centerY
  ];
  const radiusPosition : Vec2 = [
    centerPosition[0] + maxRadius, centerPosition[1]
  ];
  return [
    centerPosition,
    radiusPosition
  ];
}

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

  const [fieldValues, setFieldValues] = useState({} as {[fieldName: string]: string});

  const onFormChange = (name: string, value: string) => {
    const newValues = {...fieldValues};
    newValues[name] = value;
    setFieldValues(newValues);
    if (onMaskChange) {
      const size = frameSource.getImageSize();
      const newPositions = parametersToPositions(newValues as any, size);
      onMaskChange(newPositions);
    }
  }

  const fields = [
    {name: 'centerX', label: 'Center X', validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
    {name: 'centerY', label: 'Center Y', validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
    {name: 'minRadius', label: 'Min Radius', validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'},
    {name: 'maxRadius', label: 'Max Radius', validator: composeValidators(requiredValidator, integerValidator), width: 6, type: 'number'}
  ];

  useEffect(() => {
    const size = frameSource.getImageSize();
    const parameters = positionsToParameters(mask, size);
    setFieldValues(parameters as any);
  }, [mask, frameSource]);

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
          <br/>
          <FormComponent fields={fields} values={fieldValues} onChange={onFormChange}/>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default withStyles(styles)(ImageView);
