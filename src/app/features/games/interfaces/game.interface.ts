export interface IGame {
    id: string;
    roomId: string;
    modeId: string;
    numberHistoryId: string;
    start_tim: Date;
    end_time?: Date | null;
}