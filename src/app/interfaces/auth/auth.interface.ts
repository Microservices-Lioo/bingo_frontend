import { UserModel } from '../../models';
export interface AuthInterface {
    user: UserModel;
    access_token: string;
    refresh_token: string;
}