import { InSim } from "node-insim";
import { IS_NPL } from "node-insim/packets";
import { connections } from "src/Base/base";

const onNewPlayerJoiningRace = (packet: IS_NPL, inSim: InSim) => {
    connections.push({
        ...connections,
        ucid: packet.UCID,
        plid: packet.PLID,
        playerName: packet.PName,
        car: packet.CName
    });
};
export default onNewPlayerJoiningRace;