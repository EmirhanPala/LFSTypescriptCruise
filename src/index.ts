import './env.ts';

import debug from 'debug';
import { InSim } from 'node-insim';
import type { IS_MCI, IS_NCI, IS_NCN, IS_VER } from 'node-insim/packets';
import { IS_ISI_ReqI, PacketType, IS_MSO, InSimFlags, IS_MSL, MessageSound, IS_MST, IS_BTN, ButtonStyle } from 'node-insim/packets';

const log = debug('js-insim');

// Host 1

const inSimHost1 = new InSim('Local Host');

const Flags: InSimFlags = InSimFlags.ISF_CON | InSimFlags.ISF_MCI | InSimFlags.ISF_MSO_COLS | InSimFlags.ISF_CON;

inSimHost1.connect({
  IName: "NodeInSim",
  Host: process.env.SERVER_1_HOST ?? '127.0.0.1',
  Port: process.env.SERVER_1_PORT ? parseInt(process.env.SERVER_1_PORT) : 29999,
  ReqI: IS_ISI_ReqI.SEND_VERSION,
  Admin: process.env.SERVER_1_ADMIN ?? '',
  Prefix: "!",
  Interval: 1000,
  Flags: Flags
});

// Event handlers

const onConnect = (inSim: InSim) => {
  log(`Connected to ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`);
};

const onDisconnect = (inSim: InSim) => {
  log(
    `Disconnected from ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`,
  );
};

const onVersion = (packet: IS_VER, inSim: InSim) => {
  MsgAll(`Connected to LFS ${packet.Product} ${packet.Version} at ${inSim.options.Host}:${inSim.options.Port} (${inSim.id})`, inSim);
  log(
    `Connected to LFS ${packet.Product} ${packet.Version}`,
  );
};

const onMessage = (packet: IS_MSO, inSim: InSim) => {
  log(
    `${inSim.options.Host}:${inSim.options.Port} (${inSim.id}) - message received: ${packet.Msg}`,
  );
};

const newConn = (packet: IS_NCN, inSim: InSim) => {
  log(
    `
    New Conn: 
    Admin: ${packet.Admin} -
    Flags: ${packet.Flags} -
    PName: ${packet.PName} - 
    ReqI: ${packet.ReqI} -
    Total: ${packet.Total} -
    UCID: ${packet.UCID} -
    UName: ${packet.UName}    
    `
  )
};

const newConnInfo = (packet: IS_NCI, inSim: InSim) => {
  log(
    `
    New Conn: 
    Admin: ${packet.IPAddress} -
    Flags: ${packet.Language} -
    PName: ${packet.ReqI} - 
    ReqI: ${packet.Size} -
    Total: ${packet.Type} -
    UCID: ${packet.UCID} -
    UName: ${packet.UserID}    
    `
  )
};

const multiCarInfo = (packet: IS_MCI, inSim: InSim) => {
  packet.Info.map((m) => {
    const SpeedMS: number = (m.Speed / 91);
    inSim.send(new IS_BTN({ Text: `${SpeedMS?.toFixed(0)} Speed`, H: 5, L: 40, T: 40, W: 30, BStyle: ButtonStyle.ISB_DARK, UCID: 255, ReqI: 255 }));
  });
};

inSimHost1.on('connect', onConnect);
inSimHost1.on('disconnect', onDisconnect);
inSimHost1.on(PacketType.ISP_VER, onVersion);
inSimHost1.on(PacketType.ISP_MSO, onMessage);
inSimHost1.on(PacketType.ISP_NCN, newConn);
inSimHost1.on(PacketType.ISP_NCI, newConnInfo);
inSimHost1.on(PacketType.ISP_MCI, multiCarInfo);

const MsgAll = (msg: string, inSim: InSim): void => {
  return inSim.send(new IS_MST({ Msg: msg }));
};

process.on('uncaughtException', (error) => {
  log(error);
});