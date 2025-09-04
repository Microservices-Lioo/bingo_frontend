export interface GameOnModeSharedI {
    gameId: string;
    gameModeid: string;
    assignedAt: Date;
    assinedBy: string;
    is_active: boolean;
    start_time: Date;
    end_time?: Date | null;
}