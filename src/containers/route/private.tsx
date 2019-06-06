import React from 'react';
import Route, {privateCondition} from '.';

export default (props: React.ComponentProps<typeof Route>) => (
  <Route {...props} condition={privateCondition} />
);
