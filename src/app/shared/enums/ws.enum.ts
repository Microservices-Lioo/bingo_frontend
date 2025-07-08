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
    // EMIT
    JOIN_GAME = 'joinGame',
    WAITING_GAME = 'waitingGame'
}