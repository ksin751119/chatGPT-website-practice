import './App.css'
import React, { useState, useEffect, useRef } from "react";

const boardSetting = {
    rows: 8,
    columns: 10,
    dropAnimationRate: 50,
    flashAnimationRate: 600,
    colors: {
      empty: "#AAAAAA",
      p1: "#BB2222",
      p2: "#2222BB"
    }
  };

  const winTypes = {
    vertical: 0,
    horizontal: 1,
    forwardsDiagonal: 2,
    backwardsDiagonal: 3
  };

function WelcomePage(props) {

    const [board, setBoard] = useState(createBoard());
    const [currentPlayer, setCurrentPlayer] = useState(getFirstPlayerTurn());
    const [win, setWin] = useState(null);
    const [flashTimer, setFlashTimer] = useState(null);
    const [dropping, setDropping] = useState(false);
    const domBoard = useRef(null);


    /**
     * Helper function to get the index in the board using row and column.
     * @param {number} row - row in board
     * @param {number} column - column in board
     */
    function getIndex(row, column) {
      const index = row * boardSetting.columns + column;
      if (index > boardSetting.rows * boardSetting.colums) return null;
      return index;
    }
    function getRowAndColumn(index) {
      if (index > boardSetting.rows * boardSetting.colums) return null;
      const row = Math.floor(index / boardSetting.columns);
      const column = Math.floor(index % boardSetting.columns);
      return {
        row,
        column
      };
    }

    function createBoard() {
      return new Array(boardSetting.rows * boardSetting.columns).fill(
        boardSetting.colors.empty
      );
    }

    function getFirstPlayerTurn() {
      return boardSetting.colors.p1;
    }

    function restartGame() {
      setCurrentPlayer(getFirstPlayerTurn());
      setWin(null);
      setBoard(createBoard());
    }

    function getDomBoardCell(index) {
      if (!domBoard.current) return;
      const board = domBoard.current;
      const blocks = board.querySelectorAll(".board-block");
      return blocks[index];
    }

    function findFirstEmptyRow(column) {
      let { empty } = boardSetting.colors;
      let { rows } = boardSetting;
      for (let i = 0; i < rows; i++) {
        if (board[getIndex(i, column)] !== empty) {
          return i - 1;
        }
      }
      return rows - 1;
    }

async function handleDrop(column) {
  if (dropping || win) return;
  const row = findFirstEmptyRow(column);
  if (row < 0) return;
  setDropping(true);
  await animateDrop(row, column, currentPlayer);
  setDropping(false);
  const newBoard = board.slice();
  newBoard[getIndex(row, column)] = currentPlayer;
  setBoard(newBoard);
  // Check for win

  setCurrentPlayer(
    currentPlayer === boardSetting.colors.p1
    ? boardSetting.colors.p2
    : boardSetting.colors.p1
  );
}

    async function animateDrop(row, column, color, currentRow) {
      if (currentRow === undefined) {
        currentRow = 0;
      }
      return new Promise(resolve => {
        if (currentRow > row) {
          return resolve();
        }
        if (currentRow > 0) {
          let c = getDomBoardCell(getIndex(currentRow - 1, column));
          c.style.backgroundColor = boardSetting.colors.empty;
        }
        let c = getDomBoardCell(getIndex(currentRow, column));
        c.style.backgroundColor = color;
        setTimeout(
          () => resolve(animateDrop(row, column, color, ++currentRow)),
          boardSetting.dropAnimationRate
        );
      });
    }

    /**
     * End game animation.
     */
    useEffect(() => {
      if (!win) {
        return;
      }

      function flashWinningCells(on) {
        const { empty } = boardSetting.colors;
        const { winner } = win;
        for (let o of win.winningCells) {
          let c = getDomBoardCell(getIndex(o.row, o.column));
          c.style.backgroundColor = on ? winner : empty;
        }
        setFlashTimer(
          setTimeout(
            () => flashWinningCells(!on),
            boardSetting.flashAnimationRate
          )
        );
      }

      flashWinningCells(true);
    }, [win, setFlashTimer]);

    /**
     * Clears the end game animation timeout when game is restarted.
     */
    useEffect(() => {
      if (!win) {
        if (flashTimer) clearTimeout(flashTimer);
      }
    }, [win, flashTimer]);

    /**
     * Check for win when the board changes.
     */
    useEffect(() => {
      if (dropping || win) return;

      function isWin() {
        return (
          isForwardsDiagonalWin() ||
          isBackwardsDiagonalWin() ||
          isHorizontalWin() ||
          isVerticalWin ||
          null
        );
      }

      function createWinState(start, winType) {
        const win = {
          winner: board[start],
          winningCells: []
        };

        let pos = getRowAndColumn(start);

        while (true) {
          let current = board[getIndex(pos.row, pos.column)];
          if (current === win.winner) {
            win.winningCells.push({ ...pos });
            if (winType === winTypes.horizontal) {
              pos.column++;
            } else if (winType === winTypes.vertical) {
              pos.row++;
            } else if (winType === winTypes.backwardsDiagonal) {
              pos.row++;
              pos.column++;
            } else if (winType === winTypes.forwardsDiagonal) {
              pos.row++;
              pos.column--;
            }
          } else {
            return win;
          }
        }
      }
      function isHorizontalWin() {
        const { rows } = boardSetting;
        const { columns } = boardSetting;
        const { empty } = boardSetting.colors;
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column <= columns - 4; column++) {
            let start = getIndex(row, column);
            if (board[start] === empty) continue;
            let counter = 1;
            for (let k = column + 1; k < column + 4; k++) {
              if (board[getIndex(row, k)] === board[start]) {
                counter++;
                if (counter === 4)
                  return createWinState(start, winTypes.horizontal);
              }
            }
          }
        }
      }

      function isVerticalWin() {
        const { rows } = boardSetting;
        const { columns } = boardSetting;
        const { empty } = boardSetting.colors;
        for (let column = 0; column < columns; column++) {
          for (let row = 0; row <= rows - 4; row++) {
            let start = getIndex(row, column);
            if (board[start] === empty) continue;
            let counter = 1;
            for (let k = row + 1; k < row + 4; k++) {
              if (board[getIndex(k, column)] === board[start]) {
                counter++;
                if (counter === 4)
                  return createWinState(start, winTypes.vertical);
              }
            }
          }
        }
      }


      function isBackwardsDiagonalWin() {
        const { rows } = boardSetting;
        const { columns } = boardSetting;
        const { empty } = boardSetting.colors;
        for (let row = 0; row <= rows - 4; row++) {
          for (let column = 0; column <= columns - 4; column++) {
            let start = getIndex(row, column);
            if (board[start] === empty) continue;
            let counter = 1;
            for (let i = 1; i < 4; i++) {
              if (board[getIndex(row + i, column + i)] === board[start]) {
                counter++;
                if (counter === 4)
                  return createWinState(start, winTypes.backwardsDiagonal);
              }
            }
          }
        }
      }
      function isForwardsDiagonalWin() {
        const { rows } = boardSetting;
        const { columns } = boardSetting;
        const { empty } = boardSetting.colors;
        for (let row = 0; row <= rows - 4; row++) {
          for (let column = 3; column <= columns; column++) {
            let start = getIndex(row, column);
            if (board[start] === empty) continue;
            let counter = 1;
            for (let i = 1; i < 4; i++) {
              if (board[getIndex(row + i, column - i)] === board[start]) {
                counter++;
                if (counter === 4)
                  return createWinState(start, winTypes.forwardsDiagonal);
              }
            }
          }
        }
      }
      setWin(isWin());
    }, [board, dropping, win]);

    function createDropButtons() {
      const btns = [];
      for (let i = 0; i < boardSetting.columns; i++) {
        btns.push(
          <button
            key={i}
            className="cell drop-button"
            onClick={() => handleDrop(i)}
            style={{
              backgroundColor: currentPlayer
            }}
          />
        );
      }
      return btns;
    }

    const cells = board.map((c, i) => (
      <button
        key={"c" + i}
        className="cell board-block"
        style={{
          backgroundColor: c
        }}
      />
    ));

    function getGridTemplateColumns() {
      let gridTemplateColumns = "";
      for (let i = 0; i < boardSetting.columns; i++) {
        gridTemplateColumns += "auto ";
      }
      return gridTemplateColumns;
    }

    return (


<>
                    <h1>Welcome to the game, {props.username}!</h1>

                    <div
        className={`board ${
          currentPlayer === boardSetting.colors.p1 ? "p1-turn" : "p2-turn"
        } `}
        ref={domBoard}
        style={{
          gridTemplateColumns: getGridTemplateColumns()
        }}
      >
        {createDropButtons()}
        {cells}
      </div>
      {!win && (
        <div><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br><br></br>
        <h2 style={{ color: currentPlayer }}>
          {currentPlayer === boardSetting.colors.p1 ? `${props.username}'s move` : "Player 2's move"}
        </h2></div>
      )}
      {win && (
        <>
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
          <h1 style={{ color: win.winner }}>
            {" "}
            {win.winner === boardSetting.colors.p1
              ? `${props.username}`
              : "Player 2"}{" "}
            WON!
          </h1>
          <button onClick={restartGame}>Play Again</button>
          <br />
          <br />
        </>
      )}
</>
 );
}

export default WelcomePage;
