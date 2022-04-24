import {Board} from '../board/board';
import {Color, EmptyTile} from '../board/board.types';
import {Piece} from './piece';

export class Knight implements Piece {
    public color: Color;
    public coord: string;

    constructor(color: Color, coord: string) {
        this.color = color;
        this.coord = coord;
    }

    public str(): string {
        return this.color === Color.White ? 'N' : 'n';
    }

    public validMoves(): Array<string> {
        const validMovesCoords: Array<string> = [];

        const [x, y] = Board.planeCoords(this.coord);
        if (x + 1 <= 8 && y + 2 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y + 2), validMovesCoords);
        }
        if (x + 2 <= 8 && y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 2, y + 1), validMovesCoords);
        }
        if (x - 1 >= 1 && y + 2 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y + 2), validMovesCoords);
        }
        if (x - 2 >= 1 && y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 2, y + 1), validMovesCoords);
        }
        if (x - 1 >= 1 && y - 2 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y - 2), validMovesCoords);
        }
        if (x - 2 >= 1 && y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 2, y - 1), validMovesCoords);
        }
        if (x + 1 <= 8 && y - 2 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y - 2), validMovesCoords);
        }
        if (x + 2 <= 8 && y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 2, y - 1), validMovesCoords);
        }

        return validMovesCoords;
    }

    private pushIfValidLandingTile(coord: string, validMovesCoords: Array<string>): void {
        if (Board.getTile(coord) instanceof EmptyTile || (Board.getTile(coord) as Piece).color !== this.color) {
            validMovesCoords.push(coord);
        }
    }
}
