import { EStatusEventShared } from "../enums";

export interface IEventShared {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: EStatusEventShared;
    price: number;
    start_time: Date;
    end_time: Date;
    host_is_active: boolean;
}

export interface IEventWithBuyer extends IEventShared {
  buyer?: boolean;
}