import { StatusEvent } from "../enums";

export interface EventUpdateSharedInterface {
    name?: string;
    description?: string;
    status?: StatusEvent;
    time?: Date;
    start_time?: Date;
    end_time?: Date;
    price?: number;
}