import React from 'react';
import './App.css';

import { Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router'

import { withStyles, createStyles, WithStyles, Theme, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { history } from './store';

import { auth as authUI } from '@openchemistry/girder-ui';

import {
  ROOT_ROUTE,
  PREVIEW_ROUTE,
  LIST_ROUTE
} from './routes';

import PrivateRoute from './containers/route/private';
import PublicRoute from './containers/route/public';
import Header from './containers/header';
import LivePreview from './containers/live-preview';
import ImagesList from './containers/images-list';
import ImageView from './containers/image-view';
import Navigation from './containers/navigation';
import LoginRequired from './components/login-required';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme({
  overrides: {
    MuiCardHeader: {
      action: {
        marginTop: 0
      }
    }
  }
})

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
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline/>
        <Header/>
        <ConnectedRouter history={history}>
          <Navigation/>
          <div className={classes.content}>
            <Switch>
              <PrivateRoute path={`${ROOT_ROUTE}${PREVIEW_ROUTE}`} component={LivePreview} fallback={LoginRequired} exact/>
              <PublicRoute path={`${ROOT_ROUTE}${LIST_ROUTE}/:imageId`} component={ImageView} exact/>
              <PublicRoute path={`${ROOT_ROUTE}${LIST_ROUTE}`} component={ImagesList} exact/>
            </Switch>
          </div>
        </ConnectedRouter>
        <authUI.LoginOptions girder={development}/>
        <authUI.GirderLogin/>
        <authUI.OauthRedirect/>
        <authUI.NerscLogin/>
      </div>
    </ThemeProvider>
  );
}

export default withStyles(styles)(App);
