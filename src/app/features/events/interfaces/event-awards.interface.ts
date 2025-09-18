import { IEvent } from './event.interface';
import { IAward } from "../../award/interfaces";

export interface IEventAwards extends IEvent {
    award: IAward[];
    room: string;
    member: string;
}

export interface EventAwardPagination { data: IEventAwards[], meta: {lastPage: number, page: number, total: number} }