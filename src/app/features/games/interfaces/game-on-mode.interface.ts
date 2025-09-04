export interface GameOnModeI {
    gameId: string;
    gameModeid: string;
    assignedAt: Date;
    assignedBy: string;
    is_active: boolean;
    start_time: Date;
    end_time?: Date;
}