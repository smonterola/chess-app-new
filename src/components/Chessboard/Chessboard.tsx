import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Rules from "../../rules/Rules";
import { Piece, Position, BoardMap, Board } from "../../models";
import { xAxis, yAxis, TILESIZE, PieceColor, GameState, PieceType } from "../../Constants";
import { boardToFen, findKingKey } from "../../rules";
import { initialBoard, initialBoardMap } from "./initChessboard";
import { updateBoard } from "./updateChessboard";
import { botPlay } from "../../engine/bestMove";
import { Link } from 'react-router-dom';

const pgn = new Map<number, string>();
export const history = new Map<string, number>();
let positionHighlight: Position = new Position(-1, -1);
export let GAMEOVER = false;

export default function Chessboard() {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [getPosition, setPosition] = useState<Position>(new Position(-1, -1));
    const [board, setBoard] = useState<Board>(initialBoard);
    const [boardMap, setBoards] = useState<BoardMap>(initialBoardMap);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [promotionPieceType, setPromotionPieceType] = useState<PieceType>(PieceType.QUEN);
    const [promotionPieceName, setPromotionPieceName] = useState<string>("Queen");
    const rules = new Rules();    

    function ResetGame() {
        const handleClick = () => {
            setPromotionPieceName("Queen");
            setPromotionPieceType(PieceType.QUEN);
            setBoard(initialBoard);
            setBoards(initialBoardMap);
        };
        return (
            <button className="action-button" onClick={handleClick}>
                Reset Board
            </button>
        );
    }

    function BotPlay() {
        const handleClick = () => {
            const [move, newBoard, newBoardMap] = botPlay(board, boardMap);
            setBoard(newBoard);
            setBoards(newBoardMap);
        };
        return (
            <button className="action-button" onClick={handleClick}>
                Bot Play
            </button>    
        );
    }

    function TogglePiece() {
        const handleClick = () => {
            const nextPiece = new Map<string, [string, PieceType]>();
            nextPiece.set('Queen', ['Rook', PieceType.ROOK]);
            nextPiece.set('Rook', ['Bishop', PieceType.BSHP]);
            nextPiece.set('Bishop', ['Knight', PieceType.NGHT]);
            nextPiece.set('Knight', ['Queen', PieceType.QUEN]);
            setPromotionPieceType(nextPiece.get(promotionPieceName)![1]);
            setPromotionPieceName(nextPiece.get(promotionPieceName)![0]);
        };
        return (
            <button className="action-button" onClick={handleClick}>
                {promotionPieceName}
            </button>
        );
    }

    function OpenLink() {
        const handleClick = () => {
            window.open("https://chessmasa.github.io/", "_blank");
        };
        return (
            <button className="action-button" onClick={handleClick}>
                Docs
            </button>
        );
    }

    function grabPiece(e: React.MouseEvent) {
        if (GAMEOVER) return;
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLElement;
        if (!chessboard || !element.classList.contains("chess-piece")) {
            if (boardMap.size === 2 || board.attributes[6] >= 50) {
                GAMEOVER = true;
                return;
            }
            return;
        }
        const getX = (Math.floor((e.clientX - chessboard.offsetLeft) / TILESIZE));
        const getY = (Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - TILESIZE * 8) / TILESIZE)));
        setPosition(new Position(getX, getY));
        const [x, y] = [e.clientX - TILESIZE / 2, e.clientY - TILESIZE / 2];
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        setActivePiece(element);
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (!chessboard || !activePiece || GAMEOVER) {
            return;
        }
        const [minX, minY, maxX, maxY] = [
            chessboard.offsetLeft - TILESIZE / 4,
            chessboard.offsetTop - TILESIZE / 4,
            chessboard.offsetLeft - TILESIZE / 4 * 3 + chessboard.clientWidth,
            chessboard.offsetTop - TILESIZE / 4 * 3 + chessboard.clientHeight
        ];
        const [x, y] = [e.clientX - TILESIZE / 2, e.clientY - TILESIZE / 2];
        activePiece.style.position = "absolute";

        let piXel: string = `${x}px`;
        if (x < minX) { piXel = `${minX}px`; }
        else if (x > maxX) { piXel = `${maxX}px`; }
        activePiece.style.left = piXel;

        let piYel: string = `${y}px`;
        if (y < minY) { piYel = `${minY}px`; }
        else if (y > maxY) { piYel = `${maxY}px`; }
        activePiece.style.top = piYel;
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (!chessboard || !activePiece || GAMEOVER) {
            return;
        }
        setActivePiece(null);
        const x = Math.floor((e.clientX - chessboard.offsetLeft) / TILESIZE);
        const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - TILESIZE * 8) / TILESIZE));
        const cursorP: Position = new Position(x, y);
        if (!cursorP.checkBounds) {
            return;
        }
        if (cursorP.samePosition(getPosition)) {
            activePiece.style.position = "relative";
            activePiece.style.removeProperty("top");
            activePiece.style.removeProperty("left");
            positionHighlight = getPosition.copyPosition;
            return;
        }
        let pieceMap = board.pieces;
        let [whiteKingKey, blackKingKey] = [
            findKingKey(pieceMap, "e1", PieceColor.WHITE),
            findKingKey(pieceMap, "e8", PieceColor.BLACK)
        ];
        const [move, _board] = updateBoard(board, getPosition, cursorP, whiteKingKey, blackKingKey, promotionPieceType);
        const validMove = rules.canMove(boardMap, move);

        if (!validMove) {
            activePiece.style.position = "relative";
            activePiece.style.removeProperty("top");
            activePiece.style.removeProperty("left");
            positionHighlight = getPosition.copyPosition;
            return;
        }
        positionHighlight = getPosition.copyPosition;
        const nextBoard: Board = boardMap.get(move)!;
        pieceMap = (nextBoard.pieces);
        setBoard(nextBoard);
        const moveCount = nextBoard.attributes[7] - 1;
        const append: string = (pgn.has(moveCount)) ? pgn.get(moveCount)! : `${moveCount}.`;
        pgn.set(moveCount, append + " " + move);
        const turn = (board.attributes[0]) ? PieceColor.BLACK : PieceColor.WHITE;

        [whiteKingKey, blackKingKey] = [
            findKingKey(pieceMap, whiteKingKey, PieceColor.WHITE),
            findKingKey(pieceMap, blackKingKey, PieceColor.BLACK)
        ];
        const [kingKey, otherKey] = turn === PieceColor.WHITE ? [whiteKingKey, blackKingKey] : [blackKingKey, whiteKingKey];
        const king: Piece = pieceMap.get(kingKey)!;
        const [newPieceMap, newBoards] = rules.populateValidMoves((nextBoard), king, otherKey, promotionPieceType);
        const status: GameState = rules.getStatus(newBoards, newPieceMap.pieces, king);
        const pieceFen = boardToFen(nextBoard).split(" ")[0];
        history.set(pieceFen, history.has(pieceFen) ? history.get(pieceFen)! + 1 : 1);
        if (
            status === GameState.CHECKMATE ||
            status === GameState.STALEMATE ||
            history.get(pieceFen) === 3 ||
            nextBoard.attributes[6] >= 50
        ) {
            GAMEOVER = true;
            return;
        }
        setBoards(newBoards);
    }

    const pieceMap = board.pieces;
    const turn = (board.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK;
    const boardUI = [];
    const highlightMap = (
        !GAMEOVER &&
        positionHighlight.samePosition(getPosition) &&
        pieceMap.has(getPosition.string) &&
        pieceMap.get(getPosition.string)?.color === turn
    ) ?
        pieceMap.get(getPosition.string)?.moveMap! : new Map();
    for (let j = yAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < xAxis.length; i++) {
            const number = i + j;
            const piece = pieceMap.get(new Position(i, j).string);
            let image = piece ? piece.image : undefined;
            const highlight = highlightMap.has(new Position(i, j).string) ? true : false;
            boardUI.push(<Tile key={`${i}${j}`} image={image} number={number} highlight={highlight}/>);
        }
    }
    return (
        <div className="chessboard-container">
            <div className="status-bar">
                <h1>Status: {GAMEOVER ? 'Game Over' : 'Playing'}</h1>
                <h1>Move Number: {board.attributes[7]}</h1>
                <h1>Player Turn: {turn === PieceColor.WHITE ? "White" : "Black"}</h1>
            </div>
            <div className="action-buttons">
                <ResetGame />
                <BotPlay />
                <TogglePiece />
                <OpenLink />
            </div>
            <div 
                id="chessboard"
                ref={chessboardRef}
                onMouseMove={(e) => movePiece(e)}
                onMouseDown={(e) => grabPiece(e)} 
                onMouseUp={(e) => dropPiece(e)}
            >   
                {boardUI}
            </div>
        </div>
    );
}

