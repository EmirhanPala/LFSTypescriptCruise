import { InSim } from "node-insim";
import { IS_NCN } from "node-insim/packets";
import { connections, getConnIdx } from "src/Base/base";
import { onAddConnectionsToList } from ".";

const onNewConnection = (packet: IS_NCN, inSim: InSim) => {
    //Add connection to list
    onAddConnectionsToList(packet);
    var conn = connections[getConnIdx(packet.UCID, true)];
};
export default onNewConnection;