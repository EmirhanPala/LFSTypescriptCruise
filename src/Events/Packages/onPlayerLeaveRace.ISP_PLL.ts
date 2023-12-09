import { InSim } from "node-insim";
import { IS_PLL } from "node-insim/packets";
import { connections } from "src/Base/base";

const onPlayerLeaveRace = (packet: IS_PLL, inSim: InSim) => {
    var conn = connections.filter((f) => f.plid === packet.PLID);
};
export default onPlayerLeaveRace;