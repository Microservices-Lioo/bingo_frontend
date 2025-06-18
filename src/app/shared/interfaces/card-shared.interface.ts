export interface CellInterfaceShared { market: boolean, num: number };

export type CardTypeShared = CellInterfaceShared[][];

export interface CardPagination { data: CardTypeShared[], meta: {lastPage: number, page: number, total: number} }