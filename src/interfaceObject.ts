export class PhysicalInterface {
  name: string;
  state: { admin: string; link: string };
  dscr: string;
  linkLevelType: string;
  mtu: number;
  speed: number;
  duplex: string;
  mac: string;
  clearing: string;
  statsList: InterfaceStats[];
  logIntList: LogicalInterface[];

  constructor() {
    this.name = "";
    this.state = { admin: "", link: "" };
    this.dscr = "";
    this.linkLevelType = "";
    this.mtu = 0;
    this.speed = 0;
    this.duplex = "";
    this.mac = "";
    this.clearing = "";
    this.statsList = [];
    this.logIntList = [];
  }
}

export class InterfaceStats {
  type: string;
  counters: {
    inBytes: number;
    outBytes: number;
    inPkts: number;
    outPkts: number;
  };
  load?: {
    inBytes: number;
    outBytes: number;
    inPkts: number;
    outPkts: number;
  };

  constructor() {
    this.type = "";
    this.counters = {
      inBytes: 0,
      outBytes: 0,
      inPkts: 0,
      outPkts: 0,
    };
  }
}

export class LogicalInterface {
  name: string;
  dscr: string;
  protocolList: {
    type: string;
    value: {
      ipList: {
        ip: string;
        mask: number;
        net: string;
        netLong: number;
        broadLong: number;
        flagList: string[];
      };
    };
  }[];
  statsList: InterfaceStats[];
  mtu: number;

  constructor() {
    this.name = "";
    this.dscr = "";
    this.protocolList = [];
    this.statsList = [];
    this.mtu = 0;
  }
}
