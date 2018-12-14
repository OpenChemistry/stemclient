import React, { Component } from 'react';
import './STEMImage.css';

import 'vtk.js';

// ugg!
class STEMImage extends Component {

  constructor(props) {
    super(props);
    this.renderWindowContainer  = React.createRef();
  }

  render() {
    const {data} = this.props;
    if (data) {
      const values = new Uint8Array(data);
      const pixels = new Uint8ClampedArray(160*160*4);
      for(let i=0; i< 160*160; i++) {
        const value = values[i];
       
        pixels[i*4 + 0] = value;
        pixels[i*4 + 1] = value;
        pixels[i*4 + 2] = value;
        pixels[i*4 + 3] = 255;
      }
      var iData = new ImageData(pixels, 160);
      var ctx = this.renderWindowContainer.current.getContext('2d');
      ctx.putImageData(iData, 0, 0);      
    }                    
    return (<canvas width='160' height='160' ref={this.renderWindowContainer}  className="render-window-container">
            </canvas>
    );
  }
}

export default STEMImage;
