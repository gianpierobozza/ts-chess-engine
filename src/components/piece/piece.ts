import {Color} from '../board/board.types';

export interface Piece {
    color: Color;
    coord: string;

    str(): string;
    validMoves(): Array<string>;
}
