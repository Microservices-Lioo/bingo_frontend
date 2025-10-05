import { IAwardShared } from "./award.interface";

export interface IEventAwardsShared {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: string;
    time: Date;
    start_time: Date;
    end_time: Date;
    price: number;
    award: IAwardShared[]
}