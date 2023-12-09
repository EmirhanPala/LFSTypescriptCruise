import { log } from "debug";
import { InSim } from "node-insim";

const onDisconnect = (inSim: InSim) => {
    log(`Disconnected from ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`,);
};
export default onDisconnect;