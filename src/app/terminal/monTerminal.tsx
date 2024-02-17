import { useEffect } from 'react'
import { Terminal } from 'xterm'
import { usePortInfos } from '@/features/ws-serial/PortInfosProvider';

export const MonTerminal = (props: {
    term: Terminal | null,
}) => {
    const {
        term,
    } = props

    const ports = usePortInfos()

    useEffect(() => {
        console.log(`term =  ${term}`)
        if (term && ports.sys_ctrl.monCreHandler){
            console.log("Func init")
            ports.sys_ctrl.monCreHandler.subscribeEvt((evt:string)=>{
                term.writeln(evt)
            })
        }
    }, [term, ports])
    
    return (null)
}
