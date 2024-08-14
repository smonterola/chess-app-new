import { Board, Piece } from "../../models";
import Rules from "../../rules/Rules";
import { fenToBoard, findKingKey } from "../../rules";
import { PieceColor } from "../../Constants";

const initialFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//const testFen: string = "r1bk3r/pp1p1ppp/3Bp3/8/3nn3/3B4/PPP2PPP/RN2K1NR b KQ - 0 1"
const initFenBoard: Board = fenToBoard(initialFen);

const kingKey = findKingKey(initFenBoard.pieces, "e1", (initFenBoard.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK);
const otherKey = findKingKey(initFenBoard.pieces, "e8", !(initFenBoard.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK);
const king: Piece = initFenBoard.pieces.get(kingKey)!

export const [initialBoard, initialBoardMap] = new Rules().populateValidMoves(initFenBoard, king, otherKey);