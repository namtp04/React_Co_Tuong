import React, { useState, Fragment } from "react";
import "./co-tuong.css";
import { initialPieces } from "./quan-co";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

const Chessboard = () => {
  const [pieces, setPieces] = useState(initialPieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("red");
  const [showCheckMessage, setShowCheckMessage] = useState(false);

  const calculateValidMoves = (piece, currentPieces = pieces) => {
    const [row, col] = piece.position;
    const moves = [];

    // Hàm kiểm tra ô có bị chiếm bởi quân cờ khác không
    const isOccupied = (position) => {
      return currentPieces.some(
        (p) => p.position[0] === position[0] && p.position[1] === position[1]
      );
    };

    // Hàm kiểm tra xem ô có quân địch không (khác màu)
    const isEnemyPiece = (position, currentColor) => {
      const targetPiece = currentPieces.find(
        (p) => p.position[0] === position[0] && p.position[1] === position[1]
      );
      return targetPiece && targetPiece.color !== currentColor;
    };

    // Hàm kiểm tra xem ô có quân cùng màu không
    const isSameColorPiece = (position, currentColor) => {
      const targetPiece = pieces.find(
        (p) => p.position[0] === position[0] && p.position[1] === position[1]
      );
      return targetPiece && targetPiece.color === currentColor;
    };

    // Tính nước đi cho quân Xe (車)
    if (piece.type === "車" || piece.type === "俥") {
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
    if (piece.type === "馬" || piece.type === "傌") {
      const potentialMoves = [
        [row - 2, col - 1],
        [row - 2, col + 1],
        [row + 2, col - 1],
        [row + 2, col + 1],
        [row - 1, col - 2],
        [row - 1, col + 2],
        [row + 1, col - 2],
        [row + 1, col + 2],
      ];
      const obstacles = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      potentialMoves.forEach((move, index) => {
        if (move[0] >= 0 && move[0] < 10 && move[1] >= 0 && move[1] < 9) {
          if (
            !isOccupied(obstacles[Math.floor(index / 2)]) &&
            (!isOccupied(move) || isEnemyPiece(move, piece.color))
          ) {
            moves.push(move);
          }
        }
      });
    }

    // Tính nước đi cho quân Pháo (炮)
    if (piece.type === "炮" || piece.type === "砲") {
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
    if (piece.type === "象" || piece.type === "相") {
      const potentialMoves = [
        [row - 2, col - 2],
        [row - 2, col + 2],
        [row + 2, col - 2],
        [row + 2, col + 2],
      ];
      potentialMoves.forEach((move) => {
        // Kiểm tra xem nước đi có vượt quá ranh giới sông hay không
        if (
          (piece.color === "red" && move[0] >= 5) || // Tượng đỏ chỉ được di chuyển trên phần của mình (hàng 5 đến 9)
          (piece.color === "black" && move[0] <= 4) // Tượng đen chỉ được di chuyển trên phần của mình (hàng 0 đến 4)
        ) {
          const obstacle = [(row + move[0]) / 2, (col + move[1]) / 2];
          if (!isOccupied(obstacle) && !isSameColorPiece(move, piece.color)) {
            moves.push(move);
          }
        }
      });
    }

    // Tính nước đi cho quân Sĩ (仕 / 士)
    if (piece.type === "仕" || piece.type === "士") {
      const potentialMoves = [
        [row - 1, col - 1],
        [row - 1, col + 1],
        [row + 1, col - 1],
        [row + 1, col + 1],
      ];
      potentialMoves.forEach((move) => {
        if (
          move[0] >= (piece.color === "red" ? 7 : 0) &&
          move[0] <= (piece.color === "red" ? 9 : 2) &&
          move[1] >= 3 &&
          move[1] <= 5 &&
          !isSameColorPiece(move, piece.color)
        ) {
          moves.push(move);
        }
      });
    }

    // Tính nước đi cho quân Tướng (将 / 帅)
    if (piece.type === "将" || piece.type === "帥") {
      const potentialMoves = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      potentialMoves.forEach((move) => {
        if (
          move[0] >= (piece.color === "red" ? 7 : 0) &&
          move[0] <= (piece.color === "red" ? 9 : 2) &&
          move[1] >= 3 &&
          move[1] <= 5 &&
          !isSameColorPiece(move, piece.color)
        ) {
          moves.push(move);
        }
      });
    }

    // Tính nước đi cho quân Tốt (卒 / 兵)
    if (piece.type === "卒" || piece.type === "兵") {
      if (piece.color === "red") {
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

  const isCheckmate = (color, updatedPieces) => {
    const generalPiece = updatedPieces.find(
      (piece) =>
        piece.color === color && (piece.type === "将" || piece.type === "帥")
    );

    if (!generalPiece) {
      console.error("General piece not found for color:", color);
      return true; // This can return true for checkmate since there’s no general
    }

    // 2. Check valid moves for the general
    const validMoves = calculateValidMoves(generalPiece, updatedPieces);

    // If the general has valid moves, it is not checkmate
    if (validMoves.length > 0) {
      return false; // Not checkmate
    }

    // Kiểm tra các quân cờ khác xem có thể chặn chiếu không
    const enemyColor = color === "red" ? "black" : "red";
    for (const piece of updatedPieces) {
      if (piece.color === color) {
        const moves = calculateValidMoves(piece, updatedPieces);
        for (const move of moves) {
          // Kiểm tra xem quân có thể di chuyển để chặn chiếu không
          const newPieces = updatedPieces.map((p) =>
            p === piece ? { ...p, position: move } : p
          );
          if (!isGeneralInCheck(color, newPieces)) {
            return false; // Có quân có thể chặn chiếu
          }

          // Kiểm tra xem quân địch có thể bị bắt không
          const targetPiece = updatedPieces.find(
            (p) =>
              p.position[0] === move[0] &&
              p.position[1] === move[1] &&
              p.color === enemyColor
          );
          if (targetPiece) {
            const newUpdatedPieces = updatedPieces.filter(
              (p) => p !== targetPiece
            );
            if (!isGeneralInCheck(color, newUpdatedPieces)) {
              return false; // Có thể bắt quân địch và tránh chiếu
            }
          }
        }
      }
    }

    // Kiểm tra xem có quân địch nào có thể bị bắt không
    for (const piece of updatedPieces) {
      if (piece.color === enemyColor) {
        const moves = calculateValidMoves(piece, updatedPieces);
        for (const move of moves) {
          // Kiểm tra xem có quân địch nào có thể bị bắt
          const targetPiece = updatedPieces.find(
            (p) =>
              p.position[0] === move[0] &&
              p.position[1] === move[1] &&
              p.color === enemyColor
          );
          if (targetPiece) {
            const newUpdatedPieces = updatedPieces.filter(
              (p) => p !== targetPiece
            );
            if (!isGeneralInCheck(color, newUpdatedPieces)) {
              return false; // Nếu có quân nào có thể bị bắt và không chiếu, không chiếu bí
            }
          }
        }
      }
    }

    return true; // Không còn cách nào để thoát khỏi chiếu
  };

  // Cập nhật hàm handleMovePiece
  const handleMovePiece = (newPosition) => {
    if (
      selectedPiece &&
      validMoves.some(
        (move) => move[0] === newPosition[0] && move[1] === newPosition[1]
      )
    ) {
      let updatedPieces = [...pieces];

      // Check for capturing the enemy piece
      const targetPiece = pieces.find(
        (piece) =>
          piece.position[0] === newPosition[0] &&
          piece.position[1] === newPosition[1]
      );

      if (targetPiece && targetPiece.color !== selectedPiece.color) {
        updatedPieces = updatedPieces.filter((piece) => piece !== targetPiece);
      }

      // Move the selected piece
      updatedPieces = updatedPieces.map((piece) =>
        piece === selectedPiece ? { ...piece, position: newPosition } : piece
      );

      // Check if the move puts the player's general in check
      if (isGeneralInCheck(selectedPiece.color, updatedPieces)) {
        return; // Prevent the move if it puts the general in check
      }

      // Update the pieces on the board
      setPieces(updatedPieces);
      setSelectedPiece(null);
      setValidMoves([]);

      // After the move, check if the opponent's general is in check
      const opponentColor = selectedPiece.color === "red" ? "black" : "red";
      if (isGeneralInCheck(opponentColor, updatedPieces)) {
        showCheckMessageEffect(); // Show check message

        // Check for checkmate
        if (isCheckmate(opponentColor, updatedPieces)) {
          Swal.fire({
            title: "Chiếu bí!",
            text: (turn == "red" ? "Đỏ" : "Đen") + " thắng",
            icon: "success",
          });
          setTurn(null);
          setTimeout(handleReset, 20000);
          return;
        }
      }

      // Switch turns
      setTurn(turn === "red" ? "black" : "red");
    } else {
      setSelectedPiece(null);
      setValidMoves([]);
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

  const handleReset = () => {
    setPieces(initialPieces);
    setTurn("red");
  };

  // Hàm tìm vị trí của tướng
  const findGeneralPosition = (color) => {
    const generalPiece = pieces.find(
      (piece) =>
        (piece.type === "帥" || piece.type === "将") && piece.color === color
    );
    return generalPiece ? generalPiece.position : null;
  };

  // Hàm kiểm tra xem tướng có bị chiếu hay không
  const isGeneralInCheck = (color, updatedPieces) => {
    const generalPosition = findGeneralPosition(color); // Tìm vị trí của tướng
    if (!generalPosition) return false; // Không tìm thấy tướng thì không bị chiếu

    // Tính toán tất cả các nước đi của quân đối thủ
    const enemyColor = color === "red" ? "black" : "red";
    for (const piece of updatedPieces) {
      if (piece.color === enemyColor) {
        const enemyMoves = calculateValidMoves(piece, updatedPieces); // Tính nước đi cho quân đối thủ
        if (
          enemyMoves.some(
            (move) =>
              move[0] === generalPosition[0] && move[1] === generalPosition[1]
          )
        ) {
          return true; // Tướng bị chiếu nếu quân đối thủ có thể đi tới vị trí của tướng
        }
      }
    }
    return false;
  };

  // Hàm để hiển thị thông báo "Chiếu tướng"
  const showCheckMessageEffect = () => {
    setShowCheckMessage(true);
    setTimeout(() => {
      setShowCheckMessage(false); // Ẩn chữ sau 4 giây
    }, 4000);
  };

  return (
    <Fragment>
      <div className="container">
        {/* Hiển thị chữ "Chiếu tướng" */}
        {showCheckMessage && <div className="chieu-tuong">Chiếu tướng</div>}

        <div className="g-grid"> 楚河 汉界</div>
        <div className="board" style={{ marginTop: "-471px" }}>
          {/* Hiển thị quân cờ */}
          {pieces.map((piece, index) => (
            <div
              key={index}
              className={`piece ${piece.color} ${
                selectedPiece === piece ? "selected" : ""
              }`}
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
          {selectedPiece &&
            Array.from({ length: 10 }).map((_, rowIndex) =>
              Array.from({ length: 9 }).map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`empty-cell ${
                    validMoves.some(
                      (move) => move[0] === rowIndex && move[1] === colIndex
                    )
                      ? "valid-move"
                      : ""
                  }`} // Kiểm tra xem ô có phải là nước đi hợp lệ không
                  style={{
                    gridRow: rowIndex + 1,
                    gridColumn: colIndex + 1,
                    position: "relative", // Đảm bảo vị trí cho chấm sáng
                  }}
                  onClick={() => handleMovePiece([rowIndex, colIndex])} // Xử lý khi click vào ô trống
                />
              ))
            )}
        </div>
        <div className="text-center">
          <button className="btn btn-info mt-5" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Chessboard;
