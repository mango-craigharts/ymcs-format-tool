/* 
import lightLogo from './light-logo.png';
import { useState } from 'react';
import formatLogic from './logic.js';






function Header() {
  return (
    <>
      <h1 className="App-header">Ymcs Format Tool</h1>
    </>
  )
}

function FileSelectObject({ file, setFilePath }) {

  return (
    <>
      <p className="App-body">File path:
      <input
        className="Input"
        type="file"
        value={file}
        onChange={(e) => handleFileSelect(e.target.value)}
        
        placeholder="Paste file path here..."
      />
      </p>
    </>
  )
}

function FormatButton({ filePath, setDisplayText }) {
  const handleClick = () => {
    const result = formatLogic(filePath);
    setDisplayText(result);
  };

  return (
    <>
      <button onClick={handleClick} className="App-body">
      Format
      </button>
    </>
  )
}

function StatusText({displayText}) {
  return (
    <>
      <p className="App-body">{displayText}</p>
    </>
  )
}
function App() {
  const [displayText, setDisplayText] = useState("");
  const [filePath, setfilePath] = useState("");
  return (
    <>
      <MangoLogo />
      <Header />
      <FormatButton filePath={filePath} setDisplayText={setDisplayText}/>
      <StatusText displayText={displayText}/>
    </>
  );
}

export default App; */

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import './App.css';
import darkLogo from './dark-logo.png';

function MangoLogo() {
  return (
    <>
      <img 
          src={darkLogo}
          className="Logo" 
          alt="Mango Voice Logo" 
      />
    </>
  )
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFormat = () => {
    if (!selectedFile) {
      setStatus("Please upload a CSV first.");
      return;
    }
    setStatus("Processing...");

    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target.result;

      // Parse CSV into JSON rows
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      let data = result.data;

      // Drop unwanted columns
      const colsToRemove = ["BoxNo", "ShippedDate", "CustPONo", "PackageID", "TrackNo", "Item"];
      data = data.map((row) => {
        colsToRemove.forEach((col) => delete row[col]);
        return row;
      });

      // Format MAC & filter invalid rows
      const formatMAC = (mac) =>
        String(mac).toUpperCase().replace(/[:\-]/g, "");

      data = data.filter((row) => {
        return formatMAC(row.MAC).length === 12;
      });

      // Add empty row at top
      data.unshift({});

      // Convert JSON → Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Generate a filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .split(".")[0];
      const filename = `devices_${timestamp}.xlsx`;

      // Export the file in browser
      XLSX.writeFile(workbook, filename);

      setStatus("Success! File downloaded.");
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="App">
      <div className="Card">

        <MangoLogo />

        <h1>YMCS Format Tool</h1>

        <div className="FileInputWrapper">
          <label className="FileInputLabel">Upload CSV:</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="Input"
          />
        </div>

        <button onClick={handleFormat}>Format</button>

        <p className="Status">{status}</p>

      </div>
    </div>

  );
}

export default App;

