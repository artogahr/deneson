// Read the contents of the file
const text = await Deno.readTextFile("src/input.txt");

// Print the content to the console
console.log('File Content:', text);
