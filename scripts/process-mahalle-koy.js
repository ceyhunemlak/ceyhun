const fs = require('fs');
const path = require('path');

// Read the file content
const filePath = path.join(__dirname, '..', 'tokatmahallekoy.txt');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Split by lines
const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

// Process the data
const districts = {};
let currentDistrict = '';
let section = 'mahalle'; // Default section is mahalle

// Normalize district names
const normalizeDistrictName = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '');
};

lines.forEach(line => {
  // Check if this is a district line (ends with :)
  if (line.endsWith(':')) {
    currentDistrict = normalizeDistrictName(line.slice(0, -1));
    districts[currentDistrict] = { mahalle: [], koy: [] };
    section = 'mahalle'; // Reset to mahalle section for new district
    return;
  }
  
  // Check if this is the "Köyler" line
  if (line === 'Köyler') {
    section = 'koy';
    return;
  }
  
  // Process mahalle or köy line
  if (currentDistrict && line) {
    const name = line.replace(' MAHALLESİ', '').replace(' KÖYÜ', '');
    
    // Convert to proper case (first letter uppercase, rest lowercase)
    const properName = name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Generate a URL-friendly value
    let value = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Determine if it's a mahalle or köy based on the line content and current section
    let category = 'mahalle';
    if (line.includes(' KÖYÜ') || section === 'koy') {
      category = 'koy';
      value = `${value}-koy`;
    }
    
    // Check if this value already exists in the current district and category
    const existingValues = districts[currentDistrict][category].map(item => item.value);
    
    // Only add if it doesn't already exist in this district and category
    if (!existingValues.includes(value)) {
      districts[currentDistrict][category].push({ value, label: properName });
    }
  }
});

// Generate the output
const output = `// Neighborhoods by district - updated with real data and separated into mahalle and köy sections
const neighborhoodsByDistrict = ${JSON.stringify(districts, null, 2)};

export default neighborhoodsByDistrict;`;

// Write to file
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'neighborhoods.ts');
fs.writeFileSync(outputPath, output);

console.log(`Processed ${Object.keys(districts).length} districts with mahalle and köy data`);
console.log(`Output written to ${outputPath}`); 