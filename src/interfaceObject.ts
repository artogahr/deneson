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
    statsList: {
        type: string,
        counters: {
            inBytes: number,
            outBytes: number,
            inPkts: number,
            outPkts: number
        },
        load: {
            inBytes: number,
            outBytes: number,
            inPkts: number,
            outPkts: number
        },
    }[],
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
        statsList: {
            type: string,
            counters: {
                inPkts: number,
                inBytes: number,
                outPkts: number,
                outBytes: number
            }
            load: {
                inBytes: number,
                outBytes: number,
                inPkts: number,
                outPkts: number
            }
        }[],
        mtu: number
    }
}