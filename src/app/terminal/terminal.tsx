import React, { useEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

interface Props {
  id_str: string
  setTerm:React.Dispatch<React.SetStateAction<Terminal | null>>
  storedTerm:Terminal | null
  rows?: number
  cols?: number
}

export const TerminalComponent: React.FC<Props> = ({
  id_str,
  cols = 80,
  rows = 24,
  storedTerm,
  setTerm
}) => {

  const setup = () => {
    const term = new Terminal({ cursorBlink: true, cols, rows })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(document.getElementById(id_str)!)
    fitAddon.fit()
    term.focus()
    setTerm(term)
    console.log("setTerm()")
  }

  const disposeTerminal = () => {
    if (storedTerm) {
      storedTerm.dispose()
      console.log("disposed")
    } else {
      console.log("try to dispose but empty")
    }
    setTerm(null)
  }


  useEffect(() => {
    console.log(`start ${this}`)
    setup()
    return ()=>{
        disposeTerminal()        
        console.log(`end ${this}`)
    }
  }, [])

  return <div id={id_str} />
}
