import imageReducer from './images';
import {State as ImagesState} from './images';

export default {
  images: imageReducer
}

export interface IStore {
  images: ImagesState;
}
