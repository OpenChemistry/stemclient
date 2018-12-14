import React, { Component } from 'react';
import './STEMImage.css';

import 'vtk.js';

// ugg!
const vtk = window.vtk;

class STEMImage extends Component {

  constructor(props) {
    super(props);
    this.renderWindowContainer  = React.createRef();
    this.initVtkJs();
  }

  initVtkJs() {
    this.genericRenderWindow = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
    this.renderWindow = this.genericRenderWindow.getRenderWindow();
    this.renderer = this.genericRenderWindow.getRenderer()
    this.imageData = vtk.Common.DataModel.vtkImageData.newInstance();
    // Dummy data until we load the stem image
    const data = new Uint8Array(160*160);
    for (let i=0; i< 160*160; i++) {
      data[i] = Math.random()*255;
    }
    this.dataArray = vtk.Common.Core.vtkDataArray.newInstance({
      values: data,
      numberOfComponents: 1,    
      dataType: 'Uint8Array', 
      name: 'scalars',
    });
    
    this.imageData.getPointData().setScalars(this.dataArray);
    this.imageData.setOrigin(0, 0, 0);
    this.imageData.setSpacing(1, 1, 1);
    this.imageData.setDimensions(160, 160, 1);
    this.actor = vtk.Rendering.Core.vtkActor2D.newInstance();
    this.mapper = vtk.Rendering.Core.vtkImageMapper.newInstance();
    this.mapper.setInputData(this.imageData);
    this.actor.setMapper(this.mapper);
    this.renderer.addActor(this.actor);
    this.renderer.resetCamera();
    this.renderWindow.render();
  }
  
  render() {
    const {data} = this.props;
    //if (data) {
    //  this.dataArray.setData(data);      
    //}
    this.renderer.resetCamera();
    this.renderWindow.render();                     
    return (<div ref={this.renderWindowContainer}  className="render-window-container">
            </div>
    );
  }
  
  componentDidMount() {
    this.genericRenderWindow.setContainer(this.renderWindowContainer.current);
    this.genericRenderWindow.resize();
  }
}

export default STEMImage;
