import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Rules from "../../rules/Rules";
import { Piece, Position, BoardMap, Board } from "../../models";
import { xAxis, yAxis, TILESIZE, PieceColor, GameState, nextTurn} from "../../Constants";
import { findKingKey, boardToFen, findPins } from "../../rules";
import { initialBoard, initialBoardMap } from "./initChessboard";
import { evaluate, miniMaxAlphaBeta, sortMoves, sumMoves } from "../../engine";
import { updateBoard } from "./updateChessboard";

let moveCounter = 1;
const pgn = new Map<number, string>();
let turn: PieceColor = PieceColor.WHITE;
let positionHighlight: Position = new Position(-1, -1);

export default function Chessboard() {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [getPosition, setPosition] = useState<Position>(new Position(-1, -1));
    const [board, setBoard] = useState<Board>(initialBoard);
    //const [pieceMap, setPieceMap] = useState<PieceMap>(board.pieces);
    const [boardMap, setBoards] = useState<BoardMap>(initialBoardMap);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const rules = new Rules();    

    function grabPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLElement;
        if (!chessboard || !element.classList.contains("chess-piece")) {
            console.log("finding moves that are good for", turn);
            
            setTimeout(
                function(){
                    const start = performance.now();
                    //const moves = sumMoves(board, 5, (turn), [], "e1", "e1");
                    const bestMoveScore = miniMaxAlphaBeta(board, 6, 2, -9999, 9999, (turn), [], "e1", "e1");
                    const end = performance.now();
                    //console.log(moves)
                    console.log(bestMoveScore);
                    console.log(bestMoveScore[0][0])
                    console.log("time taken:", Math.round((end - start)/10)/100, "seconds");
                    //console.log(depthTwo);
                }, 0
            );
            return;
        }
        const getX = (Math.floor((e.clientX - chessboard.offsetLeft) / TILESIZE));
        const getY = (Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - TILESIZE*8) / TILESIZE)));
        setPosition(new Position(getX, getY));
        const [x, y] = [e.clientX - TILESIZE/2 , e.clientY - TILESIZE/2];
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        setActivePiece(element);
    }
    
    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (!chessboard || !activePiece) {
            return;
        }
        const [minX, minY, maxX, maxY] = [
            chessboard.offsetLeft - TILESIZE/4, 
            chessboard.offsetTop  - TILESIZE/4, 
            chessboard.offsetLeft - TILESIZE/4*3 + chessboard.clientWidth,
            chessboard.offsetTop  - TILESIZE/4*3 + chessboard.clientHeight
        ];
        const [x, y] = [e.clientX - TILESIZE/2 , e.clientY - TILESIZE/2]
        activePiece.style.position = "absolute";
        //controls the boundaries
        let piXel: string = `${x}px`;
        if (x < minX)        { piXel = `${minX}px`;
        } else if (x > maxX) { piXel = `${maxX}px`;
        }
        activePiece.style.left = piXel;

        let piYel: string = `${y}px`;
        if (y < minY)        { piYel = `${minY}px`;
        } else if (y > maxY) { piYel = `${maxY}px`;
        }
        activePiece.style.top = piYel;
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (!chessboard || !activePiece) {
            return;
        }
        setActivePiece(null); 
        const x = Math.floor((e.clientX - chessboard.offsetLeft) / TILESIZE);
        const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - TILESIZE*8) / TILESIZE));
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
        const [move, _board] = updateBoard(board, getPosition, cursorP, whiteKingKey, blackKingKey);
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
        setBoard(nextBoard)
        const moveCount = nextBoard.attributes[7] - 1;
        const append: string = (pgn.has(moveCount)) ? pgn.get(moveCount)!: `${moveCount}.`;
        pgn.set(moveCount, append + " " + move);
        console.log(pgn);
        turn = nextTurn(turn);
        
        [whiteKingKey, blackKingKey] = [
            findKingKey(pieceMap, whiteKingKey, PieceColor.WHITE), 
            findKingKey(pieceMap, blackKingKey, PieceColor.BLACK)
        ];
        const [kingKey, otherKey] = turn === PieceColor.WHITE ? [whiteKingKey, blackKingKey] : [blackKingKey, whiteKingKey];
        const king: Piece = pieceMap.get(kingKey)!;
        const [newPieceMap, newBoards] = rules.populateValidMoves((nextBoard), king, otherKey);
        const status: GameState = rules.getStatus(newBoards, newPieceMap.pieces, king);
        if (status === GameState.CHECKMATE || status === GameState.STALEMATE) {
            return;
        }
        //console.log(newBoards)
        //console.log(board)
        //console.log(boardToFen(board))
        setBoards(newBoards);
    }
    const pieceMap = board.pieces;
    const boardUI = [];
    const highlightMap = (
        positionHighlight.samePosition(getPosition) && 
        pieceMap.has(getPosition.string) &&
        pieceMap.get(getPosition.string)?.color === turn
    ) ?
        pieceMap.get(getPosition.string)?.moveMap! : new Map();
    for (let j = yAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < xAxis.length; i++) {
            const number = i+j;
            const piece = pieceMap.get(new Position(i, j).string);
            let image = piece ? piece.image : undefined;
            const highlight = highlightMap.has(new Position(i, j).string) ? true : false;
            boardUI.push(<Tile key={`${i}${j}`} image={image} number={number} highlight={highlight}/>)
        }
    }
    return (
        <div 
            onMouseMove={(e) => movePiece(e)}
            onMouseDown={(e) => grabPiece(e)} 
            onMouseUp  ={(e) => dropPiece(e)}  
            id="chessboard"
            ref={chessboardRef}
        >   
            {boardUI}
        </div>
    );
}