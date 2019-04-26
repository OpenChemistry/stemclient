import React from 'react';
import { ImageDataSource } from '../../stem-image/data';
import { ImageView } from '../../stem-image/view';
import { Vec3 } from '../../stem-image/types';

interface Props {
  source: ImageDataSource;
  colorMap?: Vec3[];
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
    const { colorMap } = this.props;
    if (colorMap !== prevProps.colorMap) {
      this.updateColorMap();
    }
  }

  componentWillUnmount() {
    if (this.imageView) {
      this.imageView.unsubscribe();
    }
  }

  updateColorMap() {
    const { colorMap } = this.props;
    if (this.imageView && colorMap) {
      this.imageView.setColorMap(colorMap);
    }
  }

  render() {
    return (
      <div style={{width: '100%'}} ref={this.containerRef}></div>
    )
  }
}
