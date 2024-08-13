import { Board, Piece } from "../../models";
import Rules from "../../rules/Rules";
import { boardToFen, fenToBoard } from "../../rules";

const initialFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

const initFenBoard: Board = fenToBoard(initialFen);
const wKing: Piece = initFenBoard.pieces.get("e1")!

export const [initialBoard, initialBoardMap] = new Rules().populateValidMoves(initFenBoard, wKing, "e8");