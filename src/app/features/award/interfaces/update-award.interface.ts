import { AwardInterface } from "./award.interface";

export type UpdateAwardInterface = Pick<AwardInterface, 'name' | 'description' | 'eventId' >
