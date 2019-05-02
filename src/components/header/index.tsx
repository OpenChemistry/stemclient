import React from 'react';

import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core';
import { AppBar, Toolbar, Button, IconButton } from '@material-ui/core';

import { auth as authUI } from '@openchemistry/girder-ui';

import store from '../../store';

const styles = (theme: Theme) => createStyles({
  logoImg: {
    height: 6 * theme.spacing.unit
  }
});

interface Props extends WithStyles<typeof styles> {
  loggedIn: boolean;
  showMenu: boolean;
  onLogoClick: () => void;
  onSearchClick: () => void;
  logo: string;
};

class Header extends React.Component<Props> {
  static defaultProps = {
    loggedIn: false,
    showMenu: true,
    onLogoClick: () => {},
    onSearchClick: () => {},
    logo: ''
  }

  render() {
    const { loggedIn, showMenu, onLogoClick, onSearchClick, logo, classes } = this.props;
    return (
      <AppBar color="default" position="static">
        <Toolbar>
          <Button color="inherit" aria-label="Logo" style={{marginRight: 9}}
            onClick={onLogoClick}
          >
            <img className={classes.logoImg} src={logo} alt="logo" />
          </Button>
          <div style={{flex: 1}}>
          </div>
          { showMenu ? (loggedIn ? <authUI.UserMenu store={store}/> : <authUI.LoginButton  store={store}/>) : null }
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(Header)
