export interface GameSharedInterface {
    id: string;
    eventId: string;
    start_time: Date;
    end_time?: Date | null;
}