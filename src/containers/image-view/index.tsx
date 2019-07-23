import React, { useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { VIRIDIS } from '@colormap/presets';
import { auth } from '@openchemistry/girder-redux';

import { IImage, ImageData } from '../../types';
import { IStore } from '../../store';

import { isLoggedIn } from '../../store/ducks/flask';
import { fetchImages, fetchImageField, fetchImageFrames, getImageById } from '../../store/ducks/images';
import { StaticImageDataSource } from '../../stem-image/data';
import { ImageSize, Vec2 } from '../../stem-image/types';
import ImageView from '../../components/image-view';

interface OwnProps {};
interface StateProps {
  imageId: string;
  loggedIn: boolean;
  apiKey: string;
  image?: IImage;
};
type Props = OwnProps & StateProps & DispatchProp;

const ImageViewContainer : React.FC<Props> = ({imageId, image, loggedIn, apiKey, dispatch}) => {

  const [brightFieldSource] = useState(new StaticImageDataSource());
  const [darkFieldSource] = useState(new StaticImageDataSource());
  const [frameSource] = useState(new StaticImageDataSource());
  const [selection, setSelection] = useState([[0, 0], [0, 0]] as Vec2[]);
  const [progress, setProgress] = useState(100);

  let darkField : ImageData | undefined;
  let brightField : ImageData | undefined;
  let rawFrame : ImageData | undefined;

  if (image && image.fields) {
    brightField = image.fields['bright'];
    darkField = image.fields['dark'];
  }

  if (image && image.frames) {
    rawFrame = image.frames['cumulated'];
  }

  useEffect(() => {
    dispatch(auth.actions.loadApiKey({name: 'stempy'}));
  }, []);

  useEffect(() => {
    if (imageId) {
      dispatch(fetchImageField(imageId, 'bright'));
      dispatch(fetchImageField(imageId, 'dark'));
    }
  }, [imageId, dispatch]);

  useEffect(() => {
    if (imageId && !image) {
      dispatch(fetchImages());
    }
  }, [imageId, image, dispatch]);

  useEffect(() => {
    if (brightField) {
      brightFieldSource.setImageSize(brightField.size);
      brightFieldSource.setImageData(new Float64Array(brightField.data));
    }
  }, [brightField, brightFieldSource]);

  useEffect(() => {
    if (darkField) {
      darkFieldSource.setImageSize(darkField.size);
      darkFieldSource.setImageData(new Float64Array(darkField.data));
    }
  }, [darkField, darkFieldSource]);

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

    let size : ImageSize;
    if (brightField) {
      size = brightField.size;
    } else if (darkField) {
      size = darkField.size;
    } else {
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

    dispatch(fetchImageFrames(imageId, positions, 'raw', true, callback));
  }

  if (image && image.fields) {
    return (
      <ImageView
        loggedIn={loggedIn}
        apiKey={apiKey}
        image={image}
        brightFieldSource={brightFieldSource}
        darkFieldSource={darkFieldSource}
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
  return { imageId, image, loggedIn, apiKey };
}

export default connect(mapStateToProps)(ImageViewContainer);
