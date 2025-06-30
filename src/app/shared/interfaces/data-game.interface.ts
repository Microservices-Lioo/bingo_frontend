import { GameModeSharedI } from "./game-mode-shared.interface";
import { GameOnModeSharedI } from "./game-on-mode.interface";
import { GameRuleSharedI } from "./game-rule-shared.interface";
import { GameSharedInterface } from "./game-shared.interface";

export interface DataGameSharedI {
    game: GameSharedInterface,
    gameMode: GameModeSharedI,
    gameOnMode: GameOnModeSharedI,
    gameRule: GameRuleSharedI
}