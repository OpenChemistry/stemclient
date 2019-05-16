import imageReducer from './images';
import {State as ImagesState} from './images';
import flaskReducer from './flask';
import {State as FlaskState} from './flask';

export default {
  images: imageReducer,
  flask: flaskReducer
}

export interface IStore {
  images: ImagesState;
  flask: FlaskState;
}
