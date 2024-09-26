import React from 'react';
import ReactDOM from 'react-dom';
import Chessboard from './component/ban-co';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <div>
      <h1 className='text-center mb-5'>Bàn Cờ Tướng</h1>
      <Chessboard />
    </div>
  );
};

export default App;
