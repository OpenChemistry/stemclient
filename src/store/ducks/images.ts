import { createAction, createReducer } from 'deox';
import produce from 'immer';

import { IImage, FieldName, ImageField } from '../../types';

// Actions

const FETCH_IMAGES_REQUESTED = 'FETCH_IMAGES_REQUESTED';
const FETCH_IMAGES_SUCCEEDED = 'FETCH_IMAGES_SUCCEEDED';
const FETCH_IMAGES_FAILED = 'FETCH_IMAGES_FAILED';

const FETCH_IMAGE_FIELD_REQUESTED = 'FETCH_IMAGE_FIELD_REQUESTED';
const FETCH_IMAGE_FIELD_SUCCEEDED = 'FETCH_IMAGE_FIELD_SUCCEEDED';
const FETCH_IMAGE_FIELD_FAILED = 'FETCH_IMAGE_FIELD_FAILED';

export const fetchImages = createAction(FETCH_IMAGES_REQUESTED);
export const fetchImagesSucceeded = createAction(FETCH_IMAGES_SUCCEEDED, resolve => (images: IImage[]) => resolve(images));
export const fetchImagesFailed = createAction(FETCH_IMAGES_FAILED, resolve => (error: any) => resolve(error));

export const fetchImageField = createAction(FETCH_IMAGE_FIELD_REQUESTED, resolve => (imageId: string, fieldName: FieldName) => resolve({imageId, fieldName}));
export const fetchImageFieldSucceeded = createAction(FETCH_IMAGE_FIELD_SUCCEEDED, resolve => (imageId: string, fieldName: FieldName, imageField: ImageField) => resolve({imageId, fieldName, imageField}));
export const fetchImageFieldFailed = createAction(FETCH_IMAGE_FIELD_FAILED, resolve => (error: any) => resolve(error));

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
  handle(fetchImageFieldSucceeded, (state, action) => {
    return produce(state, draft => {
      const { imageId, fieldName, imageField } = action.payload;
      if (!draft.byId[imageId]) {
        draft.byId[imageId] = { _id: imageId, fileId: '' };
      }
      const image = draft.byId[imageId];
      if (!image.fields) {
        image.fields = {[fieldName]: imageField};
      } else {
        image.fields[fieldName] = imageField;
      }
    });
  })
]);

export default reducer;
