import { call, put, takeEvery, takeLatest, all } from 'redux-saga/effects';
import { ActionType } from 'deox';
import { decodeStream } from '@msgpack/msgpack';

import { IImage, ImageData, FrameType, GirderFile, FieldStatus } from '../../types';
import { ImageSize } from '../../stem-image/types';

import {
  fetchImages, fetchImagesSucceeded, fetchImagesFailed,
  fetchImage, fetchImageSucceeded, fetchImageFailed,
  fetchImageField, fetchImageFieldSucceeded, fetchImageFieldFailed,
  fetchImageFrames, fetchImageFrameSucceeded, fetchImageFrameFailed
} from '../ducks/images';
import {
  fetchImages as fetchImagesRest,
  fetchImage as fetchImageRest,
  fetchImageField as fetchImageFieldRest,
  fetchImageFrame as fetchImageFrameRest,
  fetchImageFieldSize, fetchImageFrameSize,
  fetchImageFieldNames, fetchImageFrameTypes
} from '../../rest/images';
import { fetchFile } from '../../rest/files';

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
    case FrameType.Electron: {
      data = [];
      const {width, height} = size;
      for (let i = 0; i < width * height; ++i) {
        data.push(0);
      }
      decodedData.forEach(index => {data[index] = 1});
      break;
    }
    case FrameType.Raw:
    default: {
      data = decodedData;
    }
  }

  return {size, data};
}

function* onFetchImages(_action: ActionType<typeof fetchImages>) {
  try {
    let images : IImage[] = yield call(fetchImagesRest);
    const fetchImagesFiles = images.map(image => call(fetchFile, image.fileId));
    // Add metadata from the file associated to the image
    const files: GirderFile[] = yield all(fetchImagesFiles);
    images = images.map((image, i) => {
      const {created, name, size} = files[i];
      image = {...image, created, name, size};
      return image;
    });
    yield put(fetchImagesSucceeded(images));
  } catch(e) {
    yield put(fetchImagesFailed(e));
  }
}

export function* watchFetchImages() {
  yield takeEvery(fetchImages.toString(), onFetchImages);
}

function* onFetchImage(action: ActionType<typeof fetchImage>) {
  const { imageId } = action.payload;
  try {
    let image : IImage = yield call(fetchImageRest, imageId);
    const file : GirderFile = yield call(fetchFile, image.fileId);
    // Add metadata from the file associated to the image
    const {created, name, size} = file;
    image = {...image, created, name, size};
    // Add previously calculated stem image names
    const fieldNames : string[] = yield call(fetchImageFieldNames, imageId);
    // Add the frame types available in this dataset
    const framesTypes : FrameType[] = yield call(fetchImageFrameTypes, imageId);
    image['framesTypes'] = framesTypes;
    // Add the size of the frames
    if (framesTypes.length > 0) {
      const framesSize : ImageSize = yield call(fetchImageFrameSize, imageId, framesTypes[0]);
      image['framesSize'] = framesSize;
    }

    const fields : {[name: string]: ImageData | FieldStatus} = {};
    fieldNames.forEach((name) => {
      fields[name] = FieldStatus.Empty;
    });
    image['fields'] = fields;
    yield put(fetchImageSucceeded(imageId, image));
  } catch(e) {
    yield put(fetchImageFailed(e));
  }
}

export function* watchFetchImage() {
  yield takeEvery(fetchImage.toString(), onFetchImage);
}

function* onFetchImageField(action: ActionType<typeof fetchImageField>) {
  const { imageId, fieldName } = action.payload;
  try {
    const imageSize = yield call(fetchImageFieldSize, imageId, fieldName);
    const imageStream = yield call(fetchImageFieldRest, imageId, fieldName);
    const imageField = yield call(extractImageData, imageStream, imageSize, FrameType.Raw);
    yield put(fetchImageFieldSucceeded(imageId, fieldName, imageField));
  } catch(e) {
    yield put(fetchImageFieldFailed(e));
  }
}

export function* watchFetchImageField() {
  yield takeEvery(fetchImageField.toString(), onFetchImageField);
}

function* onFetchImageFrames(action: ActionType<typeof fetchImageFrames>) {
  const { imageId, positions, type, cumulate, callback } = action.payload;
  try {
    const imageSize = yield call(fetchImageFrameSize, imageId, type);

    let imageData: ImageData;

    const data: number[] = [];
    if (cumulate) {
      for (let i = 0; i < imageSize.width * imageSize.height; ++i) {
        data.push(0);
      }
      imageData = {size: imageSize, data};
      yield put(fetchImageFrameSucceeded(imageId, 'cumulated', imageData));
    }

    let positionName: 'cumulated' | number;

    for (let i in positions) {
      const position = positions[i];
      const imageStream = yield call(fetchImageFrameRest, imageId, position, type);
      const imageFrame = yield call(extractImageData, imageStream, imageSize, type);

      if (cumulate) {
        let cumulator : (cumulated: number, current: number) => number;
        switch (type) {
          case FrameType.Electron: {
            cumulator = (cumulated, current) => cumulated || current;
            break;
          }
          default: {
            cumulator = (cumulated, current) => cumulated + current;
            break;
          }
        }

        imageFrame.data.forEach((value: number, i: number) => {
          data[i] = cumulator(data[i], value);
        });
        imageData = {size: imageSize, data};
        positionName = 'cumulated';
      } else {
        imageData = imageFrame;
        positionName = position;
      }
      yield put(fetchImageFrameSucceeded(imageId, positionName, imageData));
      if (callback) {
        callback(parseInt(i));
      }
    }
  } catch(e) {
    yield put(fetchImageFrameFailed(e));
  }
}

export function* watchFetchImageFrame() {
  yield takeLatest(fetchImageFrames.toString(), onFetchImageFrames);
}
