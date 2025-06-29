export interface GameOnModeSharedI {
    gameId: number;
    gameModeId: number;
    assignedAt: Date;
    assinedBy: string;
    is_active: boolean;
    start_time: Date;
    end_time?: Date | null;
}