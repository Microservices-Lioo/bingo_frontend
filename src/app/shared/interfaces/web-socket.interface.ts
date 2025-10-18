import { EAwardsStatus, ERouletteStatus, HostActivity, StatusGame, StatusHostRoom } from "../../features/games/enums";
import { AwardGameInterface, IGame, IRoom } from "../../features/games/interfaces";
import { IRouletterWinner } from "./roulette.interface";
import { ITableWinners } from "./table-winners.interface";

export interface IStatusCount {
  endTime: number;
  duration: number;
}

export interface IBingoSongs {

}

export interface ISocket {
    numUsers?: number,
}

export interface IStatusRoom {
    room?: IRoom,
    hostActivity?: HostActivity,
    status?: StatusHostRoom
}

export interface IStatusGame {
    game?: IGame,
    award?: AwardGameInterface,
    cell?: string,
    myBingo?: string,
    counter?: IStatusCount,
    tableWinner?: {
        table: ITableWinners[], 
        sing?: ITableWinners
    },
    winnerModal?: boolean,
    statusAward?: EAwardsStatus,
    rouletteStatus?: ERouletteStatus,
    rouletteWinner?: IRouletterWinner,
    statusGame: StatusGame
}