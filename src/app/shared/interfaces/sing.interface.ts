export enum StatusSing {
  VERIFIED = "verified", 
  REJECTED = "rejected", 
  PENDING = "pending"
}

export interface Sing {
  id: string,
  userId: string,
  cardId: string,
  eventId: string,
  fullnames: string,
  hour: string,
  status: StatusSing
}