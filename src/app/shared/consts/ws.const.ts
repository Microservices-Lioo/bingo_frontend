import { WsEnum } from "../enums/ws.enum";

export const WsConst = {
    keyRoom: (id: string) => `${WsEnum.ROOM_IDENTITY}:${id}`,
    keyRoomWaiting: (id: string) => `${WsEnum.ROOM_IDENTITY}:${id}:waiting`,
    keyRoomCountUsers: (keyRoom: string) => `${keyRoom}:countUsers`,
    keyRoomCalledBall: (keyRoom: string) => `${keyRoom}:calledBall`,
}