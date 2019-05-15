import React, { useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { VIRIDIS, PLASMA } from '@colormap/presets';

import { IImage, ImageField } from '../../types';
import { IStore } from '../../store';
import STEMImage from '../../components/stem-image';
import { fetchImageField, getImageById } from '../../store/ducks/images';
import { StaticImageDataSource } from '../../stem-image/data';
import { ImageSize } from '../../stem-image/types';

interface OwnProps {};
interface StateProps {
  imageId: string;
  image?: IImage;
};
type Props = OwnProps & StateProps & DispatchProp;

const ImageViewContainer : React.FC<Props> = ({imageId, image, dispatch}) => {
  useEffect(() => {
    if (imageId) {
      dispatch(fetchImageField(imageId, 'bright'));
      dispatch(fetchImageField(imageId, 'dark'));
    }
  }, [imageId, dispatch]);

  let darkField : ImageField | undefined;
  let brightField : ImageField | undefined;

  if (image && image.fields) {
    brightField = image.fields['bright'];
    darkField = image.fields['dark'];
  }

  const [brightFieldSource] = useState(new StaticImageDataSource());
  const [darkFieldSource] = useState(new StaticImageDataSource());
  const [selectedPixel, setSelectedPixel] = useState([-1, -1]);

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
    const [x, y] = selectedPixel;
    if (x < 0 || y < 0) {
      return;
    }
    // dispatch diffractogram fetching here
  }, [selectedPixel]);

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

    if (X !== selectedPixel[0] || Y !== selectedPixel[1]) {
      setSelectedPixel([X, Y]);
    }
  }

  if (image && image.fields) {
    return (
      <div style={{display: 'flex'}}>
        <div style={{width: '50%'}}>
          <STEMImage source={brightFieldSource} colors={PLASMA} onPixelClick={onPixelClick}/>
        </div>
        <div style={{width: '50%'}}>
          <STEMImage source={darkFieldSource} colors={VIRIDIS} onPixelClick={onPixelClick}/>
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
