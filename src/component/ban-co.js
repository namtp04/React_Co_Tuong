import React, { useState, Fragment, useEffect } from "react";
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
  const [checkCounter, setCheckCounter] = useState(0);
  const [lastCheckingPiece, setLastCheckingPiece] = useState(null);
  const [turnFirst, setTurnFirst] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);

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

  // Hàm kiểm tra xem tướng có bị chiếu hay không
  const isGeneralInCheck = (color, updatedPieces) => {
    // Tìm vị trí của tướng
    const generalPiece = updatedPieces.find(
      (piece) =>
        piece.color === color && (piece.type === "将" || piece.type === "帥")
    );

    if (!generalPiece) {
      console.error("Không tìm thấy tướng cho màu:", color);
      return false;
    }

    const generalPosition = generalPiece.position;

    // Tính toán tất cả các nước đi của quân đối thủ
    const enemyColor = color === "red" ? "black" : "red";
    for (const piece of updatedPieces) {
      if (piece.color === enemyColor) {
        const enemyMoves = calculateValidMoves(piece, updatedPieces);

        // Kiểm tra xem có nước đi nào của đối thủ tới vị trí của tướng không
        if (
          enemyMoves.some(
            (move) =>
              move[0] === generalPosition[0] && move[1] === generalPosition[1]
          )
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const handleSelectPiece = (piece) => {
    if (piece.color !== turn) {
      return;
    }

    if (selectedPiece) {
      if (selectedPiece.color === piece.color) {
        
        setSelectedPiece(piece);
        const moves = calculateValidMoves(piece);
        setValidMoves(moves);
      } else {
        return;
      }
    } else {
      setSelectedPiece(piece);
      const moves = calculateValidMoves(piece);
      setValidMoves(moves);
    }
  };

  const handleMovePiece = (newPosition) => {
      
    if (
      selectedPiece &&
      validMoves.some(
        (move) => move[0] === newPosition[0] && move[1] === newPosition[1]
      )
    ) {
      let updatedPieces = [...pieces];
      

      // Kiểm tra bắt quân địch
      const targetPiece = pieces.find(
        (piece) =>
          piece.position[0] === newPosition[0] &&
          piece.position[1] === newPosition[1]
      );

      if (targetPiece && targetPiece.color !== selectedPiece.color) {
        updatedPieces = updatedPieces.filter((piece) => piece !== targetPiece);
      }
      
      const oldPosition = selectedPiece.position;

      // Di chuyển quân cờ đã chọn
      updatedPieces = updatedPieces.map((piece) =>
        piece === selectedPiece ? { ...piece, position: newPosition } : piece
      );

      // Kiểm tra xem nước đi có làm cho tướng của người chơi bị chiếu không
      if (isGeneralInCheck(selectedPiece.color, updatedPieces)) {
        return;
      }

      // Cập nhật quân cờ trên bàn cờ
      setPieces(updatedPieces);
      setPreviousPosition(oldPosition);
      setValidMoves([]);
      console.log(selectedPiece);
      setSelectedPiece(null);

      // Sau khi di chuyển, kiểm tra xem tướng của đối thủ có bị chiếu không
      const opponentColor = selectedPiece.color === "red" ? "black" : "red";
      if (isGeneralInCheck(opponentColor, updatedPieces)) {
        if (isCheckmate(opponentColor, updatedPieces)) {
          Swal.fire({
            title: "Chiếu bí!",
            text: `${turn === "red" ? "Đỏ" : "Đen"} thắng!`,
            icon: "success",
          });
          setTurn(null);
          setTimeout(handleReset, 5000);
          return;
        }

        // Cập nhật số lần chiếu tướng
        if (selectedPiece === lastCheckingPiece) {
          setCheckCounter((prevCount) => prevCount + 1);
          console.log(checkCounter);
        } else {
          setCheckCounter(1);
          setLastCheckingPiece(selectedPiece);
        }

        // Nếu chiếu tướng liên tục 5 lần, xử thua
        if (checkCounter >= 5) {
          Swal.fire({
            title: "Thua cuộc!",
            text: `${
              turn === "red" ? "Đỏ" : "Đen"
            } bị xử thua do lặp chiếu tướng quá nhiều lần.`,
            icon: "error",
          });
          setTurn(null);
          setTimeout(handleReset, 5000);
          return;
        }

        showCheckMessageEffect();
      }

      // Chuyển lượt
      setTurn(turn === "red" ? "black" : "red");
    } else {
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const isCheckmate = (color, updatedPieces) => {
    // Tìm quân tướng của bên đang bị chiếu
    const generalPiece = updatedPieces.find(
      (piece) =>
        piece.color === color && (piece.type === "将" || piece.type === "帥")
    );

    if (!generalPiece) {
      console.error("General piece not found for color:", color);
      return false;
    }

    // Kiểm tra xem tướng có đang bị chiếu không
    if (!isGeneralInCheck(color, updatedPieces)) {
      return false;
    }

    // Kiểm tra nếu tướng có thể di chuyển thoát chiếu
    const generalMoves = calculateValidMoves(generalPiece, updatedPieces);
    for (const move of generalMoves) {
      const newBoardState = updatedPieces.map((p) =>
        p.type === generalPiece.type ? { ...p, position: move } : p
      );
      if (!isGeneralInCheck(color, newBoardState)) {
        console.log("Tướng không bị chiếu tại trạng thái này:", newBoardState);
        return false;
      }
    }

    // Kiểm tra nếu có quân khác có thể cứu tướng
    const piecesUnderThreat = updatedPieces.filter(
      (piece) => piece.color === color
    );

    for (const piece of piecesUnderThreat) {
      const validMoves = calculateValidMoves(piece, updatedPieces);
      for (const move of validMoves) {
        const newBoardState = updatedPieces.map((p) =>
          p.type === piece.type ? { ...p, position: move } : p
        );

        // Nếu có quân cờ khác có thể cứu thoát tướng, không phải chiếu bí
        if (!isGeneralInCheck(color, newBoardState)) {
          console.log(
            "Tướng không bị chiếu tại trạng thái này:",
            newBoardState
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleReset = () => {
    setPieces(initialPieces);
    setTurn(turn === "red" ? "black" : "red");
    setCheckCounter(0);
    setLastCheckingPiece(null);
  };

  const findGeneralPosition = (color) => {
    const generalPiece = pieces.find(
      (piece) =>
        (piece.type === "帥" || piece.type === "将") && piece.color === color
    );
    return generalPiece ? generalPiece.position : null;
  };

  const showCheckMessageEffect = () => {
    setShowCheckMessage(true);
    setTimeout(() => {
      setShowCheckMessage(false);
    }, 2000);
  };

  useEffect(() => {
    setTurnFirst(true);
    if(selectedPiece){
      setPreviousPosition(selectedPiece.position);
    }
    setTimeout(() => {
      setTurnFirst(false);
    }, 2000);
  }, [turn,previousPosition]);

  return (
    <Fragment>
      <div className="container">
        {/* Hiển thị chữ "Chiếu tướng" */}
        {showCheckMessage ? (
        <div className="chieu-tuong">Chiếu tướng</div>
      ) : (
        // Hiển thị lượt chơi nếu không phải chiếu tướng
        turnFirst && (
          <div
            className="turn-first"
            style={{ color: turn === "red" ? "red" : "black" }}
          >
            Đến lượt {turn === "red" ? "đỏ" : "đen"}
          </div>
        )
      )}

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
              Array.from({ length: 9 }).map((_, colIndex) => {
                const isPreviousPosition =
                  previousPosition &&
                  previousPosition[0] === rowIndex &&
                  previousPosition[1] === colIndex;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`empty-cell ${
                      validMoves.some(
                        (move) => move[0] === rowIndex && move[1] === colIndex
                      )
                        ? "valid-move"
                        : ""
                    } ${isPreviousPosition ? "previous-position" : ""}`} // Kiểm tra xem ô có phải là nước đi hợp lệ không
                    style={{
                      gridRow: rowIndex + 1,
                      gridColumn: colIndex + 1,
                      position: "relative",
                    }}
                    onClick={() => handleMovePiece([rowIndex, colIndex])} // Xử lý khi click vào ô trống
                  />
                );
              })
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
