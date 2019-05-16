import React, { useEffect } from 'react';
import { connect, DispatchProp } from 'react-redux';

import { IImage } from '../../types';
import { IStore } from '../../store';
import {ROOT_ROUTE, LIST_ROUTE} from '../../routes';
import { fetchImages, getImages } from '../../store/ducks/images';
import ImagesList from '../../components/images-list';
import { push } from 'connected-react-router';

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

  const onOpen = (_id: string) => {
    dispatch(push(`${ROOT_ROUTE}${LIST_ROUTE}/${_id}`));
  }

  return <ImagesList images={images} onOpen={onOpen}/>;
}

function mapStateToProps(state: IStore): StateProps {
  const images = getImages(state.images);
  return { images };
}

export default connect(mapStateToProps)(ImagesListContainer);
