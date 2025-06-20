import { UserInterface } from "../../../core/interfaces";

export interface EventModel {
    id: number;
    name: string;
    description: string;
    user: UserInterface;
    status: string;
    time: Date;
    start_time: Date;
    end_time: Date;
    val_cart: number;
}