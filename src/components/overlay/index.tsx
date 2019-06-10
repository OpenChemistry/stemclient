import React from 'react';

const Overlay : React.FC<{}> = ({children}) => {
  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      {React.Children.toArray(children).map((child, i) => (
        <div key={i} style={{position: 'absolute', width: '100%'}}>
          {child}
        </div>
      ))}
    </div>
  )
}

export default Overlay;
