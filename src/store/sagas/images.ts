import { call, put, takeEvery } from 'redux-saga/effects';
import { ActionType } from 'deox';

import { IImage } from '../../types';
import {
  fetchImages, fetchImagesSucceeded, fetchImagesFailed,
  fetchImageField, fetchImageFieldSucceeded, fetchImageFieldFailed,
  fetchImageFrame, fetchImageFrameSucceeded, fetchImageFrameFailed
} from '../ducks/images';
import {
  fetchImages as fetchImagesRest,
  fetchImageField as fetchImageFieldRest,
  fetchImageFrame as fetchImageFrameRest
} from '../../rest/images';

function* onFetchImages(_action: ActionType<typeof fetchImages>) {
  try {
    const images : IImage[] = yield call(fetchImagesRest);
    yield put(fetchImagesSucceeded(images));
  } catch(e) {
    yield put(fetchImagesFailed(e));
  }
}

export function* watchFetchImages() {
  yield takeEvery(fetchImages.toString(), onFetchImages);
}

function* onFetchImageField(action: ActionType<typeof fetchImageField>) {
  const { imageId, fieldName } = action.payload;
  try {
    const imageField = yield call(fetchImageFieldRest, imageId, fieldName);
    yield put(fetchImageFieldSucceeded(imageId, fieldName, imageField));
  } catch(e) {
    yield put(fetchImageFieldFailed(e));
  }
}

export function* watchFetchImageField() {
  yield takeEvery(fetchImageField.toString(), onFetchImageField);
}

function* onFetchImageFrame(action: ActionType<typeof fetchImageFrame>) {
  const { imageId, position } = action.payload;
  try {
    const imageFrame = yield call(fetchImageFrameRest, imageId, position, 'raw');
    yield put(fetchImageFrameSucceeded(imageId, position, imageFrame));
  } catch(e) {
    yield put(fetchImageFrameFailed(e));
  }
}

export function* watchFetchImageFrame() {
  yield takeEvery(fetchImageFrame.toString(), onFetchImageFrame);
}
