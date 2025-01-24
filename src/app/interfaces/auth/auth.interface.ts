import { UserInterface } from "./user.interface";

export interface AuthInterface {
    user: UserInterface;
    access_token: string;
    refresh_token: string;
}