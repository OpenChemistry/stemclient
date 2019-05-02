import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import Cookies from 'universal-cookie';
import { auth } from '@openchemistry/girder-redux';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import store from './store';

const cookies = new Cookies();
const cookieToken = cookies.get('girderToken');

// if there is no token the string "undefined" is returned ?!!
if (cookieToken !== 'undefined') {
  store.dispatch(auth.actions.authenticate({token: cookieToken}));
}
// Test if oauth is enabled on the backend
store.dispatch(auth.actions.testOauthEnabled());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
