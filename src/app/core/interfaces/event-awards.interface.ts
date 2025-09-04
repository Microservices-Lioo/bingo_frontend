import { IAward } from "./award.interface";

export interface IEventAwards {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: string;
    time: Date;
    start_time: Date;
    end_time: Date;
    price: number;
    award: IAward[]
}