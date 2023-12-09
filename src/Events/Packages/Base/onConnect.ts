import { log } from "debug";
import { InSim } from "node-insim";

const onConnect = (inSim: InSim) => {
    log(`Connected to ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`);
};
export default onConnect;