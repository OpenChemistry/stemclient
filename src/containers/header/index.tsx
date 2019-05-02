import React from 'react';

import { connect, DispatchProp } from 'react-redux';
import { push } from 'connected-react-router'
import { auth } from '@openchemistry/girder-redux';

import { ROOT_ROUTE } from '../../routes';
import logo from '../../assets/logo.svg';

import Header from '../../components/header';

interface OwnProps {};

interface StateProps {
  loggedIn: boolean,
  showMenu: boolean,
  logo: string
};

type Props = OwnProps & StateProps & DispatchProp;

class HeaderContainer extends React.Component<Props> {

  onLogoClick = () => {
    this.props.dispatch(push(ROOT_ROUTE));
  }

  render() {
    const { loggedIn, showMenu, logo } = this.props;
    return (
      <Header loggedIn={loggedIn} showMenu={showMenu} logo={logo} />
    );
  }
}

function mapStateToProps(state: any): StateProps {
  const loggedIn = auth.selectors.isAuthenticated(state);

  const props = {
      loggedIn,
      showMenu: true,
      logo
  };

  return props
}

export default connect(mapStateToProps)(HeaderContainer);
