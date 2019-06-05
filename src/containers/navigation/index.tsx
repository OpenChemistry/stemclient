import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { push } from 'connected-react-router';

import { IStore } from '../../store';
import Navigation from '../../components/navigation'

interface OwnProps {};
interface StateProps {
  section: string;
};
type Props = OwnProps & StateProps & DispatchProp;

const NavigationContainer : React.FC<Props> = ({section, dispatch}) => {
  const onClick = (section: string) => {
    dispatch(push(`/${section}`));
  }
  return (<Navigation section={section} onClick={onClick}/>);
}

const mapStateToProps = (state: IStore, ownProps: OwnProps) => {
  const { location } = state.router;
  const section = location.pathname.split('/')[1];
  return {
    section
  };
}

export default connect(mapStateToProps)(NavigationContainer);
