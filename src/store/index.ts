import { combineReducers, applyMiddleware, createStore } from 'redux';
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import loggerMiddleware from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { reducer as formReducer} from 'redux-form';
import rootSaga from './sagas';

import reducers, {IStore as IStoreBase} from './ducks';

import { auth } from '@openchemistry/girder-redux';

export const history = createBrowserHistory({basename: process.env.PUBLIC_URL});

const rootReducer = combineReducers({
  ...reducers,
  auth: auth.reducer,
  form: formReducer,
  router: connectRouter(history)
});

export interface IStore extends IStoreBase {
  auth: any;
  form: any;
  router: any;
}

const authSelector = (state: IStore) => state.auth;
auth.selectors.setRoot(authSelector);

const sagaMiddleware = createSagaMiddleware();
let middlewares = [];
middlewares.push(sagaMiddleware);
middlewares.push(routerMiddleware(history));
middlewares.push(loggerMiddleware);

const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(...middlewares)
);

sagaMiddleware.run(rootSaga);

export default store;
