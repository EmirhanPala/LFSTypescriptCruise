import { InSim } from "node-insim";
import { IS_CNL } from "node-insim/packets";
import { MsgAll } from "src/Base";

const onConnectionLeft = (packet: IS_CNL, inSim: InSim) => {
    MsgAll(`Connected to LFS ${packet.Reason} ${packet.Total} at ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`, inSim);
};
export default onConnectionLeft;