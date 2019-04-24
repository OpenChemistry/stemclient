import React from 'react';
import './App.css';
import LivePreview from './containers/live-preview';

const App: React.FC = () => {
  return (
    <div className="App">
      <LivePreview/>
    </div>
  );
}

export default App;
