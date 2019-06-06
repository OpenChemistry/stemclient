import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Route as BaseRoute, RouteProps } from 'react-router-dom';
import { auth } from '@openchemistry/girder-redux';

import { IStore } from '../../store';

type RouteCondition = (authenticating: boolean, authenticated: boolean) => 'component' | 'fallback' | undefined;

const defaultCondition : RouteCondition = () => 'component';

export const privateCondition : RouteCondition = (authenticating, authenticated) => {
  if (authenticating) {
    return;
  }
  return authenticated ? 'component' : 'fallback';
}

export const publicCondition : RouteCondition = (authenticating) => {
  if (authenticating) {
    return undefined;
  }
  return 'component';
}

interface OwnProps {
  fallback?: React.ComponentClass | React.FunctionComponent;
  condition?: RouteCondition;
};

interface StateProps {
  authenticating: boolean;
  authenticated: boolean;
};

type Props = OwnProps & StateProps & DispatchProp & RouteProps;

class Route extends BaseRoute<Props> {
  static defaultProps = {
    condition: defaultCondition,
    fallback: undefined
  }

  render() {
    const { component, fallback, condition, authenticating, authenticated, ...rest } = this.props;

    if (!component) {
      return null;
    }

    const RenderComponent = component;
    const FallbackComponent = fallback;
    switch(condition!(authenticating, authenticated)) {
      case ('component'): {
        return (
          <BaseRoute
            {...rest}
            render={(props) => <RenderComponent {...props}/>}
          />
        );
      }
      case ('fallback'): {
        return ( FallbackComponent ? <FallbackComponent {...rest}/> : null);
      }
      default: {
        return null;
      }
    }
  }
}

const mapStateToProps = (state: IStore) : StateProps => {
  return {
    authenticating: auth.selectors.isAuthenticating(state),
    authenticated: !!auth.selectors.getMe(state)
  };
}

export default connect(mapStateToProps)(Route);
