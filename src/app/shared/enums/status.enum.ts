export enum EStatusEventShared {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

export enum EStatusTableBingoShared {
    APROBADO = 'aprobado',
    RECHAZADO = 'rechazado',
    PENDIENTE = 'pendiente',
}

export enum ESConnectionWs {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    FAILED = 'failed'
}