import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainFlow from './components/MainFlow.jsx';
import AdminPanel from './components/AdminPanel.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainFlow />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
