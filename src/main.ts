import {
  InterfaceStats,
  LogicalInterface,
  PhysicalInterface,
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
          ? linkLevelMatch[1]
          : "";

        var mtuMatch = line.match(/MTU: (\d+)/);
        currentPhysicalInterface.mtu = mtuMatch ? parseInt(mtuMatch[1], 10) : 0;

        var linkModeMatch = line.match(/Link-mode: (\w+)/);
        currentPhysicalInterface.duplex = linkModeMatch ? linkModeMatch[1] : "";

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
          currentPhysicalInterface.trafficStats.load.inBytes = bpsMatch
            ? parseInt(bpsMatch[1], 10)
            : 0;
        }
      } else if (
        RegExp("Output bytes").test(line) && currentSection == "traffic"
      ) {
        currentPhysicalInterface.trafficStats.counters.outBytes = parseInt(
          line.split(":")[1].trim(),
          10,
        );
        if (RegExp("bps").test(line)) {
          let bpsMatch = line.match(/(\d+) bps/);
          console.log(bpsMatch);
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
        if (RegExp("pps").test(line)) {
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
        if (RegExp("pps").test(line)) {
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
