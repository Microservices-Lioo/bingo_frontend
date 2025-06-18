import { AwardInterface } from "./award.interface";

export interface EventAwardsInterface {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: string;
    start_time: Date;
    price: number;
    award: AwardInterface[]
}