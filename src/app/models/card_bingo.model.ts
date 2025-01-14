import { UserModel } from "./user.model";

export interface CardBingoModel {
    id: number;
    user: UserModel;
    event: string;
    nums: number[];
    codigo: string;
}