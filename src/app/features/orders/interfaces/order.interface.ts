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

export interface IOrderItem {
    id: string;
    orderId: string;
    cardId: string;
    priceUnit: number;
    quantity: number;
}

export interface IOrderWItems extends IOrder {
    orderItems: {
        cardId: string;
        priceUnit: number;
        quantity: number;
    }[];
}

export interface IOrderPagination { data: IOrder[], meta: { lastPage: number, page: number, total: number}}