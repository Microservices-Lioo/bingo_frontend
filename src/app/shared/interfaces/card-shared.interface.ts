export interface ICardNumsShared {
    marked: boolean;
    number: number;
}
export interface ICardShared {
    id: string;
    eventId: string;
    buyer: string;
    available: boolean;
    nums: ICardNumsShared[][]
}