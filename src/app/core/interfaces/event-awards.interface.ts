import { AwardInterface } from "./award.interface";

export interface EventAwardsInterface {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: string;
    time: Date;
    start_time: Date;
    end_time: Date;
    price: number;
    award: AwardInterface[]
}