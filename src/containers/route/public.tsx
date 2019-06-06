import React from 'react';
import Route, {publicCondition} from '.';

export default (props: React.ComponentProps<typeof Route>) => (
  <Route {...props} condition={publicCondition} />
);
