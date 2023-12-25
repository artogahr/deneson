// Specify the path to your text file
const filePath = 'src/input.txt';

// Read the contents of the file
const text = await Deno.readTextFile(filePath);
interface InterfaceData {
  name: string;
  data: string;
}
let currentPhysicalInterface = null;
const parsedData: {physicalInterfaces: InterfaceData[]} = {
    physicalInterfaces: []
  };

const sections = text.split('\n\n');

sections.forEach(section => {
  console.log(section);
  const lines = section.split('\n');
  const interfaceName = lines[0].split(' ')[0];
  const interfaceData = lines.slice(1).join('\n');
  parsedData.physicalInterfaces.push({ name: interfaceName, data: interfaceData });
})

console.log(parsedData);