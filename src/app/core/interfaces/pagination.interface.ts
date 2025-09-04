export interface IPagination<T> { 
    data: T[], 
    meta: {lastPage: number, page: number, total: number} 
}
