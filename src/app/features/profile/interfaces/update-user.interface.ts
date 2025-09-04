export interface UpdateIUser {
    name: string,
    lastname: string,
    new_email: string | null,
    password: string,
    new_password: string | null,
    repit_new_password: string | null
}