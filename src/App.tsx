import React from 'react';
import './App.css';

import { Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router'

import { withStyles, createStyles, WithStyles, Theme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { history } from './store';

import { auth as authUI } from '@openchemistry/girder-ui';

import {
  ROOT_ROUTE,
  PREVIEW_ROUTE
} from './routes';

import Header from './containers/header';
import LivePreview from './containers/live-preview';
import PublicRoute from './containers/public-route';

const styles = (_theme: Theme) => createStyles({
  root: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow:1,
    position: 'relative',
    width: '100%',
    maxWidth: '70rem',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '0.5rem'
  },
  footer: {

  }
});

interface Props extends WithStyles<typeof styles> {};

const App : React.FC<Props> = (props) => {
  const {classes} = props;
  let development = false;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    development = true;
  }
  return (
    <div className={classes.root}>
      <CssBaseline/>
      <Header/>
      <ConnectedRouter history={history}>
        <div className={classes.content}>
          <Switch>
            <PublicRoute path={`${ROOT_ROUTE}${PREVIEW_ROUTE}`} component={LivePreview} exact/>
          </Switch>
        </div>
      </ConnectedRouter>
      <authUI.LoginOptions girder={development}/>
      <authUI.GirderLogin/>
      <authUI.OauthRedirect/>
    </div>
  );
}

export default withStyles(styles)(App);
