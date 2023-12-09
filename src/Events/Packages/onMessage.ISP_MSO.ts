import { log } from "debug";
import { InSim } from "node-insim";
import { IS_MSO } from "node-insim/packets";

const onMessage = (packet: IS_MSO, inSim: InSim) => {
    log(
        `${inSim.options.Host}:${inSim.options.Port} (${inSim.id}) - message received: ${packet.Msg}`,
    );
};
export default onMessage;