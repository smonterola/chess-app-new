import React from "react";
import { initialBoard } from "../Chessboard/initChessboard";

function ResetGame() {
    const handleClick = () => {
        return initialBoard
    };

    return (
        <button onClick={handleClick}>
            ResetBoard
        </button>
    );
}

export default ResetGame;