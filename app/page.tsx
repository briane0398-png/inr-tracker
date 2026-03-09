'use client'

import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

type Entry = {
  date: string
  inr: number
  dose: string
  notes: string
}

const STORAGE_KEY = "inr-tracker-data-v2"

export default function Page() {
  const [inr, setInr] = useState("")
  const [dose, setDose] = useState("")
  const [notes, setNotes] = useState("")
  const [targetMin, setTargetMin] = useState("2.0")
  const [targetMax, setTargetMax] = useState("3.0")
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setEntries(parsed.entries || [])
      setTargetMin(parsed.targetMin || "2.0")
      setTargetMax(parsed.targetMax || "3.0")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        entries,
        targetMin,
        targetMax
      })
    )
  }, [entries, targetMin, targetMax])

  const min = Number(targetMin)
  const max = Number(targetMax)

  function addEntry() {
    if (!inr) return

    const entry: Entry = {
      date: new Date().toLocaleDateString(),
      inr: Number(inr),
      dose: dose.trim(),
      notes: notes.trim()
    }

    setEntries([entry, ...entries])
    setInr("")
    setDose("")
    setNotes("")
  }

  function getStatus(value: number) {
    if (value < min) return "Low"
    if (value > max) return "High"
    return "In Range"
  }

  const latestEntry = entries[0]

  const chartData = useMemo(() => {
    return [...entries]
      .slice()
      .reverse()
      .map((entry, index) => ({
        name: `${index + 1}`,
        date: entry.date,
        inr: entry.inr
      }))
  }, [entries])

  function exportDoctorReport() {
    const reportLines = [
      "INR TRACKER REPORT",
      "",
      `Generated: ${new Date().toLocaleString()}`,
      `Target Range: ${targetMin} - ${targetMax}`,
      "",
      "Entries:",
      ...entries.map(
        (entry) =>
          `${entry.date} | INR ${entry.inr} | ${getStatus(entry.inr)} | Dose: ${entry.dose || "N/A"} | Notes: ${entry.notes || "None"}`
      )
    ]

    const reportText = reportLines.join("\n")
    const newWindow = window.open("", "_blank", "width=900,height=700")
    if (!newWindow) return

    newWindow.document.write(`
      <html>
        <head>
          <title>INR Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              line-height: 1.5;
              color: #111827;
            }
            h1 { margin-bottom: 8px; }
            .meta { margin-bottom: 24px; color: #4b5563; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: left;
              vertical-align: top;
            }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>INR Tracker Report</h1>
          <div class="meta">
            Generated: ${new Date().toLocaleString()}<br/>
            Target Range: ${targetMin} - ${targetMax}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>INR</th>
                <th>Status</th>
                <th>Warfarin Dose</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${entries
                .map(
                  (entry) => `
                    <tr>
                      <td>${entry.date}</td>
                      <td>${entry.inr}</td>
                      <td>${getStatus(entry.inr)}</td>
                      <td>${entry.dose || "N/A"}</td>
                      <td>${entry.notes || ""}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    newWindow.document.close()

    console.log(reportText)
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial, sans-serif",
        maxWidth: 1100,
        margin: "0 auto"
      }}
    >
      <h1 style={{ marginBottom: 8 }}>INR Tracker</h1>
      <p style={{ color: "#4b5563", marginTop: 0 }}>
        Track INR values, target range alerts, warfarin dose changes, and appointment reports.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 20,
          marginBottom: 24
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Latest INR</div>
          <div style={bigNumberStyle}>
            {latestEntry ? latestEntry.inr : "--"}
          </div>
          <div style={subtleStyle}>
            {latestEntry ? `${getStatus(latestEntry.inr)} on ${latestEntry.date}` : "No readings yet"}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Target Range</div>
          <div style={bigNumberStyle}>
            {targetMin} - {targetMax}
          </div>
          <div style={subtleStyle}>Editable below</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Latest Dose</div>
          <div style={bigNumberStyle}>
            {latestEntry?.dose || "--"}
          </div>
          <div style={subtleStyle}>Warfarin dose tracking</div>
        </div>
      </div>

      {latestEntry && (
        <div
          style={{
            ...cardStyle,
            marginBottom: 24,
            background:
              latestEntry.inr < min
                ? "#dbeafe"
                : latestEntry.inr > max
                ? "#fee2e2"
                : "#dcfce7",
            borderColor:
              latestEntry.inr < min
                ? "#93c5fd"
                : latestEntry.inr > max
                ? "#fca5a5"
                : "#86efac"
          }}
        >
          <strong>Alert:</strong>{" "}
          {latestEntry.inr < min &&
            `Your latest INR (${latestEntry.inr}) is below your target range.`}
          {latestEntry.inr > max &&
            `Your latest INR (${latestEntry.inr}) is above your target range.`}
          {latestEntry.inr >= min &&
            latestEntry.inr <= max &&
            `Your latest INR (${latestEntry.inr}) is within your target range.`}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Add Entry</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          <div>
            <label style={labelStyle}>INR</label>
            <input
              value={inr}
              onChange={(e) => setInr(e.target.value)}
              placeholder="2.4"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Warfarin Dose</label>
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="5 mg"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Min</label>
            <input
              value={targetMin}
              onChange={(e) => setTargetMin(e.target.value)}
              placeholder="2.0"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Max</label>
            <input
              value={targetMax}
              onChange={(e) => setTargetMax(e.target.value)}
              placeholder="3.0"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Missed dose, diet change, illness, medication change..."
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button onClick={addEntry} style={primaryButtonStyle}>
            Add Entry
          </button>
          <button onClick={exportDoctorReport} style={secondaryButtonStyle}>
            Export Doctor Report
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>INR Graph</h2>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <ReferenceLine y={min} stroke="orange" strokeDasharray="5 5" />
              <ReferenceLine y={max} stroke="red" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="inr" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>History</h2>

        {entries.length === 0 ? (
          <p style={subtleStyle}>No entries yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thTdStyle}>Date</th>
                  <th style={thTdStyle}>INR</th>
                  <th style={thTdStyle}>Status</th>
                  <th style={thTdStyle}>Warfarin Dose</th>
                  <th style={thTdStyle}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td style={thTdStyle}>{entry.date}</td>
                    <td style={thTdStyle}>{entry.inr}</td>
                    <td style={thTdStyle}>{getStatus(entry.inr)}</td>
                    <td style={thTdStyle}>{entry.dose || "--"}</td>
                    <td style={thTdStyle}>{entry.notes || "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: 16,
  background: "white"
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  boxSizing: "border-box"
}

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#374151"
}

const subtleStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 14
}

const bigNumberStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginTop: 8,
  marginBottom: 8
}

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#111827",
  cursor: "pointer"
}

const thTdStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  padding: 10,
  textAlign: "left"
}
