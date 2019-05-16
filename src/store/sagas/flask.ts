import { call, put, takeEvery } from 'redux-saga/effects';
import { ActionType } from 'deox';
import { auth } from '@openchemistry/girder-redux';

import { authenticateFlask, authenticateFlaskSucceeded, authenticateFlaskFailed } from '../ducks/flask';
import { authenticateFlask as authenticateFlaskRest } from '../../rest/flask';

function* onAuthenticateFlask(action: ActionType<typeof authenticateFlask>) {
  const girderToken = action.payload;
  try {
    yield call(authenticateFlaskRest, girderToken);
    yield put(authenticateFlaskSucceeded());
  } catch(e) {
    yield put(authenticateFlaskFailed(e));
  }
}

export function* watchAuthenticateFlask() {
  yield takeEvery(authenticateFlask.toString(), onAuthenticateFlask);
}

function* onSetToken(action: any) {
  const girderToken : string = action.payload;
  yield put(authenticateFlask(girderToken));
}

export function* watchSetToken() {
  yield takeEvery(auth.actions.setToken.toString(), onSetToken);
}
