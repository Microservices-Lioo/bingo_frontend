import { IUser } from "../../../core/interfaces";

export interface AuthInterface {
    user: IUser;
    access_token: string;
    refresh_token: string;
}