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

function CsvFormatTool() {

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
    <>
      <h1>CSV Format Tool</h1>

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
    </>
  )
}

function InfoPairToXLSX() {
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState([
    { mac: "", serial: "" }
  ]);

  const handleAddRow = () => {
    setRows(prev => [...prev, { mac: "", serial: "" }]);
  };

  const handleRemoveRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (index, field, value) => {
    setRows(prev =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  const handleFormat = () => {
    if (rows[0].mac === "" || rows[0].serial === "") {
      setStatus("Please add at least one entry.")
      return;
    }
    setStatus("Processing...");

    const rowsWithEmpty = [{ MAC: "", Serial: "" }, ...rows.map(r => ({ MAC: r.mac, Serial: r.serial }))];

    const worksheet = XLSX.utils.json_to_sheet(rowsWithEmpty);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MAC_Serial");

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .split(".")[0];
    
      const filename = `ymcs_import_${timestamp}.xlsx`
    
    XLSX.writeFile(workbook, filename);
  }

  return (
    <>
      <h1>MAC & Serial Input</h1>
      {rows.map((row, index) => (
        <div className="row" key={index}>
            <span className="row-number">{index + 1}</span>

            <input
              type="text"
              placeholder="MAC"
              value={row.mac}
              onChange={e =>
                handleChange(index, "mac", e.target.value)
              }
              className="row-input"
            />

            <input
              type="text"
              placeholder="Serial Number"
              value={row.serial}
              onChange={e =>
                handleChange(index, "serial", e.target.value)
              }
              className="row-input"
            />
          
        </div>

      ))}

      <div className="button-row">
        <button onClick={handleAddRow} className="add-button">Add Row</button>
        <button onClick={() => handleRemoveRow(rows.length - 1)} className="remove-button">Remove Row</button>
      </div>
      <button onClick={handleFormat} className="export-button">Export</button>
      <p className="Status">{status}</p>
    </>
  );
}

function App() {
  
  const [activeTab, setActiveTab] = useState("csv");

  return (
    <div className="App">
      <div className="Card">

        <MangoLogo />

        {/* Tabs */}
        <div className="Tabs">
          <button
            className={activeTab === "csv" ? "Tab active" : "Tab"}
            onClick={() => setActiveTab("csv")}
          >
            CSV Formatter
          </button>

          <button
            className={activeTab === "pair-input" ? "Tab active" : "Tab"}
            onClick={() => setActiveTab("pair-input")}
          >
            MAC and Serial Input
          </button>
        </div>

        {/* Tool Render */}
        {activeTab === "csv" && <CsvFormatTool />}
        {activeTab === "pair-input" && <InfoPairToXLSX />}

      </div>
    </div>

  );
}

export default App;

