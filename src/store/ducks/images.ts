import { createAction, createReducer } from 'deox';
import produce from 'immer';

import { IImage, FrameType, ImageData } from '../../types';

// Actions

const FETCH_IMAGES_REQUESTED = 'FETCH_IMAGES_REQUESTED';
const FETCH_IMAGES_SUCCEEDED = 'FETCH_IMAGES_SUCCEEDED';
const FETCH_IMAGES_FAILED = 'FETCH_IMAGES_FAILED';

const FETCH_IMAGE_REQUESTED = 'FETCH_IMAGE_REQUESTED';
const FETCH_IMAGE_SUCCEEDED = 'FETCH_IMAGE_SUCCEEDED';
const FETCH_IMAGE_FAILED = 'FETCH_IMAGE_FAILED';

const FETCH_IMAGE_FIELD_REQUESTED = 'FETCH_IMAGE_FIELD_REQUESTED';
const FETCH_IMAGE_FIELD_SUCCEEDED = 'FETCH_IMAGE_FIELD_SUCCEEDED';
const FETCH_IMAGE_FIELD_FAILED = 'FETCH_IMAGE_FIELD_FAILED';

const FETCH_IMAGE_FRAMES_REQUESTED = 'FETCH_IMAGE_FRAMES_REQUESTED';
const FETCH_IMAGE_FRAME_SUCCEEDED = 'FETCH_IMAGE_FRAME_SUCCEEDED';
const FETCH_IMAGE_FRAME_FAILED = 'FETCH_IMAGE_FRAME_FAILED';

export const fetchImages = createAction(FETCH_IMAGES_REQUESTED);
export const fetchImagesSucceeded = createAction(FETCH_IMAGES_SUCCEEDED, resolve => (images: IImage[]) => resolve(images));
export const fetchImagesFailed = createAction(FETCH_IMAGES_FAILED, resolve => (error: any) => resolve(error));

export const fetchImage = createAction(FETCH_IMAGE_REQUESTED, resolve => (imageId: string) => resolve({imageId}));
export const fetchImageSucceeded = createAction(FETCH_IMAGE_SUCCEEDED, resolve => (imageId: string, image: IImage) => resolve({imageId, image}));
export const fetchImageFailed = createAction(FETCH_IMAGE_FAILED, resolve => (error: any) => resolve(error));

export const fetchImageField = createAction(FETCH_IMAGE_FIELD_REQUESTED, resolve => (imageId: string, fieldName: string) => resolve({imageId, fieldName}));
export const fetchImageFieldSucceeded = createAction(FETCH_IMAGE_FIELD_SUCCEEDED, resolve => (imageId: string, fieldName: string, data: ImageData) => resolve({imageId, fieldName, data}));
export const fetchImageFieldFailed = createAction(FETCH_IMAGE_FIELD_FAILED, resolve => (error: any) => resolve(error));

export const fetchImageFrames = createAction(FETCH_IMAGE_FRAMES_REQUESTED, resolve => (imageId: string, positions: number[], type: FrameType, cumulate: boolean, callback?: (i: number) => void) => resolve({imageId, positions, type, cumulate, callback}));
export const fetchImageFrameSucceeded = createAction(FETCH_IMAGE_FRAME_SUCCEEDED, resolve => (imageId: string, position: number | 'cumulated', data: ImageData) => resolve({imageId, position, data}));
export const fetchImageFrameFailed = createAction(FETCH_IMAGE_FRAME_FAILED, resolve => (error: any) => resolve(error));

// Selectors
export const getImages = (state: State) => Object.values(state.byId);
export const getImageById = (state: State, imageId: string) => state.byId[imageId];

// Reducer
export interface State {
  byId: {[id: string]: IImage};
}

const defaultState: State = {
  byId: {}
}

const reducer = createReducer(defaultState, handle => [
  handle(fetchImagesSucceeded, (state, action) => {
    let byId: {[id: string]: IImage} = {};
    const images = action.payload;
    byId = images.reduce((total, current) => {
      total[current._id] = current;
      return total;
    }, byId);
    return {...state, byId};
  }),
  handle(fetchImageSucceeded, (state, action) => {
    return produce(state, draft => {
      const { imageId, image } = action.payload;
      draft.byId[imageId] = image;
    });
  }),
  handle(fetchImageFieldSucceeded, (state, action) => {
    return produce(state, draft => {
      const { imageId, fieldName, data } = action.payload;
      if (!draft.byId[imageId]) {
        draft.byId[imageId] = { _id: imageId, fileId: '' };
      }
      const image = draft.byId[imageId];
      if (!image.fields) {
        image.fields = {[fieldName]: data};
      } else {
        image.fields[fieldName] = data;
      }
    });
  }),
  handle(fetchImageFrames, (state, action) => {
    return produce(state, draft => {
      const { imageId } = action.payload;
      if (!draft.byId[imageId]) {
        draft.byId[imageId] = { _id: imageId, fileId: '' };
      }
      const image = draft.byId[imageId];
      if (!image.frames) {
        image.frames = {};
      }
      delete image.frames.cumulated;
    })
  }),
  handle(fetchImageFrameSucceeded, (state, action) => {
    return produce(state, draft => {
      const { imageId, position, data } = action.payload;
      if (!draft.byId[imageId]) {
        draft.byId[imageId] = { _id: imageId, fileId: '' };
      }
      const image = draft.byId[imageId];
      if (!image.frames) {
        image.frames = {};
      }

      image.frames[position] = data;
    });
  })
]);

export default reducer;
