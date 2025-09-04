import { StatusEvent } from "../enums";

export interface IEvent {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: StatusEvent;
    price: number;
    start_time: Date;
    end_time: Date;
    host_is_active: boolean;
}

export interface IEventWithBuyer extends IEvent {
  buyer?: boolean;
}