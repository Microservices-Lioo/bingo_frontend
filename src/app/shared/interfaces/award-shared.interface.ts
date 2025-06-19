export interface AwardSharedInterface {
    id: number;
    name: string;
    description: string;
    num_award: number | null;
    eventId: number;
    winner_user: number | null;
    gameId: number | null;
}

// export interface AwardSharedPagination { data: AwardSharedInterface[], meta: {lastPage: number, page: number, total: number} }