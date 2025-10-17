export const WsConst = {
    countUser: (roomId: string) => `${roomId}:users`,
    count: (roomId: string) => `room:${roomId}:count`,
    room: (roomId: string) => `room:${roomId}`,
    game: (roomId: string) => `room:${roomId}:game`,
    award: (roomId: string) => `room:${roomId}:award`,

    getCellCard: (roomId: string) => `room:${roomId}:cell:card`,
    tableWinners: (roomId: string) => `room:${roomId}:tablewinners`,
    myBingo: (roomId: string) => `room:${roomId}:mybingo`,
    winnerModal: (roomId: string) => `room:${roomId}:winnerModal`,
    activityHost: (roomId: string) => `room:${roomId}:activityHost`,
    awardStatus: (roomId: string) => `room:${roomId}:awardStatus`,
    rouletteStatus: (roomId: string) => `room:${roomId}:rouletteStatus`,
    rouletteWinner: (roomId: string) => `room:${roomId}:rouletteWinner`,
}