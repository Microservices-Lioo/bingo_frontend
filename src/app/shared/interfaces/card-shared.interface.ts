export interface CardNumsSharedI {
    marked: boolean;
    number: number;
}
export interface CardSharedI {
    id: number;
    num: number;
    buyer: number;
    eventId: number;
    available: boolean;
    nums: CardNumsSharedI[][]
}