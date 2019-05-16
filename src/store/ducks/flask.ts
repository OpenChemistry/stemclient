import { createAction, createReducer } from 'deox';

// Actions
const AUTHENTICATE_FLASK_REQUESTED = 'AUTHENTICATE_FLASK_REQUESTED';
const AUTHENTICATE_FLASK_SUCCEEDED = 'AUTHENTICATE_FLASK_SUCCEEDED';
const AUTHENTICATE_FLASK_FAILED = 'AUTHENTICATE_FLASK_FAILED';

export const authenticateFlask = createAction(AUTHENTICATE_FLASK_REQUESTED,
  (resolve) => (girderToken: string) => resolve(girderToken)
);
export const authenticateFlaskSucceeded = createAction(AUTHENTICATE_FLASK_SUCCEEDED);
export const authenticateFlaskFailed = createAction(AUTHENTICATE_FLASK_FAILED,
  (resolve) => (error: Error) => resolve(error)
);

// Selectors
export const isLoggedIn = (state: State) => state.loggedIn;

// Reducer

export interface State {
  loggedIn: boolean;
}

const defaultState: State = {
  loggedIn: false
}

const reducer = createReducer(defaultState, handle => [
  handle(authenticateFlaskSucceeded, (state) => {
    return {...state, loggedIn: true};
  }),
  handle(authenticateFlaskFailed, (state) => {
    return {...state, loggedIn: false};
  })
]);

export default reducer;
