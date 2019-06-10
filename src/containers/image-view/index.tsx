import React, { useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { VIRIDIS } from '@colormap/presets';

import { IImage, ImageData } from '../../types';
import { IStore } from '../../store';

import { fetchImages, fetchImageField, fetchImageFrames, getImageById } from '../../store/ducks/images';
import { StaticImageDataSource } from '../../stem-image/data';
import { ImageSize, Vec4 } from '../../stem-image/types';
import ImageView from '../../components/image-view';

interface OwnProps {};
interface StateProps {
  imageId: string;
  image?: IImage;
};
type Props = OwnProps & StateProps & DispatchProp;

const ImageViewContainer : React.FC<Props> = ({imageId, image, dispatch}) => {

  const [brightFieldSource] = useState(new StaticImageDataSource());
  const [darkFieldSource] = useState(new StaticImageDataSource());
  const [frameSource] = useState(new StaticImageDataSource());
  const [selection, setSelection] = useState([0, 0, 0, 0] as Vec4);

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

  const onSelectionChange = (newSelection: Vec4) => {
    setSelection(newSelection);

    let size : ImageSize;
    if (brightField) {
      size = brightField.size;
    } else if (darkField) {
      size = darkField.size;
    } else {
      return;
    }

    const positions = [];
    for (let i = newSelection[0]; i < newSelection[1]; ++i) {
      for (let j = newSelection[2]; j < newSelection[3]; ++j) {
        const pixelIndex = i * size.width + j;
        positions.push(pixelIndex);
      }
    }

    dispatch(fetchImageFrames(imageId, positions, 'raw', true));
  }

  if (image && image.fields) {
    return (
      <ImageView
        image={image}
        brightFieldSource={brightFieldSource}
        darkFieldSource={darkFieldSource}
        frameSource={frameSource}
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
  return { imageId, image };
}

export default connect(mapStateToProps)(ImageViewContainer);
