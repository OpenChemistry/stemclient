import React from 'react';
import { connect } from 'react-redux';
import { auth } from '@openchemistry/girder-redux';
import { Route } from 'react-router-dom';

interface ownProps extends React.ComponentProps<typeof Route> {};

interface stateProps {
  authenticating: boolean;
}

type Props = ownProps & stateProps;

class PublicRoute extends React.Component<Props> {
  render() {
    const {component, authenticating, ...rest} = this.props;
    if (!component || authenticating) {
      return null;
    } else {
      let RenderComponent = component;
      return (
        <Route
          {...rest}
          render={(props) => {
            return <RenderComponent {...props}/>;
          }}
        />
      );
    }
  }
}

function mapStateToProps(state: any) : stateProps {
  return {
    authenticating: auth.selectors.isAuthenticating(state)
  }
}

export default connect(mapStateToProps)(PublicRoute);
