"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

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

  async function loadEntries() {
    const { data } = await supabase
      .from("inr_entries")
      .select("*")
      .order("date", { ascending: false })

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

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>INR Tracker</h1>

      <h2>Add Entry</h2>

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
        placeholder="Dose"
        value={dose}
        onChange={(e) => setDose(e.target.value)}
      />

      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button onClick={addEntry}>Add</button>

      <h2>History</h2>

      {entries.map((entry) => (
        <div key={entry.id} style={{ marginBottom: 10 }}>
          {entry.date} — INR {entry.inr} — Dose {entry.dose}
          <button onClick={() => deleteEntry(entry.id)}>Delete</button>
        </div>
      ))}
    </main>
  )
}
