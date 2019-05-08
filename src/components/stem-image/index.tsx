import React from 'react';
import { RGBColor } from '@colormap/core';
import { ImageDataSource } from '../../stem-image/data';
import { ImageView } from '../../stem-image/view';

interface Props {
  source: ImageDataSource;
  colors?: RGBColor[];
}

export default class STEMImage extends React.Component<Props> {
  private containerRef = React.createRef<HTMLDivElement>();
  private imageView : ImageView | null = null;

  componentDidMount() {
    const { source } = this.props;
    this.imageView = new ImageView(this.containerRef.current!, source);
    this.updateColorMap();
  }

  componentWillUpdate(prevProps: Props) {
    const { colors } = this.props;
    if (colors !== prevProps.colors) {
      this.updateColorMap();
    }
  }

  componentWillUnmount() {
    if (this.imageView) {
      this.imageView.unsubscribe();
    }
  }

  updateColorMap() {
    const { colors } = this.props;
    if (this.imageView && colors) {
      this.imageView.setColorMap(colors);
    }
  }

  render() {
    return (
      <div style={{width: '100%'}} ref={this.containerRef}></div>
    )
  }
}
