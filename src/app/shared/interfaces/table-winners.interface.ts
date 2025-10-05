import { EStatusTableBingoShared } from "../enums";

export interface ITableWinners {
    socketId: string;
    userId: string;
    cardId: string;
    fullnames: string;
    status: EStatusTableBingoShared
}