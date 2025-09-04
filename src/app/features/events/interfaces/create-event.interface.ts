import { ICreateAward } from "../../award/interfaces";

export interface ICreateEvent {
    name: string;
    description: string;
    price: number;
    start_time: Date;
}

export interface ICreateEventAwards {
    event: ICreateEvent;
    awards: ICreateAward[];
}