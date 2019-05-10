import React, { useEffect } from 'react';
import { connect, DispatchProp } from 'react-redux';

import { IImage } from '../../types';
import { IStore } from '../../store';
import { fetchImages, getImages } from '../../store/ducks/images';
import ImagesList from '../../components/images-list';

interface OwnProps {};
interface StateProps {
  images: IImage[];
};
type Props = OwnProps & StateProps & DispatchProp;

const ImagesListContainer : React.FC<Props> = (props) => {
  const { images, dispatch } = props;
  useEffect(() => {
    dispatch(fetchImages());
  }, [dispatch]);
  return <ImagesList images={images} />;
}

function mapStateToProps(state: IStore): StateProps {
  const images = getImages(state.images);
  return { images };
}

export default connect(mapStateToProps)(ImagesListContainer);
