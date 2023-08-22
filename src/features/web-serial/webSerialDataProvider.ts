"use client";
import {useSyncExternalStore, useMemo} from 'react'
import {portsStore, openSttStore, rxLineNumStore} from './webSerialWorkerAdapter'
import { getPorts, createPort, updatePort, getPort, deletePort, getPage } from './webSerialWorkerAdapter';
import { openPort, sendPort, receievePort, closePort } from './webSerialWorkerAdapter';

// useSerialPorts
const getSerialPorts = () => portsStore.get()
const subscribeSerialPorts = (callback:()=>void) => {
    const unsubscribe = portsStore.subscribe(callback)
    return ()=>unsubscribe()
}
export const useSerialPorts = () => useSyncExternalStore(subscribeSerialPorts, getSerialPorts, ()=>[])

// useIsOpen
const getIsOpenBuilder = (id:string) => ()=>openSttStore[parseInt(id,10)].get()
const subscribeIsOpenBuilder = (id:string) => (callback:()=>void) => {
    const unsubscribe = openSttStore[parseInt(id,10)].subscribe(callback)
    return ()=>unsubscribe()
}
export const useIsOpen = (id:string) => useSyncExternalStore(subscribeIsOpenBuilder(id), getIsOpenBuilder(id), ()=>false)

// useRxBufferLen
const initRxBufferLen = {totalLines:0, updatedLines:0}
const getLineNumBuilder = (id:string) => ()=> {
    const store = rxLineNumStore[parseInt(id,10)]
    if (store !== undefined) {
        return store.get()
    } else {
        return initRxBufferLen
    }
}
const subscribeLineNumBuilder = (id:string) => (callback:()=>void) => {
    const store = rxLineNumStore[parseInt(id,10)]
    if (store !== undefined) {
        const unsubscribe = rxLineNumStore[parseInt(id,10)].subscribe(callback)
        return ()=>unsubscribe()
    } else {
        return ()=>{}
    }
}
export const useRxBufferLen = (id:string) => useSyncExternalStore(subscribeLineNumBuilder(id), getLineNumBuilder(id), ()=>({totalLines:0, updatedLines:0}))

export const useGetPorts   = ()=>useMemo(()=>getPorts,[])
export const useCreate     = ()=>useMemo(()=>createPort,[])
export const useUpdatePort = ()=>useMemo(()=>updatePort,[])
export const useGetPage    = ()=>useMemo(()=>getPage,[])
export const useGetPort    = (id:string)=>useMemo(()=>()=>getPort(id),[id])
export const useDelete     = (id:string)=>useMemo(()=>()=>deletePort(id),[id])
export const useOpen       = (id:string)=>useMemo(()=>(options:SerialOptions)=>openPort(id, options),[id])
export const useSend       = (id:string)=>useMemo(()=>(data:Uint8Array)=>sendPort(id, data),[id])
export const useReceieve = (id:string)=>useMemo(()=>(byteLength: number, timeoutMs: number)=>receievePort(id, byteLength, timeoutMs),[id])
export const useClose    = (id:string)=>useMemo(()=>()=>closePort(id),[id])