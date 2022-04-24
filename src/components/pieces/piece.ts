import {Color} from '../board/board.types';

export interface Piece {
    color: Color;
    coord: string;

    str(): string;
    validMoves(controlledTiles: Array<string>, enPassant?: string): Array<string>;
}
