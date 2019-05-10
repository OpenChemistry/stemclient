import { createAction, createReducer } from 'deox';

import { IImage } from '../../types';

// Actions

const FETCH_IMAGES_REQUESTED = 'FETCH_IMAGES_REQUESTED';
const FETCH_IMAGES_SUCCEEDED = 'FETCH_IMAGES_SUCCEEDED';
const FETCH_IMAGES_FAILED = 'FETCH_IMAGES_FAILED';

export const fetchImages = createAction(FETCH_IMAGES_REQUESTED);
export const fetchImagesSucceeded = createAction(FETCH_IMAGES_SUCCEEDED, resolve => (images: IImage[]) => resolve(images));
export const fetchImagesFailed = createAction(FETCH_IMAGES_FAILED, resolve => (error: any) => resolve(error));

// Selectors
export const getImages = (state: State) => Object.values(state.byId);

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
  })
]);

export default reducer;
