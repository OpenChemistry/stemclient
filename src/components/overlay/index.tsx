import React, {Fragment} from 'react';

const Overlay : React.FC<{}> = ({children}) => {
  return (
    <Fragment>
      {React.Children.toArray(children).map((child, i) => (
        <div key={i} style={{position: 'absolute', width: '100%', height: '100%', left: 0, top: 0}}>
          {child}
        </div>
      ))}
    </Fragment>
  )
}

export default Overlay;
