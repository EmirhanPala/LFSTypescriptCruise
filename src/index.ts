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
import WE from './Layout/Map/WE.json';
import WE3D from './Layout/3DGps/WE.json';
import Connections from './connections.js';

const resources = { ...WE }; //...AS, ...BL, ...FE, ...KY, ...SO,

// JSON verisini kullanarak fonksiyonu çağırıyoruz
const arrowCoordinates = { ...WE3D };

interface RelationData {
  [key: string]: number;
}

interface ArrowCoordinate {
  x: number;
  y: number;
  relation: RelationData;
}

const getDistance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const degreesToNearestDirection = (angle: number, data: ArrowCoordinate[]): number => {
  let nearestDirection = -1;
  let minAngleDifference = 360;

  for (const arrow of data) {
    for (const directionKey in arrow.relation) {
      const direction = Number(directionKey);
      const arrowAngle = arrow.relation[direction];
      const angleDifference = Math.abs(arrowAngle - angle);
      if (angleDifference < minAngleDifference) {
        minAngleDifference = angleDifference;
        nearestDirection = direction;
      }
    }
  }

  return nearestDirection;
};

const getNearestRelationToPoint = (x: number, y: number, data: ArrowCoordinate[]): RelationData | null => {
  let minDistance = Number.MAX_VALUE;
  let nearestRelation: ArrowCoordinate | null = null;

  for (const arrow of data) {
    const arrowX = arrow.x;
    const arrowY = arrow.y;
    const currentDistance = getDistance(x, y, arrowX, arrowY);

    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      nearestRelation = arrow;
    }
  }

  return nearestRelation ? nearestRelation.relation : null;
};

const getNewCoordinates = (x: number, y: number, direction: number, distance: number): { x: number; y: number } => {
  const angleInRadians = (direction - 90) * (Math.PI / 180);
  const newX = x + distance * Math.cos(angleInRadians);
  const newY = y + distance * Math.sin(angleInRadians);
  return { x: newX, y: newY };
};

// Hedef koordinatları
const targetX = -364;
const targetY = 746;

const multiCarInfo = (packet: IS_MCI, inSim: InSim) => {

  packet.Info.map((m) => {
    var conn = connections[getConnIdx(m.PLID, false)];
    let kmh = m.Speed / 91;
    let mph = m.Speed / 146;
    let direction2 = m.Direction / 180;
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
    inSim.send(new IS_BTN({ Text: `${kmh?.toFixed(0)} Speed`, H: 5, L: 40, T: 190, W: 10, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 2 }));

    const nearestRelation = getNearestRelationToPoint(targetX, targetY, WE3D);
    if (nearestRelation) {
      const nearestDirection = degreesToNearestDirection(Object.values(nearestRelation)[0], WE3D);
    } else {
      inSim.send(new IS_BTN({ Text: "Hedefe ulaşmak için verilen verilere göre uygun relation bulunamadı.", H: 10, L: 25, T: 10, W: 100, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 25 }));
    }

    const distance = getDistance(pathx, pathy, targetX, targetY);
    const direction = degreesToNearestDirection(Math.atan2(targetY - pathy, targetX - pathx) * (180 / Math.PI), WE3D);
    const newCoordinates = getNewCoordinates(pathx, pathy, direction, distance);
    console.log("Yeni Koordinatlar: ", newCoordinates);

    let directionName = "";
    if (direction >= 337.5 || direction < 22.5) {
      directionName = "↑ Kuzey";
    } else if (direction >= 22.5 && direction < 67.5) {
      directionName = "↗ Kuzeydoğu";
    } else if (direction >= 67.5 && direction < 112.5) {
      directionName = "→ Doğu";
    } else if (direction >= 112.5 && direction < 157.5) {
      directionName = "↘ Güneydoğu";
    } else if (direction >= 157.5 && direction < 202.5) {
      directionName = "↓ Güney";
    } else if (direction >= 202.5 && direction < 247.5) {
      directionName = "↙ Güneybatı";
    } else if (direction >= 247.5 && direction < 292.5) {
      directionName = "← Batı";
    } else if (direction >= 292.5 && direction < 337.5) {
      directionName = "↖ Kuzeybatı";
    }

    inSim.send(new IS_BTN({ Text: `Car's new direction: ${directionName} degrees`, H: 10, L: 25, T: 10, W: 100, BStyle: ButtonStyle.ISB_DARK, UCID: conn.ucid, ReqI: 255, ClickID: 25 }));

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