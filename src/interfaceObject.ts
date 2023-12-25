export interface PhysicalInterface {
    name: string;
    state: {admin: string, link: string },
    dscr: string,
    linkLevelType: string,
    mtu: number,
    speed: number,
    duplex: string,
    mac: string,
    clearing: string,
    statsList: interfaceStats[],
    logIntList: {
        name: string,
        dscr: string,
        protocolList: {
            type: string,
            value: {
                ipList: {
                    ip: string,
                    mask: number,
                    net: string,
                    netLong: number,
                    broadLong: number,
                    flagList: string[]
                }
            }
        }[],
        statsList: interfaceStats[],
        mtu: number
    }
}

export interface interfaceStats {
    type: string,
    counters: {
        inBytes: number,
        outBytes: number,
        inPkts: number,
        outPkts: number
    },
    load?: {
        inBytes: number,
        outBytes: number,
        inPkts: number,
        outPkts: number
    },
}