import { IUser } from "../../../core/interfaces";

export interface EventModel {
    id: string;
    name: string;
    description: string;
    user: IUser;
    status: string;
    time: Date;
    start_time: Date;
    end_time: Date;
    val_cart: number;
}