'use client'

import { useState, useEffect } from "react"

export default function Page() {
  const [inr,setInr] = useState("")
  const [entries,setEntries] = useState([])

  useEffect(()=>{
    const saved = localStorage.getItem("inr")
    if(saved) setEntries(JSON.parse(saved))
  },[])

  useEffect(()=>{
    localStorage.setItem("inr",JSON.stringify(entries))
  },[entries])

  function add(){
    if(!inr) return

    const entry = {
      date:new Date().toLocaleDateString(),
      value:inr
    }

    setEntries([entry,...entries])
    setInr("")
  }

  return(
    <div style={{padding:40,fontFamily:"Arial"}}>
      <h1>INR Tracker</h1>

      <input
        value={inr}
        onChange={e=>setInr(e.target.value)}
        placeholder="INR value"
      />

      <button onClick={add}>Add</button>

      <h2>History</h2>

      <ul>
        {entries.map((e,i)=>(
          <li key={i}>
            {e.date} — INR {e.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
