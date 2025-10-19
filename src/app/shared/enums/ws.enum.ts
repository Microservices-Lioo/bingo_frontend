export enum EWebSocket {
    // emit    
    COUNT = 'count', // count users for room
    CREATE_GAME = 'create-game',
    
    CELL_CARD = 'cell-card',
    BINGO = 'bingo',
    UPDATE_BINGO = 'update-bingo',
    UPDATE_STATUS_WINNER_MODAL = 'update-status-winner-modal',
    STATUS_GAME = 'status-game',
    HOST_ACTIVITY = 'host-activity',
    AWARD_STATUS = 'award-status',
    ROULETTE_STATUS = 'roulette-status',
    ROULETTE_WINNER = 'roulette-winner',
    CLEAN_TABLE_SONGS = 'clean-table-songs',
    END_GAME = 'end-game',

    // listening
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    ERROR = 'error',
    CONNECT_ERROR = 'connect_error',
    RECONNECT_ATTEMPT = 'reconnect_attempt',
    RECONNECT = 'reconnect',
    UNAUTHORIZED = 'unauthorized'
}