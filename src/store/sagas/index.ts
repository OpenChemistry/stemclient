import { fork, ForkEffect } from 'redux-saga/effects';

import { auth } from '@openchemistry/girder-redux';

import { watchFetchImages } from './images';

export default function* root() : IterableIterator<ForkEffect> {
  yield fork(watchFetchImages);

  yield fork(auth.sagas.watchAuthenticate);
  yield fork(auth.sagas.watchFetchMe);
  yield fork(auth.sagas.watchFetchOauthProviders);
  yield fork(auth.sagas.watchTestOauthEnabled);
  yield fork(auth.sagas.watchInvalidateToken);
  yield fork(auth.sagas.watchNewToken);
  yield fork(auth.sagas.watchUsernameLogin);
}
