export interface IAward {
    id: string;
    name: string;
    description: string;
    gameId?: string;
    eventId?: string;
    winner?: string;
}