import React, { useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { VIRIDIS } from '@colormap/presets';
import { auth } from '@openchemistry/girder-redux';

import { IImage, ImageData, FieldStatus } from '../../types';
import { IStore } from '../../store';

import { isLoggedIn } from '../../store/ducks/flask';
import { fetchImage, fetchImageField, fetchImageFrames, getImageById } from '../../store/ducks/images';
import { StaticImageDataSource, ImageDataSource } from '../../stem-image/data';
import { ImageSize, Vec2 } from '../../stem-image/types';
import ImageView from '../../components/image-view';

interface OwnProps {};
interface StateProps {
  imageId: string;
  loggedIn: boolean;
  apiKey: string;
  image?: IImage;
  fields: {[name: string]: ImageData | FieldStatus};
};
type Props = OwnProps & StateProps & DispatchProp;

const ImageViewContainer : React.FC<Props> = ({imageId, image, loggedIn, apiKey, dispatch, fields}) => {

  const [sources, setSources] = useState({} as {[name: string]: ImageDataSource | undefined});
  const [frameSource] = useState(new StaticImageDataSource());
  const [selection, setSelection] = useState([[0, 0], [0, 0]] as Vec2[]);
  const [progress, setProgress] = useState(100);

  let rawFrame : ImageData | undefined;

  if (image && image.frames) {
    rawFrame = image.frames['cumulated'];
  }

  useEffect(() => {
    dispatch(auth.actions.loadApiKey({name: 'stempy'}));
  }, []);

  useEffect(() => {
    const newSources = {...sources};
    Object.entries(fields).forEach((entry) => {
      const name = entry[0];
      const data = entry[1];
      switch (data) {
        case FieldStatus.Empty: {
          dispatch(fetchImageField(imageId, name));
          break;
        }
        case FieldStatus.Fetching: {
          break;
        }
        default: {
          if (!newSources[name]) {
            const source = new StaticImageDataSource();
            source.setImageSize(data.size);
            source.setImageData(new Float64Array(data.data));
            newSources[name] = source;
          }
          break;
        }
      }
    });
    setSources(newSources);
  }, [imageId, fields, dispatch]);

  useEffect(() => {
    if (imageId) {
      dispatch(fetchImage(imageId));
    }
  }, [imageId, dispatch]);

  useEffect(() => {
    if (rawFrame) {
      frameSource.setImageSize(rawFrame.size);
      frameSource.setImageData(new Float64Array(rawFrame.data));
    }
  }, [rawFrame, frameSource]);

  const onSelectionChange = (handlePositions: Vec2[]) => {
    const orderedSelection : Vec2[] = [
      [Math.min(handlePositions[0][0], handlePositions[1][0]), Math.min(handlePositions[0][1], handlePositions[1][1])],
      [Math.max(handlePositions[0][0], handlePositions[1][0]), Math.max(handlePositions[0][1], handlePositions[1][1])]
    ];

    setSelection(orderedSelection);

    let size : ImageSize | undefined;
    for (let name in fields) {
      const field = fields[name];
      switch (field) {
        case FieldStatus.Empty:
        case FieldStatus.Fetching: {
          break;
        }
        default: {
          size = field.size;
          break;
        }
      }
    }
    if (!size) {
      return;
    }

    const positions = [];
    for (let i = orderedSelection[0][0]; i < orderedSelection[1][0]; ++i) {
      for (let j = orderedSelection[0][1]; j < orderedSelection[1][1]; ++j) {
        const pixelIndex = j * size.width + i;
        positions.push(pixelIndex);
      }
    }

    const callback = (iteration: number) => {
      const newProgress = iteration === positions.length - 1 ? 100 : 100 * (iteration + 1) / positions.length;
      setProgress(newProgress);
    };

    if (image && image.framesTypes && image.framesTypes.length > 0) {
      dispatch(fetchImageFrames(imageId, positions, image.framesTypes[0], true, callback));
    }
  }

  if (image && image.fields) {
    return (
      <ImageView
        loggedIn={loggedIn}
        apiKey={apiKey}
        image={image}
        imageSources={sources}
        frameSource={frameSource}
        progress={progress}
        colors={VIRIDIS}
        onSelectionChange={onSelectionChange}
        selection={selection}
      />
    );
  } else {
    return null;
  }
}

function mapStateToProps(state: IStore, ownProps: OwnProps): StateProps {
  const {imageId} = (ownProps as any).match.params;
  const image = getImageById(state.images, imageId);
  const loggedIn = isLoggedIn(state.flask);
  const apiKey = auth.selectors.getApiKey(state);
  const fields = image ? image.fields ? image.fields : {} : {};
  return { imageId, image, loggedIn, apiKey, fields };
}

export default connect(mapStateToProps)(ImageViewContainer);
