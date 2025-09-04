export enum WsEnum {
    // rooms
    ROOM_IDENTITY = 'room',

    // listening
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    ERROR = 'error',
    CONNECT_ERROR = 'connect_error',
    RECONNECT_ATTEMPT = 'reconnect_attempt',
    RECONNECT = 'reconnect',
    UNAUTHORIZED = 'unauthorized',
    COUNTER_STARTED = 'counterStarted',
    COUNTER_UPDATE = 'counterUpdate',
    COUNTER_FINISHED = 'counterFinished',
    SONGS = 'songs',
    SING = 'sing',
    DELETED_SONGS = 'delete-songs',
    TIEBREAKER_EMIT = 'tie-breaker:emit',
    TIEBREAKER_LISTEN = 'tie-breaker:listen',
    REWARD_EMIT ='reward:emit',
    REWARD_LISTEN ='reward:listen',

    // EMIT
    JOIN_GAME = 'joinGame',
    WAITING_GAME = 'waitingGame',
    VERIFY_SING = 'verify-sing',
    DELETE_SONGS = 'delete-all-songs',
    TIEBREAKER_WINNER = 'tie-breaker-winner',
    WINNER = 'winner',
}