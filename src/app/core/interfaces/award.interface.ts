export interface IAward {
    id: string;
    name: string;
    description: string;
    gameId: string | null;
    eventId: string;
    winner: string | null;
}