import debug from "debug";
import { InSim } from "node-insim";
import { IS_MST, InSimFlags } from "node-insim/packets";
import Connections from "src/connections";
export let connections: Array<Connections> = [];

//Insim Log
export const log = debug('js-insim');

//All user message
export const MsgAll = (msg: string, inSim: InSim): void => {
    return inSim.send(new IS_MST({ Msg: msg }));
};

export const getConnIdx = (id: number, thatWasUniqId: boolean): number => {
    const count = connections.length;
    for (let i = 0; i < count; i++) {
        if (thatWasUniqId) {
            if (connections[i].ucid === id) {
                return i;
            }
        } else {
            if (connections[i].plid === id) {
                return i;
            }
        }
    }
    return 0;
};
export const removeConnFromList = (ucid: number): void => {
    const index = getConnIdx(ucid, true);
    if (index !== -1) {
        connections.splice(index, 1);
    }
};