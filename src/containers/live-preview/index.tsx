import React from 'react';
import { connect, DispatchProp } from 'react-redux';

import { isLoggedIn } from '../../store/ducks/flask';
import { IStore } from '../../store';
import LivePreview from '../../components/live-preview';


interface OwnProps {};
interface StateProps{
  loggedIn: boolean;
};
type Props = OwnProps & StateProps & DispatchProp;

const LivePreviewContainer : React.FC<Props> = ({loggedIn}) => {
  return <LivePreview loggedIn={loggedIn}/>
}

function mapStateToProps(state: IStore): StateProps {
  const loggedIn = isLoggedIn(state.flask);
  return {loggedIn};
}

export default connect(mapStateToProps)(LivePreviewContainer);
