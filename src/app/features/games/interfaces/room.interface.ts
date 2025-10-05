import { StatusHostRoom, StatusRoom } from "../enums";

export interface IRoom {
    id: string;
    eventId: string;
    status: StatusRoom;
    status_host: StatusHostRoom;
    start_time: Date;
    end_time?: Date;
}