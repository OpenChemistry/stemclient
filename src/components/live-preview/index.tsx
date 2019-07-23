import React from 'react';

import { VIRIDIS } from '@colormap/presets';

import { composeValidators, requiredValidator, FormField } from '../../utils/forms';
import PipelineWrapper from '../pipeline';
import STEMImage from '../stem-image';

interface Props {
  loggedIn: boolean;
  apiKey: string;
}

const LivePreview : React.FC<Props> = ({loggedIn, apiKey}) => {
  return (
    <PipelineWrapper
      loggedIn={loggedIn}
      apiKey={apiKey}
      extraFields={{
        path: {name: 'path', label: 'File Path', initial: undefined, validator: composeValidators(requiredValidator)} as FormField
      }}
      render={({source}) => (
        <STEMImage source={source} colors={VIRIDIS}/>
      )}
    />
  )
};

export default LivePreview;
