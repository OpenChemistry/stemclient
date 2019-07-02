import React, { useEffect } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { auth } from '@openchemistry/girder-redux';

import { isLoggedIn } from '../../store/ducks/flask';
import { IStore } from '../../store';
import LivePreview from '../../components/live-preview';


interface OwnProps {};
interface StateProps{
  loggedIn: boolean;
  apiKey: string;
};
type Props = OwnProps & StateProps & DispatchProp;

const LivePreviewContainer : React.FC<Props> = ({loggedIn, apiKey, dispatch}) => {

  useEffect(() => {
    dispatch(auth.actions.loadApiKey({name: 'stempy'}));
  }, []);

  return <LivePreview loggedIn={loggedIn} apiKey={apiKey}/>
}

function mapStateToProps(state: IStore): StateProps {
  const loggedIn = isLoggedIn(state.flask);
  const apiKey = auth.selectors.getApiKey(state);
  return { loggedIn, apiKey };
}

export default connect(mapStateToProps)(LivePreviewContainer);
