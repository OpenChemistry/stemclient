import React, {Fragment} from 'react';
import {RGBColor} from '@colormap/core';
import {Typography, Grid, LinearProgress, IconButton, Tooltip} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';

import { ImageDataSource, StaticImageDataSource } from '../../stem-image/data';
import { Vec2 } from '../../stem-image/types';
import { Pipelines } from '../../stem-image/pipelines';
import STEMImage from '../stem-image';
import SelectionOverlay from '../selection-overlay';
import { IImage } from '../../types';
import { SquareSelection, CircleSelection, calculateDistance, BaseSelection } from '../../stem-image/selection';
import PipelineWrapper, {PipelineCreatedCallback, PipelineExecutedCallback, ButtonOptions} from '../pipeline';
import CollapsibleImage from '../collapsible-image';

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
  imageSources: {[name: string]: ImageDataSource | undefined};
  frameSource: ImageDataSource;
  progress: number;
  colors: RGBColor[];
  selection: Vec2[];
  onSelectionChange?: (handlePositions: Vec2[]) => void;
}

const ImageView: React.FC<Props> = ({
  image, colors, onSelectionChange, classes, progress,
  imageSources, frameSource, selection,
  loggedIn, apiKey
}) => {
  const [collapsed, setCollapsed] = React.useState({} as {[name: string]: boolean});
  const [tempSources, setTempSources] = React.useState({} as {[name: string]: ImageDataSource});
  const [tempMeta, setTempMeta] = React.useState({} as {[name: string]: {name: string, executed: boolean, parameters: {[name: string]: any}}});

  const onPipelineCreated : PipelineCreatedCallback = (pipelineId, _workerId, name, parameters) => {
    setTempMeta({...tempMeta, [pipelineId]: {name, parameters, executed: false}});
  };

  const onPipelineExecuted : PipelineExecutedCallback = (pipelineId, _workerId, rank, previewSource) => {
    if (rank == 0) {
      const source = new StaticImageDataSource();
      source.setImageSize(previewSource.getImageSize());
      source.setImageData(previewSource.getImageData());
      setTempMeta({...tempMeta, [pipelineId]: {...tempMeta[pipelineId], executed: true}});
      setTempSources({...tempSources, [pipelineId]: source});
    } else {
      setTempSources({...tempSources, [pipelineId]: previewSource});
    }
  };

  const onDeleteTempImage = (name: string) => {
    const newSources = {...tempSources};
    delete newSources[name];
    const newMeta = {...tempMeta};
    delete newMeta[name];
    setTempMeta(newMeta);
    setTempSources(newSources);
  }

  return (
    <PipelineWrapper
      loggedIn={loggedIn}
      apiKey={apiKey}
      extraValues={{imageId: image._id}}
      onCreated={onPipelineCreated}
      onExecuted={onPipelineExecuted}
      generateOptions={[ButtonOptions.GenerateImage, ButtonOptions.SelectParameters]}
      defaultGenerateOption={ButtonOptions.GenerateImage}
      render={({values, setValues, pipeline}) => {
        const {selectionClass, parametersToPositions, positionsToParameters} = getPipelineSelection(pipeline);
        return (
          <Fragment>
            <Typography variant="h4" className={classes.title}>
              {image.name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                {Object.keys(tempMeta).length > 0 &&
                <Fragment>
                  <Typography variant="h5" className={classes.title}>
                    Temporary Images
                  </Typography>
                  {Object.keys(tempMeta).reverse().map((pipelineId) => {
                    const source = tempSources[pipelineId];
                    const {name, parameters, executed} = tempMeta[pipelineId];
                    const title = `${pipelineId.slice(-6)}`
                    const footer = executed ? null : <LinearProgress variant='indeterminate'/>;
                    const infoTooltip = (
                      <Fragment>
                        <Typography key={'pipeline'} variant='body2'>{`pipeline: ${name}`}</Typography>
                        {Object.entries(parameters).map(([key, value]) => <Typography key={key} variant='body2'>{`${key}: ${value}`}</Typography>)}
                      </Fragment>
                    );
                    const thumbnail = source ? <STEMImage source={source} colors={colors}/> : null;
                    const image = source
                      ? <STEMImage source={source} colors={colors}>
                          <SelectionOverlay source={source} selection={selection} onChange={onSelectionChange} selectionClass={SquareSelection}/>
                        </STEMImage>
                      : null;
                    const actions = [
                      <Tooltip title={infoTooltip} key="info">
                        <IconButton size="small">
                          <InfoIcon/>
                        </IconButton>
                      </Tooltip>
                    ];
                    if (executed) {
                      actions.push(
                        <IconButton onClick={() => {onDeleteTempImage(pipelineId)}} size="small" key="delete">
                          <DeleteIcon/>
                        </IconButton>
                      );
                    }
                    return (
                      <CollapsibleImage
                        title={title}
                        footer={footer}
                        key={pipelineId}
                        collapsed={collapsed[pipelineId] !== undefined ? collapsed[pipelineId] : false}
                        onToggle={(collapse)=>{setCollapsed({...collapsed, [pipelineId]: collapse})}}
                        actions={actions}
                        thumbnail={thumbnail}
                        image={image}
                      />
                    )
                  })}
                </Fragment>
                }
                <Typography variant="h5" className={classes.title}>
                  Saved Images
                </Typography>
                {Object.entries(imageSources).filter(([_name, source]) => !!source).map(([name, source]) => {
                  const parameters = {};
                  const infoTooltip = (
                    <Fragment>
                      <Typography key={'pipeline'} variant='body2'>{`pipeline: `}</Typography>
                      {Object.entries(parameters).map(([key, value]) => <Typography key={key} variant='body2'>{`${key}: ${value}`}</Typography>)}
                    </Fragment>
                  );
                  const thumbnail = <STEMImage source={source!} colors={colors}/>;
                  const image = (
                    <STEMImage source={source!} colors={colors}>
                      <SelectionOverlay source={source!} selection={selection} onChange={onSelectionChange} selectionClass={SquareSelection}/>
                    </STEMImage>
                  );
                  const actions = [
                    <Tooltip title={infoTooltip} key="info">
                      <IconButton size="small">
                        <InfoIcon/>
                      </IconButton>
                    </Tooltip>
                  ];
                  return (
                    <CollapsibleImage
                      title={name}
                      key={name}
                      collapsed={collapsed[name] !== undefined ? collapsed[name] : false}
                      onToggle={(collapse)=>{setCollapsed({...collapsed, [name]: collapse})}}
                      actions={actions}
                      thumbnail={thumbnail}
                      image={image}
                    />
                  )
                })}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5" className={classes.title}>
                  Selected Frames
                </Typography>
                <CollapsibleImage
                  title={`Position: (${selection[0][0]}, ${selection[0][1]})`}
                  subheader={`width: ${selection[1][0] - selection[0][0]}, height: ${selection[1][1] - selection[0][1]}`}
                  footer={progress < 100 ? <LinearProgress variant='determinate' value={progress}/> : null}
                  collapsible={false}
                  collapsed={false}
                  thumbnail={null}
                  image={
                    <STEMImage source={frameSource} colors={colors}>
                      {(selectionClass && parametersToPositions && positionsToParameters) &&
                      <SelectionOverlay source={frameSource} selection={parametersToPositions(values as any)} onChange={(positions) => {setValues(positionsToParameters(positions) as any);}} selectionClass={selectionClass}/>
                      }
                    </STEMImage>
                  }
                />
              </Grid>
            </Grid>
          </Fragment>
        )}}
    />
  );
}

export default withStyles(styles)(ImageView);
