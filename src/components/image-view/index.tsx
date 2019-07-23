import React, {Fragment} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid, LinearProgress} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';

import { ImageDataSource } from '../../stem-image/data';
import { Vec2 } from '../../stem-image/types';
import { Pipelines } from '../../stem-image/pipelines';
import STEMImage from '../stem-image';
import SelectionOverlay from '../selection-overlay';
import { IImage } from '../../types';
import { SquareSelection, CircleSelection, calculateDistance, BaseSelection } from '../../stem-image/selection';
import PipelineWrapper from '../pipeline';

interface MaskParameters {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
}

const getPipelineSelection = (pipeline: string) : {
  selectionClass?: new (parent: HTMLDivElement, source: ImageDataSource) => BaseSelection,
  positionsToParameters?: (positions: Vec2[]) => MaskParameters,
  parametersToPositions?: (parameters: MaskParameters) => Vec2[]
} => {
  switch(pipeline) {
    case Pipelines.AnnularMask: {
      return {
        selectionClass: CircleSelection,
        positionsToParameters: (positions: Vec2[]) : MaskParameters => {
          return {
            centerX: positions[0][0],
            centerY: positions[0][1],
            innerRadius: Math.round(calculateDistance(positions[0], positions[1])),
            outerRadius: Math.round(calculateDistance(positions[0], positions[2]))
          }
        },
        parametersToPositions: (parameters: MaskParameters) : Vec2[] => {
          let { centerX, centerY, innerRadius, outerRadius } = parameters;
          centerX = parseInt(centerX as any);
          centerY = parseInt(centerY as any);
          innerRadius = parseInt(innerRadius as any);
          outerRadius = parseInt(outerRadius as any);
          const centerPosition: Vec2 = [
            centerX, centerY
          ];
          const innerRadiusPosition : Vec2 = [
            centerPosition[0] + innerRadius, centerPosition[1]
          ];
          const outerRadiusPosition : Vec2 = [
            centerPosition[0] + outerRadius, centerPosition[1]
          ];
          return [
            centerPosition,
            innerRadiusPosition,
            outerRadiusPosition
          ];
        }
      }
    }
    default: {
      return {
        selectionClass: undefined,
        positionsToParameters: undefined,
        parametersToPositions: undefined
      }
    }
  }
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
  loggedIn: boolean;
  apiKey: string;
  image: IImage;
  brightFieldSource: ImageDataSource;
  darkFieldSource: ImageDataSource;
  frameSource: ImageDataSource;
  progress: number;
  colors: RGBColor[];
  selection: Vec2[];
  onSelectionChange?: (handlePositions: Vec2[]) => void;
}

const ImageView: React.FC<Props> = ({
  image, colors, onSelectionChange, classes, progress,
  brightFieldSource, darkFieldSource, frameSource, selection,
  loggedIn, apiKey
}) => {

  return (
    <PipelineWrapper
      loggedIn={loggedIn}
      apiKey={apiKey}
      extraValues={{fileId: image.fileId}}
      render={({source, values, setValues, pipeline}) => {
        const {selectionClass, parametersToPositions, positionsToParameters} = getPipelineSelection(pipeline);
        return (
          <Fragment>
            <Typography variant="h4" className={classes.title}>
              {image.name}
            </Typography>
            <STEMImage source={source} colors={colors}>
              <SelectionOverlay source={source} selection={selection} onChange={onSelectionChange} selectionClass={SquareSelection}/>
            </STEMImage>
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
                  {(selectionClass && parametersToPositions && positionsToParameters) &&
                  <SelectionOverlay source={frameSource} selection={parametersToPositions(values as any)} onChange={(positions) => {setValues(positionsToParameters(positions) as any);}} selectionClass={selectionClass}/>
                  }
                </STEMImage>
              </Grid>
            </Grid>
          </Fragment>
        )}}
    />
  );
}

export default withStyles(styles)(ImageView);
