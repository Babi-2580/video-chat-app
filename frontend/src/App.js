import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JoinRoom from './components/JoinRoom';
import VideoRoom from './components/VideoRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<VideoRoom />} />
      </Routes>
    </Router>
  );
}

export default App;