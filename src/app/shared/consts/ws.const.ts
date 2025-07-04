import { WsEnum } from "../enums/ws.enum";

export const WsConst = {
    keyRoom: (id: number) => `${WsEnum.ROOM_IDENTITY}:${id}`,
    keyRoomWaiting: (id: number) => `${WsEnum.ROOM_IDENTITY}:${id}:waiting`,
    keyRoomCountUsers: (keyRoom: string) => `${keyRoom}:countUsers`,
    keyRoomCalledBall: (keyRoom: string) => `${keyRoom}:calledBall`,
}