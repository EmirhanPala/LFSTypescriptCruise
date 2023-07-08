import './env.js';

import debug from 'debug';
import { InSim } from 'node-insim';
import type { IS_MCI, IS_NCI, IS_NCN, IS_NPL, IS_PLL, IS_VER } from 'node-insim/packets';
import { IS_ISI_ReqI, PacketType, IS_MSO, InSimFlags, IS_MSL, MessageSound, IS_MST, IS_BTN, ButtonStyle } from 'node-insim/packets';

const log = debug('js-insim');

// Host 1
let connections: Array<Connections> = [];

const inSimHost1 = new InSim('Local Host');

const Flags: InSimFlags = InSimFlags.ISF_CON | InSimFlags.ISF_MCI | InSimFlags.ISF_MSO_COLS | InSimFlags.ISF_CON;

inSimHost1.connect({
  IName: "NodeInSim",
  Host: process.env.SERVER_1_HOST ?? '127.0.0.1',
  Port: process.env.SERVER_1_PORT ? parseInt(process.env.SERVER_1_PORT) : 29999,
  ReqI: IS_ISI_ReqI.SEND_VERSION,
  Admin: process.env.SERVER_1_ADMIN ?? '',
  Prefix: "!",
  Interval: 200,
  Flags: Flags
});

const getConnIdx = (id: number, thatWasUniqId: boolean): number => {
  const count = connections.length;
  for (let i = 0; i < count; i++) {
    if (thatWasUniqId) {
      if (connections[i].ucid === id) {
        return i;
      }
    } else {
      if (connections[i].plid === id) {
        return i;
      }
    }
  }
  return 0;
};
const removeConnFromList = (ucid: number): void => {
  const index = getConnIdx(ucid, true);
  if (index !== -1) {
    connections.splice(index, 1);
  }
};

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

const addConnectionsToList = (packet: IS_NCN) => {
  let conn = new Connections();
  conn.ucid = packet.UCID;
  conn.playerName = packet.PName;
  conn.userName = packet.UName;
  conn.admin = packet.Admin;
  connections.push(conn);
};

const newConn = (packet: IS_NCN, inSim: InSim) => {
  //Add connection to list
  addConnectionsToList(packet);
  var conn = connections[getConnIdx(packet.UCID, true)];
};

class MapItem {
  name: string = "";
  speedLimit: number = 0;
  polyLimit: number = 0;
  pitOk: number = 0;
  inGame: number = 0;
  ucretsizPit: boolean = false;
  paraVerme: boolean = false;
  X: Array<number> = [];
  Y: Array<number> = [];
}

const checkPos = (polySides: number, polyX: number[], polyY: number[], x: number, y: number): boolean => {
  let i: number, j: number = polySides - 1;
  let oddNodes: boolean = false;
  for (i = 0; i < polySides; i++) {
    if ((polyY[i] < y && polyY[j] >= y) || (polyY[j] < y && polyY[i] >= y)) {
      if (polyX[i] + (y - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < x) {
        oddNodes = !oddNodes;
      }
    }
    j = i;
  }
  return oddNodes;
}

// import AS from './json/AS.json';
// import BL from './json/BL.json';
// import FE from './json/FE.json';
// import KY from './json/KY.json';
// import SO from './json/SO.json';
import WE from './json/WE.json';
import Connections from './connections.js';

const resources = { ...WE }; //...AS, ...BL, ...FE, ...KY, ...SO,

const multiCarInfo = (packet: IS_MCI, inSim: InSim) => {

  packet.Info.map((m) => {
    var conn = connections[getConnIdx(m.PLID, false)];
    let kmh = m.Speed / 91;
    let mph = m.Speed / 146;
    let direction = m.Direction / 180;
    let pathx = m.X / 65536;
    let pathy = m.Y / 65536;
    let pathz = m.Z / 65536;
    let angle = m.AngVel * 360 / 16384;
    let heading = m.Heading * 180.0 / 32768.0;
    conn.wayDedect = false;
    resources.WE.map((s) => {
      if (checkPos(s.X?.length, s.X, s.Y, pathx, pathy)) {
        conn.wayDedect = true;
        inSim.send(new IS_BTN({ Text: `^7${s.name} ^2${s.speedLimit}km/h`, H: 5, L: 170, T: 8, W: 29, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 1 }));
      }
    })
    if (!conn.wayDedect)
      inSim.send(new IS_BTN({ Text: `^0Invalid Path ^350 km/h`, H: 5, L: 170, T: 8, W: 29, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 1 }));
    inSim.send(new IS_BTN({ Text: `${kmh?.toFixed(0)} Speed`, H: 5, L: 40, T: 40, W: 30, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 2 }));
    //   resources.WE.map((s) => {
    //     if (checkPos(s.X?.length, s.X, s.Y, m.X / 65536, m.Y / 65536)) {
    //       inSim.send(new IS_BTN({ Text: `^7${s.name} ^2${s.speedLimit}km/h`, H: 5, L: 170, T: 8, W: 29, BStyle: ButtonStyle.ISB_DARK, UCID: 255, ReqI: 255, ClickID: 1 }));
    //     }
    //   })
    //   const SpeedMS: number = (m.Speed / 91);
    //   inSim.send(new IS_BTN({ Text: `${SpeedMS?.toFixed(0)} Speed`, H: 5, L: 40, T: 40, W: 30, BStyle: ButtonStyle.ISB_DARK, UCID: 255, ReqI: 255, ClickID: 2 }));
  });
};

const newPlayerJoiningRace = (packet: IS_NPL, inSim: InSim) => {
  connections.push({
    ...connections,
    ucid: packet.UCID,
    plid: packet.PLID,
    playerName: packet.PName,
    car: packet.CName
  });
};

const playerLeaveRace = (packet: IS_PLL, inSim: InSim) => {
  connections = connections.filter((f) => f.plid === packet.PLID);
};

inSimHost1.on('connect', onConnect);
inSimHost1.on('disconnect', onDisconnect);
inSimHost1.on(PacketType.ISP_VER, onVersion);
inSimHost1.on(PacketType.ISP_MSO, onMessage);
inSimHost1.on(PacketType.ISP_NCN, newConn);
// inSimHost1.on(PacketType.ISP_NCI, newConnInfo);
inSimHost1.on(PacketType.ISP_MCI, multiCarInfo);
inSimHost1.on(PacketType.ISP_NPL, newPlayerJoiningRace);
inSimHost1.on(PacketType.ISP_PLL, playerLeaveRace);


const MsgAll = (msg: string, inSim: InSim): void => {
  return inSim.send(new IS_MST({ Msg: msg }));
};

process.on('uncaughtException', (error) => {
  log(error);
});