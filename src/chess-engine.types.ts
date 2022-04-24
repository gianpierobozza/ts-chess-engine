import {PromotionChoice} from './components/board/board.types';

export enum GameState {
    WhiteWins = '1-0',
    BlackWins = '0-1',
    Draw = '1/2-1/2',
    InProgress = '-'
}

export interface GameMove {
    from: string;
    to: string;
    promotionChoice?: PromotionChoice;
    redoMove?: boolean;
    pseudoMove?: boolean;
}