import { Board, Piece } from "../../models";
import Rules from "../../rules/Rules";
import { fenToBoard, findKingKey, fixFen } from "../../rules";
import { PieceColor } from "../../Constants";
import axios from 'axios';
import { APIKEY } from "../../misc/APIKEY";

const initialFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//const testFen: string = "r1bk3r/pp1p1ppp/3Bp3/8/3nn3/3B4/PPP2PPP/RN2K1NR b KQ - 0 1"
const initFenBoard: Board = fenToBoard(initialFen);

const kingKey = findKingKey(initFenBoard.pieces, "e1", (initFenBoard.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK);
const otherKey = findKingKey(initFenBoard.pieces, "e8", !(initFenBoard.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK);
const king: Piece = initFenBoard.pieces.get(kingKey)!
const encoded_fen = fixFen(initialFen);
axios.get(
    `https://chess-api.roastlemon.com/engine/${encoded_fen}`,
    {
        headers: {'Authorization': `Bearer ${APIKEY}`},
    }
).
    then(res => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    });

axios.get(
    `http://127.0.0.1:8000/engine/${encoded_fen}`,
    {
        headers: {'Authorization': `Bearer ${APIKEY}`}
    }
).
    then(res => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    });
export const [initialBoard, initialBoardMap] = new Rules().populateValidMoves(initFenBoard, king, otherKey);