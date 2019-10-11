import React, { Fragment } from 'react';

import { VIRIDIS } from '@colormap/presets';

import {Typography, IconButton, LinearProgress, Tooltip} from '@material-ui/core';
import { createStyles, WithStyles, Theme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';

import { composeValidators, requiredValidator, FormField } from '../../utils/forms';
import PipelineWrapper, {PipelineExecutedCallback, PipelineCreatedCallback, ButtonOptions} from '../pipeline';
import STEMImage from '../stem-image';
import { ImageDataSource, StaticImageDataSource } from '../../stem-image/data';
import CollapsibleImage from '../collapsible-image';

const styles = (theme: Theme) => createStyles({
  title: {
    margin: theme.spacing(4, 0, 2)
  }
});
interface Props extends WithStyles<typeof styles> {
  loggedIn: boolean;
  apiKey: string;
}

const LivePreview : React.FC<Props> = ({loggedIn, apiKey, classes}) => {
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
      extraFields={{
        path: {name: 'path', label: 'File Path', initial: undefined, validator: composeValidators(requiredValidator)} as FormField
      }}
      onCreated={onPipelineCreated}
      onExecuted={onPipelineExecuted}
      generateOptions={[ButtonOptions.SelectParameters]}
      defaultGenerateOption={ButtonOptions.SelectParameters}
      render={() => (
        <Fragment>
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
              const thumbnail = source ? <STEMImage source={source} colors={VIRIDIS}/> : null;
              const image = source
                ? <STEMImage source={source} colors={VIRIDIS}/>
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
                  collapsed={collapsed[pipelineId] !== undefined ? collapsed[pipelineId] : true}
                  onToggle={(collapse)=>{setCollapsed({...collapsed, [pipelineId]: collapse})}}
                  actions={actions}
                  thumbnail={thumbnail}
                  image={image}
                />
              )})}
          </Fragment>
          }
        </Fragment>
      )}
    />
  )
};

export default withStyles(styles)(LivePreview);
