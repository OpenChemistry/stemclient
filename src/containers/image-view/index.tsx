import React, { useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { VIRIDIS, BLACK_WHITE } from '@colormap/presets';

import { IImage, ImageData } from '../../types';
import { IStore } from '../../store';
import STEMImage from '../../components/stem-image';
import { fetchImageField, fetchImageFrame, getImageById } from '../../store/ducks/images';
import { StaticImageDataSource } from '../../stem-image/data';
import { ImageSize } from '../../stem-image/types';

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
  const [selectedPixel, setSelectedPixel] = useState(-1);

  let darkField : ImageData | undefined;
  let brightField : ImageData | undefined;
  let rawFrame : ImageData | undefined;

  if (image && image.fields) {
    brightField = image.fields['bright'];
    darkField = image.fields['dark'];
  }

  if (image && image.frames) {
    rawFrame = image.frames[selectedPixel];
  }

  useEffect(() => {
    if (imageId) {
      dispatch(fetchImageField(imageId, 'bright'));
      dispatch(fetchImageField(imageId, 'dark'));
    }
  }, [imageId, dispatch]);

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

  useEffect(() => {
    if (selectedPixel < 0) {
      return;
    }

    dispatch(fetchImageFrame(imageId, selectedPixel));
  }, [selectedPixel, imageId, dispatch]);

  const onPixelClick = (x: number, y: number) => {
    let size : ImageSize;
    if (brightField) {
      size = brightField.size;
    } else if (darkField) {
      size = darkField.size;
    } else {
      return;
    }

    const X = Math.floor(x * size.width);
    const Y = Math.floor(y * size.height);

    const pixelIndex = Y * size.width + X;
    if (pixelIndex !== selectedPixel) {
      setSelectedPixel(pixelIndex);
    }
  }

  if (image && image.fields) {
    return (
      <div style={{display: 'flex'}}>
        <div style={{width: '25%'}}>
          <STEMImage source={brightFieldSource} colors={VIRIDIS} onPixelClick={onPixelClick}/>
        </div>
        <div style={{width: '25%'}}>
          <STEMImage source={darkFieldSource} colors={VIRIDIS} onPixelClick={onPixelClick}/>
        </div>
        <div style={{width: '25%'}}></div>
        <div style={{width: '25%'}}>
          <STEMImage source={frameSource} colors={BLACK_WHITE}/>
        </div>
      </div>
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
