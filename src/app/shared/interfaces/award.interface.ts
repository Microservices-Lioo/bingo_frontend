export interface IAwardShared {
    id: string;
    name: string;
    description: string;
    gameId: string | null;
    eventId: string;
    winner: string | null;
}

// export interface AwardSharedPagination { data: IAwardShared[], meta: {lastPage: number, page: number, total: number} }