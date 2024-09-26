import React, { useState, Fragment } from 'react';
import './co-tuong.css';
import { initialPieces } from './quan-co'; // Danh sách các quân cờ ban đầu
import 'bootstrap/dist/css/bootstrap.min.css'; // Sử dụng Bootstrap

const Chessboard = () => {
  const [pieces, setPieces] = useState(initialPieces); // Trạng thái danh sách quân cờ
  const [selectedPiece, setSelectedPiece] = useState(null); // Trạng thái quân cờ được chọn
  const [validMoves, setValidMoves] = useState([]); // Các ô hợp lệ để di chuyển

  // Hàm tính toán nước đi hợp lệ cho từng loại quân cờ
  const calculateValidMoves = (piece) => {
    const [row, col] = piece.position;
    const moves = [];

    // Ví dụ tính nước đi cho quân Xe
    if (piece.type === '車') {
      // Đi theo hàng
      for (let i = 0; i < 9; i++) {
        if (i !== col) moves.push([row, i]); 
      }
      // Đi theo cột
      for (let i = 0; i < 10; i++) {
        if (i !== row) moves.push([i, col]); 
      }
    }

    // Ví dụ tính nước đi cho quân Mã
    if (piece.type === '馬') {
      const potentialMoves = [
        [row - 2, col - 1], [row - 2, col + 1],
        [row + 2, col - 1], [row + 2, col + 1],
        [row - 1, col - 2], [row - 1, col + 2],
        [row + 1, col - 2], [row + 1, col + 2]
      ];
      potentialMoves.forEach(move => {
        if (move[0] >= 0 && move[0] < 10 && move[1] >= 0 && move[1] < 9) {
          moves.push(move);
        }
      });
    }

    return moves; // Trả về các nước đi hợp lệ
  };

  // Xử lý khi chọn quân cờ
  const handleSelectPiece = (piece) => {
    console.log(piece);
    if (selectedPiece === piece) {
      // Nếu quân cờ đã được chọn, bỏ chọn
      setSelectedPiece(null);
      setValidMoves([]);
    } else {
      // Chọn quân cờ và tính toán các nước đi hợp lệ
      setSelectedPiece(piece);
      const moves = calculateValidMoves(piece);
      setValidMoves(moves);
    }
  };

  // Xử lý khi di chuyển quân cờ
  const handleMovePiece = (newPosition) => {
    // Nếu vị trí được chọn là hợp lệ, di chuyển quân cờ
    if (selectedPiece && validMoves.some(move => move[0] === newPosition[0] && move[1] === newPosition[1])) {
      const updatedPieces = pieces.map(piece =>
        piece === selectedPiece
          ? { ...piece, position: newPosition } // Cập nhật vị trí mới cho quân cờ
          : piece
      );
      setPieces(updatedPieces); // Cập nhật trạng thái với danh sách quân cờ mới
      setSelectedPiece(null); // Bỏ chọn quân cờ sau khi di chuyển
      setValidMoves([]); // Reset danh sách nước đi hợp lệ
    }
  };

  return (
    <Fragment>
      <div className='container'>
        <div className="g-grid"> 楚河      汉界</div>
        <div className="board" style={{ marginTop: "-471px"}}>
          {/* Hiển thị quân cờ */}
          {pieces.map((piece, index) => (
            <div
              key={index}
              className={`piece ${piece.color} ${selectedPiece === piece ? 'selected' : ''}`}
              style={{
                gridRow: piece.position[0] + 1,
                gridColumn: piece.position[1] + 1,
              }}
              onClick={() => handleSelectPiece(piece)} // Chọn quân cờ
            >
              {piece.type}
            </div>
          ))}

          {/* Chỉ hiển thị các ô trống khi có quân cờ được chọn */}
          {selectedPiece && Array.from({ length: 10 }).map((_, rowIndex) => (
            Array.from({ length: 9 }).map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`empty-cell ${validMoves.some(move => move[0] === rowIndex && move[1] === colIndex) ? 'valid-move' : ''}`} // Kiểm tra xem ô có phải là nước đi hợp lệ không
                style={{
                  gridRow: rowIndex + 1,
                  gridColumn: colIndex + 1,
                  position: 'relative' // Đảm bảo vị trí cho chấm sáng
                }}
                onClick={() => handleMovePiece([rowIndex, colIndex])} // Xử lý khi click vào ô trống
              />
            ))
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Chessboard;
