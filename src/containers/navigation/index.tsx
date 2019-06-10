import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { push } from 'connected-react-router';
import { auth } from '@openchemistry/girder-redux';

import { IStore } from '../../store';
import Navigation from '../../components/navigation'

interface OwnProps {};
interface StateProps {
  section: string;
  authenticated: boolean;
};
type Props = OwnProps & StateProps & DispatchProp;

const NavigationContainer : React.FC<Props> = ({section, authenticated, dispatch}) => {
  const onClick = (section: string) => {
    dispatch(push(`/${section}`));
  }
  return (<Navigation section={section} authenticated={authenticated} onClick={onClick}/>);
}

const mapStateToProps = (state: IStore, ownProps: OwnProps) : StateProps => {
  const { location } = state.router;
  const section = location.pathname.split('/')[1];

  return {
    section,
    authenticated: !!auth.selectors.getMe(state)
  };
}

export default connect(mapStateToProps)(NavigationContainer);
