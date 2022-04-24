import {Board} from '../../board/board';
import {Color, EmptyTile} from '../../board/board.types';
import {Piece} from '../piece';

export class Bishop implements Piece {
    public color: Color;
    public coord: string;

    constructor(color: Color, coord: string) {
        this.color = color;
        this.coord = coord;
    }

    public str(): string {
        return this.color === Color.White ? 'B' : 'b';
    }

    public validMoves(): Array<string> {
        const validMovesCoords: Array<string> = [];
        let [x, y] = Board.planeCoords(this.coord);

        while (x < 8 && y < 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y + 1), validMovesCoords);
            x += 1;
            y += 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        while (x < 8 && y > 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y - 1), validMovesCoords);
            x += 1;
            y -= 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        while (x > 1 && y > 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y - 1), validMovesCoords);
            x -= 1;
            y -= 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        while (x > 1 && y < 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y + 1), validMovesCoords);
            x -= 1;
            y += 1;
        }

        return validMovesCoords;
    }

    private pushIfValidLandingTile(coord: string, validMovesCoords: Array<string>): void {
        if (Board.getTile(coord) instanceof EmptyTile || (Board.getTile(coord) as Piece).color !== this.color) {
            validMovesCoords.push(coord);
        }
    }
}
