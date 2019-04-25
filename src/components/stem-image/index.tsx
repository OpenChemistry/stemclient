import React from 'react';

type Vec2 = [number, number];

const minMax = (data: Float64Array) : Vec2 => {
  let min = data[0], max = data[0];
  for(let i = 0; i < data.length; i++)
  {
      if(data[i] < min)
      {
          min = data[i];
      }
      if(data[i] > max)
      {
          max = data[i];
      }
  }

  return [min, max];
};

const linearScale = (inRange: Vec2, outRange: Vec2) : (value: number) => number => {
  const iStart = inRange[0],
        iEnd  = inRange[1],
        oStart = outRange[0],
        oEnd  = outRange[1];

  return (value:number) : number => {
    return oStart + (oEnd - oStart) * ((value - iStart) / (iEnd - iStart));
  }
};

interface Props {
  data?: Float64Array;
  pixels?: Uint32Array;
  width?: number;
  height?: number;
}

class STEMImage extends React.Component<Props> {
  private renderWindowContainer = React.createRef<HTMLCanvasElement>();

  dataToPixels(data: Float64Array) : Uint8ClampedArray {
    const [min, max] = minMax(data);
    const pixels =  new Uint8ClampedArray(data.length*4)
    const scale = linearScale([min, max], [0, 255]);

    for(let i=0; i< data.length; i++) {
      const value = scale(data[i])
      pixels[i*4 + 0] = value;
      pixels[i*4 + 1] = value;
      pixels[i*4 + 2] = value;
      pixels[i*4 + 3] = 255;
    }

    return pixels;
  }

  render() {
    const {data, width, height} = this.props;
    if (data) {
      const values = new Float64Array(data);
      const pixels = this.dataToPixels(values);
      const imageData = new ImageData(pixels as any, width as any);
      const ctx = this.renderWindowContainer.current!.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
    }
    const style = {
      width: '45%'
    };
    return (<canvas
              style={style}  width={width} height={height}
              ref={this.renderWindowContainer}  className="render-window-container">
            </canvas>
    );
  }
}

export default STEMImage;
