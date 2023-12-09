import onConnect from "./Base/onConnect";
import onDisconnect from "./Base/onDisconnect";
import onAddConnectionsToList from "./onAddConnectionsToList";
import onConnectionLeft from "./onConnectionLeft.ISP_CNL";
import onMultiCarInfo from "./onMultiCarInfo.ISP_MCI";
import onNewConnection from "./onNewConnection.ISP_NCN";
import onNewPlayerJoiningRace from "./onNewPlayerJoiningRace.ISP_NPL";
import onMessage from "./onMessage.ISP_MSO";
import onVersion from "./onVersion.IS_VER";
import onPlayerLeaveRace from "./onPlayerLeaveRace.ISP_PLL";

//Destructuring
export {
    onConnect,
    onDisconnect,
    onAddConnectionsToList,
    onNewConnection,
    onPlayerLeaveRace,
    onMultiCarInfo,
    onNewPlayerJoiningRace,
    onVersion,
    onMessage,
    onConnectionLeft,
};