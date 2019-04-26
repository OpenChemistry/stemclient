import React from 'react';
import { ImageDataSource } from '../../stem-image/data';
import { ImageView } from '../../stem-image/view';

interface Props {
  source: ImageDataSource;
}

export default class STEMImage extends React.Component<Props> {
  private containerRef = React.createRef<HTMLDivElement>();
  private imageView : ImageView | null = null;

  componentDidMount() {
    const { source } = this.props;
    this.imageView = new ImageView(this.containerRef.current!, source);
  }

  componentWillUnmount() {
    if (this.imageView) {
      this.imageView.unsubscribe();
    }
  }

  render() {
    return (
      <div style={{width: '100%'}} ref={this.containerRef}></div>
    )
  }
}
