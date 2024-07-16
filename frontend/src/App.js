import React, { useState, useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:9999");

const App = () => {
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    currentPlayer: "X",
  });
  
  const [playerTurn, setPlayerTurn] = useState("Player A");
  const [draw, setDraw] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on("moveMade", (data) => {
      setGame(data.updatedGame);
      setPlayerTurn(data.updatedGame.currentPlayer === "X" ? "Player B" : "Player A");
      
    });

    socket.on("gameReset", (newGame) => {
      setGame(newGame);
      setPlayerTurn("Player A");
      
      setDraw(false);
      setWinner(null);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("moveMade");
      socket.off("gameReset");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    const calculateWinner = (squares) => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }

      if (!squares.includes(null)) {
        setDraw(true);
      }

      return null;
    };

    const winner = calculateWinner(game.board);
    setWinner(winner);
  }, [game.board]);

  const makeMove = (index) => {
    const squares = [...game.board];

    if (winner || squares[index]) {      
      return;
    }

    squares[index] = game.currentPlayer;

    const updatedGame = {
      ...game,
      board: squares,
      currentPlayer: game.currentPlayer === "X" ? "O" : "X",
    };

    socket.emit("makeMove", { index, updatedGame });
  };

  const resetGame = () => {
    const newGame = {
      board: Array(9).fill(null),
      currentPlayer: "X",
    };

    socket.emit("resetGame", newGame);
  };

  return (
    <div className="app-container">
      <h1>AP's XO Game</h1>
      <div>
        <div className="board">
          {game.board.map((cell, index) => (
            <div
              key={index}
              className={`cell ${winner && winner === cell ? "winner" : ""}`}
              onClick={() => makeMove(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        {winner ? (
          <p className="current-player">
            Player {winner} wins!
          </p>
        ) : draw ? (
          <p className="current-player">It's a draw!</p>
        ) : (
          <p className="current-player">
            Current Player: {playerTurn}
          </p>
        )}
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      </div>      
    </div>
  );
};

export default App;


