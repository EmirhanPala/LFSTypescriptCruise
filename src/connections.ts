import { CompCar } from "node-insim/packets";

class Connections {
    ucid?: number = 0;
    plid?: number = 0;
    userName?: string = "";
    playerName?: string = "";
    admin?: number = 0;
    car?: string = "";
    wayDedect?: boolean = false;
    compCar?: CompCar = new CompCar();
}

export default Connections;