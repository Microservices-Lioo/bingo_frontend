import { UserModel } from "./user.model";

export interface EventModel {
    id: number;
    name: string;
    description: string;
    user: UserModel;
    status: string;
    start_time: Date;
    val_cart: number;
}