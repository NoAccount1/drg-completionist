import { Miner } from "utils/miner";
import { Framework } from "pages/frameworks/FrameworkData";
import { MinerWeapon } from "utils/weapons";

type Actions =
  | {
      type: "TOGGLE_OVERCLOCK";
      payload: {
        miner: Miner;
        overclock: string;
      };
    }
  | {
      type: "TOGGLE_FRAMEWORK";
      payload: {
        framework: Framework;
      } & { [T in Miner]: { miner: T; weapon: MinerWeapon<T> } }[Miner];
    };

export default Actions;
