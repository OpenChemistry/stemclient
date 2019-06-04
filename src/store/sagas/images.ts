import { call, put, takeEvery } from 'redux-saga/effects';
import { ActionType } from 'deox';
import { decodeStream } from '@msgpack/msgpack';

import { IImage, ImageData, FrameType } from '../../types';
import { ImageSize } from '../../stem-image/types';

import {
  fetchImages, fetchImagesSucceeded, fetchImagesFailed,
  fetchImageField, fetchImageFieldSucceeded, fetchImageFieldFailed,
  fetchImageFrame, fetchImageFrameSucceeded, fetchImageFrameFailed
} from '../ducks/images';
import {
  fetchImages as fetchImagesRest,
  fetchImageField as fetchImageFieldRest,
  fetchImageFrame as fetchImageFrameRest,
  fetchImageFieldSize, fetchImageFrameSize
} from '../../rest/images';

async function extractImageData(stream: ReadableStream, size: ImageSize, type: FrameType) : Promise<ImageData> {
  const decodedData : number[] = [];

  const extractFlat = (row: number | number[]) => {
    if (Array.isArray(row)) {
      row.forEach(extractFlat);
    } else {
      decodedData.push(row);
    }
  }

  for await (const chunk of decodeStream(stream) as AsyncIterableIterator<number[]>) {
    chunk.forEach(extractFlat);
  }

  let data: number[];

  switch(type) {
    case 'electron': {
      data = [];
      const {width, height} = size;
      for (let i = 0; i < width * height; ++i) {
        data.push(0);
      }
      decodedData.forEach(index => {data[index] = 1});
      break;
    }
    case 'raw':
    default: {
      data = decodedData;
    }
  }

  return {size, data};
}

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
    const imageSize = yield call(fetchImageFieldSize, imageId, fieldName);
    const imageStream = yield call(fetchImageFieldRest, imageId, fieldName);
    const imageField = yield call(extractImageData, imageStream, imageSize, 'raw');
    yield put(fetchImageFieldSucceeded(imageId, fieldName, imageField));
  } catch(e) {
    yield put(fetchImageFieldFailed(e));
  }
}

export function* watchFetchImageField() {
  yield takeEvery(fetchImageField.toString(), onFetchImageField);
}

function* onFetchImageFrame(action: ActionType<typeof fetchImageFrame>) {
  const { imageId, position, type } = action.payload;
  try {
    const imageSize = yield call(fetchImageFrameSize, imageId, type);
    const imageStream = yield call(fetchImageFrameRest, imageId, position, type);
    const imageFrame = yield call(extractImageData, imageStream, imageSize, type);
    yield put(fetchImageFrameSucceeded(imageId, position, imageFrame));
  } catch(e) {
    yield put(fetchImageFrameFailed(e));
  }
}

export function* watchFetchImageFrame() {
  yield takeEvery(fetchImageFrame.toString(), onFetchImageFrame);
}
