import {Color} from '../../board/board.types';
import {Piece} from '../piece';

export class King implements Piece {
    public color: Color;
    public coord: string;

    constructor(color: Color, coord: string) {
        this.color = color;
        this.coord = coord;
    }

    public str(): string {
        return this.color === Color.White ? 'K' : 'k';
    }

    public validMoves(): Array<string> {
        const validMovesCoords: Array<string> = [];
        
        return validMovesCoords;
    }
}
