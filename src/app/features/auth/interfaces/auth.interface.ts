import { UserInterface } from "../../../core/interfaces";

export interface AuthInterface {
    user: UserInterface;
    access_token: string;
    refresh_token: string;
}