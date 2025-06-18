export interface AwardSharedInterface {
    id: number;
    name: string;
    description: string;
    num_award: number | undefined;
    eventId: number;
    winner_user: number;
    gameId: number;
}

// export interface AwardSharedPagination { data: AwardSharedInterface[], meta: {lastPage: number, page: number, total: number} }