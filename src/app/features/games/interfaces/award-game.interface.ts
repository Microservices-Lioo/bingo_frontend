import { AwardSharedInterface } from "../../../shared/interfaces";

export enum StatusAward {
    NOW = 'NOW',
    PROX ='PROX',
    END = 'END',
}

export interface AwardGameInterface extends AwardSharedInterface {
  status: StatusAward;
};