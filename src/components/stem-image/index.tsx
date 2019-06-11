import React from 'react';
import { RGBColor } from '@colormap/core';
import { ImageDataSource } from '../../stem-image/data';
import { ImageView } from '../../stem-image/view';
import Overlay from '../overlay';

interface Props {
  source: ImageDataSource;
  colors?: RGBColor[];
  onPixelClick?: (x: number, y: number) => void;
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

  onPixelClick = (event: any) => {
    const { onPixelClick } = this.props;
    if (!onPixelClick) {
      return;
    }
    const rect = event.target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onPixelClick(x, y);
  }

  render() {
    const { children } = this.props;
    return (
      <div style={{position: 'relative', width: '100%', fontSize: 0}} ref={this.containerRef}>
        <Overlay>
          {children}
        </Overlay>
      </div>
    )
  }
}
