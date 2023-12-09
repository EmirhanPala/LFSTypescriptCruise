import './env.js';
import { InSim } from 'node-insim';
import { IS_ISI_ReqI, PacketType, InSimFlags } from 'node-insim/packets';
import { log } from './Base/index.js';
import { onConnect, onConnectionLeft, onDisconnect, onMessage, onMultiCarInfo, onNewConnection, onNewPlayerJoiningRace, onPlayerLeaveRace, onVersion } from './Events/Packages/index.js';

// Host 1
const inSimHost1 = new InSim('Local Host');

inSimHost1.connect({
  IName: "NodeInSim",
  Host: process.env.SERVER_1_HOST ?? '127.0.0.1',
  Port: process.env.SERVER_1_PORT ? parseInt(process.env.SERVER_1_PORT) : 29999,
  ReqI: IS_ISI_ReqI.SEND_VERSION,
  Admin: process.env.SERVER_1_ADMIN ?? '',
  Prefix: "!",
  Interval: 1000,
  Flags: InSimFlags.ISF_CON | InSimFlags.ISF_MCI | InSimFlags.ISF_MSO_COLS | InSimFlags.ISF_CON
});

inSimHost1.on('connect', onConnect);
inSimHost1.on('disconnect', onDisconnect);
inSimHost1.on(PacketType.ISP_VER, onVersion);
inSimHost1.on(PacketType.ISP_MSO, onMessage);
inSimHost1.on(PacketType.ISP_NCN, onNewConnection);
inSimHost1.on(PacketType.ISP_MCI, onMultiCarInfo);
inSimHost1.on(PacketType.ISP_NPL, onNewPlayerJoiningRace);
inSimHost1.on(PacketType.ISP_PLL, onPlayerLeaveRace);
inSimHost1.on(PacketType.ISP_CNL, onConnectionLeft);

process.on('uncaughtException', (error) => {
  log(error);
});