

export interface EventInterface {
    id: number;
    name: string;
    description: string;
    user: { id: number, username: string };
    status: string;
    start_time: Date;
    price: number;
}