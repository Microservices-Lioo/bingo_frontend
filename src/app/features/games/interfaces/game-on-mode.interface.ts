export interface GameOnModeI {
    gameId: number;
    gameModeId: number;
    assignedAt: Date;
    assignedBy: string;
    is_active: boolean;
    start_time: Date;
    end_time?: Date;
}