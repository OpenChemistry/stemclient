import { call, put, takeEvery } from 'redux-saga/effects';
import { ActionType } from 'deox';

import { IImage } from '../../types';
import { fetchImages, fetchImagesSucceeded, fetchImagesFailed} from '../ducks/images';
import { fetchImages as fetchImagesRest } from '../../rest/images';

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
