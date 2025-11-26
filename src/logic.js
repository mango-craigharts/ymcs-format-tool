// Install required packages first:
// npm install readline-sync papaparse xlsx fs path os

const fs = require('fs');
const path = require('path');
const os = require('os');
const Papa = require('papaparse');
const XLSX = require('xlsx');

// Clear the console screen
function clearScreen() {
  process.stdout.write('\x1Bc'); // works in most terminals
}

// Get Documents folder
function getDocumentsPath() {
  const home = os.homedir();
  return path.join(home, 'Documents');
}

// Format MAC address
function formatMAC(mac) {
  return String(mac).toUpperCase().replace(/[:-]/g, '');
}

// Main function
function main(filePath) {
  clearScreen();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .split('.')[0]; // YYYYMMDD_HHMMSS format
  const exportPath = getDocumentsPath();
  const fileName = `devices_${timestamp}.xlsx`;
  const fullPath = path.join(exportPath, fileName);

  let csvData;
  while (true) {
    try {
      const csvPath = filePath;

      if (!fs.existsSync(csvPath)) {
        return 'File not found';
      }

      const fileContent = fs.readFileSync(csvPath, 'utf8');
      csvData = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      }).data;

      break; // success
    } catch (err) {
      clearScreen();
      return 'Invalid File Path. Right click the file, select "Copy As Path", and paste.\nError: $(err.message)';
    }
  }

  // Drop unwanted columns
  const columnsToDrop = ['BoxNo', 'ShippedDate', 'CustPONo', 'PackageID', 'TrackNo', 'Item'];
  csvData = csvData.map(row => {
    columnsToDrop.forEach(col => delete row[col]);
    return row;
  });

  // Filter rows with invalid MAC addresses
  csvData = csvData.filter(row => formatMAC(row.MAC).length === 12);

  // Add an empty first row
  csvData.unshift({});

  // Convert to worksheet and export to Excel
  const ws = XLSX.utils.json_to_sheet(csvData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, fullPath);

  return `File saved to: ${fullPath}`;
}

export default main;
