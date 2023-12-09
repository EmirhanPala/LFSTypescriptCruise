import { InSim } from "node-insim";
import { IS_VER } from "node-insim/packets";
import { MsgAll, log } from "src/Base";

const onVersion = (packet: IS_VER, inSim: InSim) => {
    MsgAll(`Connected to LFS ${packet.Product} ${packet.Version} at ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`, inSim);
    log(
        `Connected to LFS ${packet.Product} ${packet.Version}`,
    );
};
export default onVersion;