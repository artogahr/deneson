import {
  InterfaceStats,
  LogicalInterface,
  PhysicalInterface,
  Protocol,
} from "./interfaceObject.ts";
const filePath = "src/input.txt";

// Read the contents of the file
const text = await Deno.readTextFile(filePath);

//Assuming the purpose of this script is to parse the physical interfaces only
let physicalInterfaces: PhysicalInterface[] = [];

// Split sections based on two new lines.
// Will create an object for each section, but check if it is a physical interface or a logical one.
// We hold the last physical interface in the currentPhysicalInterface variable.
// For each logical interface, we create a new object and push it to the currentPhysicalInterface.
// Add the physical interface to the list of physical interfaces when another physical interface is found, and set the currentPhysicalInterface to null.

let currentPhysicalInterface: PhysicalInterface;
const sections = text.split("\n\n");

sections.forEach((section) => {
  const lines = section.split("\n");
  //Test if the interface is a Physical or a logical one
  if (RegExp("Physical interface:").test(lines[0])) {
    currentPhysicalInterface = new PhysicalInterface();
    currentPhysicalInterface.name = lines[0].split(" ")[2].replace(",", "");

    // Check if the interface is up or down
    if (RegExp("Enabled").test(lines[0])) {
      currentPhysicalInterface.state.admin = "up";
      if (RegExp("Up").test(lines[0])) {
        currentPhysicalInterface.state.link = "up";
      } else {
        currentPhysicalInterface.state.link = "down";
      }
    } else if (RegExp("Disabled").test(lines[0])) {
      currentPhysicalInterface.state.admin = "down";
      currentPhysicalInterface.state.link = "down";
      // Can't have link if admin is down anyway
    }

    // Variable holding what kind of sub-section we're reading now
    let currentSection = "";
    lines.forEach((line) => {
      if (RegExp("Description").test(line)) {
        currentPhysicalInterface.dscr = line.split(":")[1].trim();
      } else if (RegExp("Link-level type").test(line)) {
        var linkLevelMatch = line.match(/Link-level type: (\w+)/);
        currentPhysicalInterface.linkLevelType = linkLevelMatch
          ? linkLevelMatch[1].toLowerCase()
          : "";

        var mtuMatch = line.match(/MTU: (\d+)/);
        currentPhysicalInterface.mtu = mtuMatch ? parseInt(mtuMatch[1], 10) : 0;

        var linkModeMatch = line.match(/Link-mode: (\w+)/);
        currentPhysicalInterface.duplex = linkModeMatch
          ? linkModeMatch[1].toLowerCase()
          : "";

        var speedMatch = line.match(/Speed: (\d+)([KMGTP]?bps)/i);
        currentPhysicalInterface.speed = speedMatch
          ? convertSpeedToBitsPerSecond(speedMatch[1], speedMatch[2])
          : 0;
      } else if (RegExp("Current address").test(line)) {
        var macMatch = line.match(/Hardware address: (\S+)/);
        currentPhysicalInterface.mac = macMatch ? macMatch[1] : "";
      } else if (RegExp("Statistics last cleared").test(line)) {
        currentPhysicalInterface.clearing = line.split(":")[1].trim()
          .toLowerCase();
      } else if (RegExp("Traffic statistics").test(line)) {
        currentSection = "traffic";
      } else if (RegExp("Input errors").test(line)) {
        currentSection = "inErrors";
        currentPhysicalInterface.inErrors.type = "inErrors";
      } else if (RegExp("Output errors").test(line)) {
        currentSection = "outErrors";
        currentPhysicalInterface.outErrors.type = "outErrors";
      } else if (RegExp("LSI").test(line)) {
        currentSection = "lsi";
      } else if (
        RegExp("Input  bytes").test(line) && currentSection == "traffic"
      ) {
        currentPhysicalInterface.trafficStats.counters.inBytes = parseInt(
          line.split(":")[1].trim(),
          10,
        );
        if (RegExp("bps").test(line)) {
          let bpsMatch = line.match(/(\d+) bps/);
          currentPhysicalInterface.trafficStats.load = {
            inBytes: bpsMatch ? parseInt(bpsMatch[1], 10) : 0,
            outBytes: 0,
            inPkts: 0,
            outPkts: 0,
          };
        }
      } else if (
        RegExp("Output bytes").test(line) && currentSection == "traffic"
      ) {
        currentPhysicalInterface.trafficStats.counters.outBytes = parseInt(
          line.split(":")[1].trim(),
          10,
        );
        if (
          RegExp("bps").test(line) && currentPhysicalInterface.trafficStats.load
        ) {
          let bpsMatch = line.match(/(\d+) bps/);
          currentPhysicalInterface.trafficStats.load.outBytes = bpsMatch
            ? parseInt(bpsMatch[1], 10)
            : 0;
        }
      } else if (
        RegExp("Input  packets").test(line) && currentSection == "traffic"
      ) {
        currentPhysicalInterface.trafficStats.counters.inPkts = parseInt(
          line.split(":")[1].trim(),
          10,
        );
        if (
          RegExp("pps").test(line) && currentPhysicalInterface.trafficStats.load
        ) {
          let bpsMatch = line.match(/(\d+) pps/);
          currentPhysicalInterface.trafficStats.load.inPkts = bpsMatch
            ? parseInt(bpsMatch[0], 10)
            : 0;
        }
      } else if (
        RegExp("Output packets").test(line) && currentSection == "traffic"
      ) {
        currentPhysicalInterface.trafficStats.counters.outPkts = parseInt(
          line.split(":")[1].trim(),
          10,
        );
        if (
          RegExp("pps").test(line) && currentPhysicalInterface.trafficStats.load
        ) {
          let bpsMatch = line.match(/(\d+) pps/);
          currentPhysicalInterface.trafficStats.load.outPkts = bpsMatch
            ? parseInt(bpsMatch[1], 10)
            : 0;
        }
      } else if (RegExp("Errors").test(line)) {
        let errorMatch = line.match(/Errors: (\d+).*Drops: (\d+)/);
        if (currentSection == "inErrors") {
          currentPhysicalInterface.inErrors.counters.inErr = errorMatch
            ? parseInt(errorMatch[1], 10)
            : 0;
          currentPhysicalInterface.inErrors.counters.inDrops = errorMatch
            ? parseInt(errorMatch[2], 10)
            : 0;
        } else if (currentSection == "outErrors") {
          currentPhysicalInterface.outErrors.counters.outErr = errorMatch
            ? parseInt(errorMatch[1], 10)
            : 0;
          currentPhysicalInterface.inErrors.counters.outDrops = errorMatch
            ? parseInt(errorMatch[2], 10)
            : 0;
        }
      }
    });

    physicalInterfaces.push(currentPhysicalInterface);
  } else if (RegExp("Logical interface").test(lines[0])) {
    //add to the current physical interface
    let logicalInt = new LogicalInterface();
    logicalInt.name = lines[0].split(" ")[4].replace(",", "");
    let currentSection = "";
    let currentStatistics = new InterfaceStats();
    let currentProtocol = new Protocol();
    lines.forEach((line) => {
      if (RegExp("Description").test(line)) {
        logicalInt.dscr = line.split(":")[1].trim();
      } else if (RegExp("Traffic statistics").test(line)) {
        currentSection = "traffic";
        currentStatistics = new InterfaceStats("traffic");
      } else if (RegExp("Local statistics").test(line)) {
        currentSection = "local";
        currentStatistics = new InterfaceStats("local");
      } else if (RegExp("Transit statistics").test(line)) {
        currentSection = "transit";
        currentStatistics = new InterfaceStats("transit");
      } else if (RegExp("Bundle").test(line)) {
        currentSection = "bundle";
        currentStatistics = new InterfaceStats("bundle");
      } else if (RegExp("Input").test(line)) {
        switch (currentSection) {
          case "local":
          case "transit":
          case "traffic": {
            if (RegExp("bytes").test(line)) {
              currentStatistics.counters.inBytes = parseInt(
                line.split(":")[1].trim(),
                10,
              );
              if (RegExp("bps").test(line)) {
                let bpsMatch = line.match(/(\d+) bps/);
                currentStatistics.load = {
                  inBytes: bpsMatch ? parseInt(bpsMatch[0], 10) : 0,
                  outBytes: 0,
                  inPkts: 0,
                  outPkts: 0,
                };
              }
            } else if (RegExp("packets").test(line)) {
              currentStatistics.counters.inBytes = parseInt(
                line.split(":")[1].trim(),
                10,
              );
              if (RegExp("pps").test(line) && currentStatistics.load) {
                let ppsMatch = line.match(/(\d+) pps/);
                currentStatistics.load.inPkts = ppsMatch
                  ? parseInt(ppsMatch[0], 10)
                  : 0;
              }
            }
            break;
          }
          case "bundle": {
            let lineMatch = line.match(
              /Input : .* (\d+) .* (\d+) .* (\d+) .* (\d+)/,
            );
            currentStatistics.counters.inPkts = parseInt(
              lineMatch ? lineMatch[1] : "0",
              10,
            );
            currentStatistics.counters.inBytes = parseInt(
              lineMatch ? lineMatch[3] : "0",
            );
            currentStatistics.load = {
              inBytes: parseInt(lineMatch ? lineMatch[4] : "0"),
              outBytes: 0,
              inPkts: parseInt(lineMatch ? lineMatch[2] : "0"),
              outPkts: 0,
            };

            break;
          }
        }
      } else if (RegExp("Output").test(line)) {
        switch (currentSection) {
          case "local":
          case "transit":
          case "traffic": {
            if (RegExp("packets").test(line)) {
              currentStatistics.counters.outPkts = parseInt(
                line.split(":")[1].trim(),
              );
              logicalInt.statsList.push(currentStatistics);
              currentStatistics = new InterfaceStats();
              if (RegExp("pps").test(line) && currentStatistics.load) {
                let ppsMatch = line.match(/(\d+) pps/);
                currentStatistics.load.outPkts = ppsMatch
                  ? parseInt(ppsMatch[1], 10)
                  : 0;
              }
            } else {
              currentStatistics.counters.outBytes = parseInt(
                line.split(":")[1].trim(),
                10,
              );
              if (RegExp("bps").test(line) && currentStatistics.load) {
                let bpsMatch = line.match(/(\d+) bps/);
                currentStatistics.load.outBytes = bpsMatch
                  ? parseInt(bpsMatch[1], 10)
                  : 0;
              }
            }
            break;
          }
          case "bundle": {
            let lineMatch = line.match(
              /Output: .* (\d+) .* (\d+) .* (\d+) .* (\d+)/,
            );
            currentStatistics.counters.outPkts = parseInt(
              lineMatch ? lineMatch[1] : "0",
              10,
            );
            currentStatistics.counters.outBytes = parseInt(
              lineMatch ? lineMatch[3] : "0",
            );
            if (currentStatistics.load) {
              currentStatistics.load.outPkts = parseInt(
                lineMatch ? lineMatch[2] : "0",
              );
              currentStatistics.load.outBytes = parseInt(
                lineMatch ? lineMatch[4] : "0",
              );
            }
            logicalInt.statsList.push(currentStatistics);
            currentSection = "";
            currentStatistics = new InterfaceStats();
            break;
          }
        }
      } else if (RegExp("Protocol").test(line)) {
        currentSection = "protocol";
        let protMatch = line.match(/Protocol (\w+)/);
        currentProtocol = new Protocol(protMatch ? protMatch[1] : "");
        // This could've been an if statement, but I want to leave it open-handed for parsing info from other protocols in the future
        switch (currentProtocol.type) {
          case "inet": {
            let mtuMatch = line.match(/MTU: (\d+)/);
            if (mtuMatch) {
              logicalInt.mtu = parseInt(mtuMatch[1], 10);
            }
            currentProtocol.value = {
              ipList: {
                ip: "",
                mask: 0,
                net: "",
                netLong: 0,
                broadLong: 0,
                flagList: [],
              },
            };
          }
        }
        logicalInt.protocolList.push(currentProtocol);
      } else if (
        RegExp("Addresses, Flags:").test(line) && currentProtocol.type == "inet"
      ) {
        // Functional programming ftw
        line.split(":")[1].split(" ").filter((x) => x.length != 0).forEach(
          (flag) => {
            currentProtocol.value?.ipList.flagList.push(flag.toLowerCase());
          },
        );
      } else if (
        RegExp("Destination").test(line) && currentProtocol.type == "inet"
      ) {
        // Parsing IP addresses is a biit tricky.
        let ipMatch = line.match(
          /Destination: (\d+\.\d+\.\d+\.\d+)\/(\d+), Local: (\d+\.\d+\.\d+\.\d+)/,
        );
        if (currentProtocol.value) {
          let mask = ipMatch ? parseInt(ipMatch[2]) : 0;
          currentProtocol.value.ipList.net = ipMatch
            ? ipMatch[1] + "/" + mask
            : "";
          currentProtocol.value.ipList.mask = mask;
          currentProtocol.value.ipList.ip = ipMatch ? ipMatch[3] : "";
          currentProtocol.value.ipList.broadLong = IPtoLong(
            currentProtocol.value.ipList.ip,
          );
          currentProtocol.value.ipList.netLong = IPtoLong(
            currentProtocol.value.ipList.net,
          );
        }
      }
    });
    currentPhysicalInterface.logIntList.push(logicalInt);
  }
});

function convertSpeedToBitsPerSecond(value: string, unit: string) {
  var multiplier = 1;
  unit = unit.toLowerCase();

  let multipliers: { [key: string]: number } = {
    kbps: 1e3,
    mbps: 1e6,
    gbps: 1e9,
    tbps: 1e12,
    pbps: 1e15,
  };

  // Use the specified multiplier or default to 1
  multiplier = multipliers[unit] || 1;

  return parseInt(value, 10) * multiplier;
}
console.log(JSON.stringify(physicalInterfaces, null, "  "));

function IPtoLong(ip: string) {
  let parts = ip.split(".");
  return (
    (parseInt(parts[0], 10) << 24) |
    (parseInt(parts[1], 10) << 16) |
    (parseInt(parts[2], 10) << 8) |
    parseInt(parts[3], 10)
  );
}
