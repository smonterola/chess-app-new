import { PieceCount, PieceMap } from "../models";
import { PieceColor, PieceType } from "../Constants";
import { 
    endgame, middleGame, threshold, 
    pairsMiddle, pairsEnd, pairsThres ,
    middleActivity, thresholdActivity, endgameActivity,
} from "./evalConstants";

export function evaluate(pieceMap: PieceMap): number {
    let evalutation: number = 0;
    const logPieceMap: PieceCount = logPieces(pieceMap);
    let [pieceValues, pairValues, activityValues] = [threshold, pairsThres, thresholdActivity];
    if (logPieceMap.get(PieceColor.WHITE + PieceType.QUEN) === 
        logPieceMap.get(PieceColor.BLACK + PieceType.QUEN)
    ) {
        [pieceValues, pairValues] = logPieceMap.has(PieceColor.WHITE + PieceType.QUEN) ? 
            [middleGame, pairsMiddle, middleActivity] : [endgame, pairsEnd, endgameActivity];
    }
    for (const pieceColor of Object.values(PieceColor)) {
        let pieceScore = 0;
        const POV = pieceColor === PieceColor.WHITE ? 1 : -1;
        for (const pieceType of Object.values(PieceType)) {
            const key = pieceColor + pieceType;
            const pieceCount = logPieceMap.has(key) ? 
                logPieceMap.get(key)! : 
                0; 
            const pieceValue = pieceValues.has(pieceType) ? 
                pieceValues.get(pieceType)! * pieceCount : 
                0;
            const pairValue = (pairValues.has(pieceType) && pieceCount > 0) ? 
                pairValues.get(pieceType)! * (pieceCount-1) : 
                0;
            pieceScore += pieceValue + pairValue;
        }
        evalutation += pieceScore * POV;
    }
    /*
    let activity = 0;
    for (let piece of pieceMap.values()) { //rudimentary way to score "piece activity"
        let moves = (piece.moveMap ? piece.moveMap.size : 0) * piece.POV * 0.01 * activityValues.get(piece.type)!;
        activity += moves
    }
    evalutation += activity;
    */
    return Math.round(evalutation * 100) / 100;
}

export function logPieces(pieceMap: PieceMap): Map<string, number> {
    const logPieces: PieceCount = new Map();
    for (let piece of pieceMap.values()) {
        const key = piece.color + piece.type;
        const count = logPieces.has(key) ?
            logPieces.get(key) :
            0; 
        logPieces.set(key, count! + 1);
    }
    return logPieces;
}