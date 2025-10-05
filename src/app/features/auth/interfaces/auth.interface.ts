import { IUserShared } from "../../../shared/interfaces";

export interface AuthInterface {
    user: IUserShared;
    access_token: string;
    refresh_token: string;
}