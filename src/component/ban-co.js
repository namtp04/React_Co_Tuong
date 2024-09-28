import React, { useState, Fragment } from 'react';
import './co-tuong.css';
import { initialPieces } from './quan-co'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 

const Chessboard = () => {
  const [pieces, setPieces] = useState(initialPieces); 
  const [selectedPiece, setSelectedPiece] = useState(null); 
  const [validMoves, setValidMoves] = useState([]); 
  const [turn, setTurn] = useState('red');

  
  const calculateValidMoves = (piece) => {
    const [row, col] = piece.position;
    const moves = [];
  
    // Hàm kiểm tra ô có bị chiếm bởi quân cờ khác không
    const isOccupied = (position) => {
      return pieces.some(p => p.position[0] === position[0] && p.position[1] === position[1]);
    };
  
    // Hàm kiểm tra xem ô có quân địch không (khác màu)
    const isEnemyPiece = (position, currentColor) => {
      const targetPiece = pieces.find(p => p.position[0] === position[0] && p.position[1] === position[1]);
      return targetPiece && targetPiece.color !== currentColor;
    };
  
    // Hàm kiểm tra xem ô có quân cùng màu không
    const isSameColorPiece = (position, currentColor) => {
      const targetPiece = pieces.find(p => p.position[0] === position[0] && p.position[1] === position[1]);
      return targetPiece && targetPiece.color === currentColor;
    };
  
    // Tính nước đi cho quân Xe (車)
    if (piece.type === '車' || piece.type === '俥') {
      // Đi theo hàng
      for (let i = col + 1; i < 9; i++) {
        if (!isOccupied([row, i])) moves.push([row, i]);
        else {
          if (isEnemyPiece([row, i], piece.color)) moves.push([row, i]);
          break;
        }
      }
      for (let i = col - 1; i >= 0; i--) {
        if (!isOccupied([row, i])) moves.push([row, i]);
        else {
          if (isEnemyPiece([row, i], piece.color)) moves.push([row, i]);
          break;
        }
      }
      // Đi theo cột
      for (let i = row + 1; i < 10; i++) {
        if (!isOccupied([i, col])) moves.push([i, col]);
        else {
          if (isEnemyPiece([i, col], piece.color)) moves.push([i, col]);
          break;
        }
      }
      for (let i = row - 1; i >= 0; i--) {
        if (!isOccupied([i, col])) moves.push([i, col]);
        else {
          if (isEnemyPiece([i, col], piece.color)) moves.push([i, col]);
          break;
        }
      }
    }
  
    // Tính nước đi cho quân Mã (馬)
    if (piece.type === '馬'||piece.type === '傌') {
      const potentialMoves = [
        [row - 2, col - 1], [row - 2, col + 1],
        [row + 2, col - 1], [row + 2, col + 1],
        [row - 1, col - 2], [row - 1, col + 2],
        [row + 1, col - 2], [row + 1, col + 2]
      ];
      const obstacles = [
        [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
      ];
      potentialMoves.forEach((move, index) => {
        if (move[0] >= 0 && move[0] < 10 && move[1] >= 0 && move[1] < 9) {
          if (!isOccupied(obstacles[Math.floor(index / 2)]) && (!isOccupied(move) || isEnemyPiece(move, piece.color))) {
            moves.push(move);
          }
        }
      });
    }
  
    // Tính nước đi cho quân Pháo (炮)
    if (piece.type === '炮' || piece.type === '砲') {
      let jump = false;
      // Đi theo hàng
      for (let i = col + 1; i < 9; i++) {
        if (!isOccupied([row, i])) {
          if (!jump) moves.push([row, i]);
        } else if (!jump) {
          jump = true;
        } else {
          if (isEnemyPiece([row, i], piece.color)) moves.push([row, i]);
          break;
        }
      }
      jump = false;
      for (let i = col - 1; i >= 0; i--) {
        if (!isOccupied([row, i])) {
          if (!jump) moves.push([row, i]);
        } else if (!jump) {
          jump = true;
        } else {
          if (isEnemyPiece([row, i], piece.color)) moves.push([row, i]);
          break;
        }
      }
      // Đi theo cột
      jump = false;
      for (let i = row + 1; i < 10; i++) {
        if (!isOccupied([i, col])) {
          if (!jump) moves.push([i, col]);
        } else if (!jump) {
          jump = true;
        } else {
          if (isEnemyPiece([i, col], piece.color)) moves.push([i, col]);
          break;
        }
      }
      jump = false;
      for (let i = row - 1; i >= 0; i--) {
        if (!isOccupied([i, col])) {
          if (!jump) moves.push([i, col]);
        } else if (!jump) {
          jump = true;
        } else {
          if (isEnemyPiece([i, col], piece.color)) moves.push([i, col]);
          break;
        }
      }
    }
  
    // Tính nước đi cho quân Tượng (象 / 相)
    if (piece.type === '象' || piece.type === '相') {
      const potentialMoves = [
        [row - 2, col - 2], [row - 2, col + 2],
        [row + 2, col - 2], [row + 2, col + 2]
      ];
      potentialMoves.forEach(move => {
        if (move[0] >= 0 && move[0] < 10 && move[1] >= 0 && move[1] < 9) {
          const obstacle = [(row + move[0]) / 2, (col + move[1]) / 2];
          if (!isOccupied(obstacle) && !isSameColorPiece(move, piece.color)) {
            moves.push(move);
          }
        }
      });
    }
  
    // Tính nước đi cho quân Sĩ (仕 / 士)
    if (piece.type === '仕' || piece.type === '士') {
      const potentialMoves = [
        [row - 1, col - 1], [row - 1, col + 1],
        [row + 1, col - 1], [row + 1, col + 1]
      ];
      potentialMoves.forEach(move => {
        if (
          move[0] >= (piece.color === 'red' ? 7 : 0) && move[0] <= (piece.color === 'red' ? 9 : 2) &&
          move[1] >= 3 && move[1] <= 5 &&
          (!isSameColorPiece(move, piece.color))
        ) {
          moves.push(move);
        }
      });
    }
  
    // Tính nước đi cho quân Tướng (将 / 帅)
    if (piece.type === '将' || piece.type === '帥') {
      const potentialMoves = [
        [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1]
      ];
      potentialMoves.forEach(move => {
        if (
          move[0] >= (piece.color === 'red' ? 7 : 0) && move[0] <= (piece.color === 'red' ? 9 : 2) &&
          move[1] >= 3 && move[1] <= 5 &&
          (!isSameColorPiece(move, piece.color))
        ) {
          moves.push(move);
        }
      });
    }
  
    // Tính nước đi cho quân Tốt (卒 / 兵)
    if (piece.type === '卒' || piece.type === '兵') {
      if (piece.color === 'red') {
        if (row > 4) moves.push([row - 1, col]);
        else {
          moves.push([row - 1, col]);
          if (col > 0) moves.push([row, col - 1]);
          if (col < 8) moves.push([row, col + 1]);
        }
      } else {
        if (row < 5) moves.push([row + 1, col]);
        else {
          moves.push([row + 1, col]);
          if (col > 0) moves.push([row, col - 1]);
          if (col < 8) moves.push([row, col + 1]);
        }
      }
    }
  
    return moves; // Trả về các nước đi hợp lệ
  };

  // Xử lý khi di chuyển quân cờ
  const handleMovePiece = (newPosition) => {
    // Nếu vị trí được chọn là hợp lệ
    if (selectedPiece && validMoves.some(move => move[0] === newPosition[0] && move[1] === newPosition[1])) {
      // Kiểm tra xem vị trí di chuyển có quân đối phương không
      const targetPiece = pieces.find(piece =>
        piece.position[0] === newPosition[0] && piece.position[1] === newPosition[1]
      );
  
      let updatedPieces = [...pieces]; // Copy danh sách quân cờ hiện tại
  
      if (targetPiece && targetPiece.color !== selectedPiece.color) {
        // Nếu vị trí có quân đối phương, loại bỏ quân cờ đó
        updatedPieces = updatedPieces.filter(piece => piece !== targetPiece);
      }
  
      // Cập nhật vị trí mới cho quân cờ đang chọn
      updatedPieces = updatedPieces.map(piece =>
        piece === selectedPiece
          ? { ...piece, position: newPosition } // Cập nhật vị trí mới cho quân cờ
          : piece
      );
  
      setPieces(updatedPieces); // Cập nhật trạng thái với danh sách quân cờ mới
      setSelectedPiece(null); // Bỏ chọn quân cờ sau khi di chuyển
      setValidMoves([]); // Reset danh sách nước đi hợp lệ

      // Chuyển lượt sang bên kia sau khi di chuyển
      setTurn(turn === 'red' ? 'black' : 'red');
    } else {
      // Nếu vị trí được chọn không hợp lệ, hủy chọn quân cờ
      setSelectedPiece(null);
      setValidMoves([]); // Xóa các nước đi hợp lệ
    }
  };
  

  // Xử lý khi chọn quân cờ
  const handleSelectPiece = (piece) => {

    if (piece.color !== turn) {
      // Nếu chọn quân cờ không phải của người chơi đang có lượt, không làm gì cả
      return;
    }

    if (selectedPiece) {
      // Nếu đã chọn quân cờ và quân cờ mới cùng màu, chọn quân mới
      if (selectedPiece.color === piece.color) {
        setSelectedPiece(piece);
        const moves = calculateValidMoves(piece);
        setValidMoves(moves);
      } else {
        // Nếu chọn quân cờ khác màu, không làm gì cả (có thể tùy chỉnh thêm)
        return;
      }
    } else {
      // Nếu chưa có quân cờ nào được chọn, chọn quân cờ hiện tại
      setSelectedPiece(piece);
      const moves = calculateValidMoves(piece);
      setValidMoves(moves);
    }
  };

  const handleReset = ()=>{
    setPieces(initialPieces);
    setTurn('red');
  }

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
        <div className='text-center'>
          <button className='btn btn-info mt-5' onClick={handleReset}>Reset</button>
        </div>
      </div>
    </Fragment>
  );
};

export default Chessboard;
