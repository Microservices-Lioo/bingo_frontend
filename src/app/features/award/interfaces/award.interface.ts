export interface AwardInterface {
    id: number;
    name: string;
    description: string;
    num_award: number | undefined;
    eventId: number;
    winner_user: number;
    gameId: number;
}