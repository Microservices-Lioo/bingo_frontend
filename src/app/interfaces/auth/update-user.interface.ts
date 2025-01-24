export interface UpdateUserInterface {
    name: string,
    lastname: string,
    email: string,
    new_email: string | null,
    password: string,
    new_password: string | null,
    repit_new_password: string | null
}