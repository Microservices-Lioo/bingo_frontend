import { EWebSocket } from "../enums/ws.enum";

export const WsConst = {
    countUser: (roomId: string) => `${roomId}:users`,
    statusRoom: (roomId: string) => `room:${roomId}:status`,
    statusHostRoom: (roomId: string) => `room:${roomId}:statushost`,
    statusGame: (roomId: string) => `room:${roomId}:statusGame`,
    game: (roomId: string) => `room:${roomId}:game`,
    getCellCard: (roomId: string) => `room:${roomId}:cell:card`,
    count: (roomId: string) => `room:${roomId}:count`,
    tableWinners: (roomId: string) => `room:${roomId}:tablewinners`,
    myBingo: (roomId: string) => `room:${roomId}:mybingo`,
    winnerModal: (roomId: string) => `room:${roomId}:winnerModal`,
    activityHost: (roomId: string) => `room:${roomId}:activityHost`,
}