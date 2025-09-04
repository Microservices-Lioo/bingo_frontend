import { IAward } from "./award.interface";

export type UpdateIAward = Pick<IAward, 'name' | 'description' | 'eventId' >
