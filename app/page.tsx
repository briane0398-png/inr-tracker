"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Entry = {
  id: string
  date: string
  inr: number
  dose: string
  notes: string
}

export default function Page() {

  const [entries, setEntries] = useState<Entry[]>([])

  const [date, setDate] = useState("")
  const [inr, setInr] = useState("")
  const [dose, setDose] = useState("")
  const [notes, setNotes] = useState("")

  const [targetMin, setTargetMin] = useState(2.0)
  const [targetMax, setTargetMax] = useState(3.0)

  async function loadEntries() {

    const { data } = await supabase
      .from("inr_entries")
      .select("*")
      .order("date", { ascending: true })

    if (data) setEntries(data)
  }

  useEffect(() => {
    loadEntries()
  }, [])

  async function addEntry() {

    if (!date || !inr) return

    await supabase.from("inr_entries").insert({
      date,
      inr: Number(inr),
      dose,
      notes
    })

    setDate("")
    setInr("")
    setDose("")
    setNotes("")

    loadEntries()
  }

  async function deleteEntry(id: string) {
    await supabase.from("inr_entries").delete().eq("id", id)
    loadEntries()
  }

  const latest = entries[entries.length - 1]

  function exportReport() {

    const rows = entries
      .map(
        (e) =>
          `${e.date} | INR ${e.inr} | Dose ${e.dose || "-"} | ${e.notes || ""}`
      )
      .join("\n")

    const text = `INR REPORT\n\nTarget Range: ${targetMin} - ${targetMax}\n\n${rows}`

    const blob = new Blob([text], { type: "text/plain" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "INR_Report.txt"
    link.click()
  }

  return (

    <main style={{ padding: 30, fontFamily: "Arial", maxWidth: 900 }}>

      <h1>INR Tracker</h1>

      <p>
        Track INR values, warfarin dose changes, and trends over time.
      </p>

      {latest && (latest.inr < targetMin || latest.inr > targetMax) && (
        <div
          style={{
            background: "#ffe5e5",
            padding: 10,
            marginBottom: 20,
            borderRadius: 6
          }}
        >
          ⚠️ Alert: Your latest INR ({latest.inr}) is outside your target range.
        </div>
      )}

      <h2>Add Entry</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          placeholder="INR"
          value={inr}
          onChange={(e) => setInr(e.target.value)}
        />

        <input
          placeholder="Warfarin Dose"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
        />

      </div>

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ marginTop: 10, width: "100%" }}
      />

      <div style={{ marginTop: 10 }}>

        <button onClick={addEntry}>Add Entry</button>

        <button
          onClick={exportReport}
          style={{ marginLeft: 10 }}
        >
          Export Doctor Report
        </button>

      </div>

      <h2 style={{ marginTop: 40 }}>INR Graph</h2>

      <div style={{ width: "100%", height: 300 }}>

        <ResponsiveContainer>

          <LineChart data={entries}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <ReferenceLine
              y={targetMin}
              stroke="orange"
              strokeDasharray="4"
            />

            <ReferenceLine
              y={targetMax}
              stroke="red"
              strokeDasharray="4"
            />

            <Line
              type="monotone"
              dataKey="inr"
              stroke="#2563eb"
              strokeWidth={2}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <h2 style={{ marginTop: 40 }}>History</h2>

      {entries
        .slice()
        .reverse()
        .map((entry) => (

          <div
            key={entry.id}
            style={{
              padding: 10,
              borderBottom: "1px solid #ddd"
            }}
          >

            <strong>{entry.date}</strong> — INR {entry.inr}

            {entry.dose && <> — Dose {entry.dose}</>}

            {entry.notes && <> — {entry.notes}</>}

            <button
              onClick={() => deleteEntry(entry.id)}
              style={{ marginLeft: 10 }}
            >
              Delete
            </button>

          </div>

        ))}

    </main>
  )
}
