import { AwardInterface } from "../../award/interfaces";

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

export interface EventAwardPagination { data: EventAwardsInterface[], meta: {lastPage: number, page: number, total: number} }