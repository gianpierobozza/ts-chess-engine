import {Board} from '../board/board';
import {Color, EmptyTile} from '../board/board.types';
import {Piece} from './piece';

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
        let blockedWay = false;
        while ((x < 8 && y < 8) && !blockedWay) {
            blockedWay = this.pushIfValidLandingTile(Board.stringCoord(x + 1, y + 1), validMovesCoords);
            x += 1;
            y += 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        blockedWay = false;
        while ((x < 8 && y > 1) && !blockedWay) {
            blockedWay = this.pushIfValidLandingTile(Board.stringCoord(x + 1, y - 1), validMovesCoords);
            x += 1;
            y -= 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        blockedWay = false;
        while ((x > 1 && y > 1) && !blockedWay) {
            blockedWay = this.pushIfValidLandingTile(Board.stringCoord(x - 1, y - 1), validMovesCoords);
            x -= 1;
            y -= 1;
        }

        [x, y] = Board.planeCoords(this.coord);
        blockedWay = false;
        while ((x > 1 && y < 8) && !blockedWay) {
            blockedWay = this.pushIfValidLandingTile(Board.stringCoord(x - 1, y + 1), validMovesCoords);
            x -= 1;
            y += 1;
        }

        return validMovesCoords;
    }

    private pushIfValidLandingTile(coord: string, validMovesCoords: Array<string>): boolean {
        let blockedWay = false;
        if (Board.getTile(coord) instanceof EmptyTile) {
            validMovesCoords.push(coord);
        } else if ((Board.getTile(coord) as Piece).color !== this.color) {
            blockedWay = true;
            validMovesCoords.push(coord);
        } else if ((Board.getTile(coord) as Piece).color === this.color) {
            blockedWay = true;
        }
        return blockedWay;
    }
}
