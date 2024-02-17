"use client";
import { useState, useEffect } from 'react'
import './terminal.css'
import dynamic from 'next/dynamic'
import { Terminal } from 'xterm'
import { MonTerminal } from './monTerminal'

const TerminalComp = dynamic(
  () => import('./terminal').then((mod) => mod.TerminalComponent),
  {
    ssr: false,
    loading: () => <p>Loading...</p>    
  }
)

export default function RootPage() {
  const [term, setTerm] = useState<Terminal| null>(null)

  return (
    <div>
      <MonTerminal
        term = {term}
      ></MonTerminal>
      <TerminalComp
        id_str="terminal"
        storedTerm = {term}
        setTerm = {setTerm}
      ></TerminalComp>
    </div>
  )
}

