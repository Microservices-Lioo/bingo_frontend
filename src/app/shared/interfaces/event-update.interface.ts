import { EStatusEventShared } from "../enums";

export interface IEventUpdateShared {
    name?: string;
    description?: string;
    status?: EStatusEventShared;
    time?: Date;
    start_time?: Date;
    end_time?: Date;
    price?: number;
}