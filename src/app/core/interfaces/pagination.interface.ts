export interface PaginationInterface<T> { 
    data: T[], 
    meta: {lastPage: number, page: number, total: number} 
}
