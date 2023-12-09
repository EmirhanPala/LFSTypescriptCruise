import { IS_NCN } from "node-insim/packets";
import { connections } from "src/Base/base";
import Connections from "src/connections";

const onAddConnectionsToList = (packet: IS_NCN) => {
    let conn = new Connections();
    conn.ucid = packet.UCID;
    conn.playerName = packet.PName;
    conn.userName = packet.UName;
    conn.admin = packet.Admin;
    connections.push(conn);
};
export default onAddConnectionsToList;