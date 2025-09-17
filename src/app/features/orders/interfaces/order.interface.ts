import { EStatusOrder } from "../enums";

export interface IOrder {
    id: string;
    totalAmount: number;
    totalItems: number;
    status: EStatusOrder;
    paid: boolean;
    paidAt: Date;
    stripeChargeId: string;
}

export interface IOrderPagination { data: IOrder[], meta: { lastPage: number, page: number, total: number}}