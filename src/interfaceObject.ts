export class PhysicalInterface {
  name: string;
  state: { admin: string; link: string };
  dscr?: string;
  linkLevelType: string;
  mtu: number;
  speed: number;
  duplex?: string;
  mac: string;
  clearing: string;
  statsList: InterfaceStats;
  inErrors: ErrorStats;
  outErrors: ErrorStats;

  logIntList: LogicalInterface[];

  constructor() {
    this.name = "";
    this.state = { admin: "", link: "" };
    this.linkLevelType = "";
    this.mtu = 0;
    this.speed = 0;
    this.mac = "";
    this.clearing = "";
    this.statsList = new InterfaceStats();
    this.inErrors = new ErrorStats();
    this.outErrors = new ErrorStats();
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

  constructor(type: string = "") {
    this.type = type;
    this.counters = {
      inBytes: 0,
      outBytes: 0,
      inPkts: 0,
      outPkts: 0,
    };
  }
}

export class ErrorStats {
  type: string;
  counters: {
    inErr?: number;
    inDrops?: number;
    outErr?: number;
    outDrops?: number;
  };

  constructor() {
    this.type = "";
    this.counters = {};
  }
}

export class LogicalInterface {
  name: string;
  dscr?: string;
  protocolList: Protocol[];
  statsList: InterfaceStats[];
  mtu: number;

  constructor() {
    this.name = "";
    this.protocolList = [];
    this.statsList = [];
    this.mtu = 0;
  }
}

export class Protocol {
  type: string;
  value?: {
    ipList: IPInfo[];
  };

  constructor(type: string = "") {
    this.type = type;
  }
}

export class IPInfo {
  ip: string;
  mask: number;
  net: string;
  netLong: number;
  broadLong: number;
  flagList: string[];

  constructor() {
    this.ip = "";
    this.mask = 0;
    this.net = "";
    this.netLong = 0;
    this.broadLong = 0;
    this.flagList = [];
  }
}
