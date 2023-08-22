import { responseType, rxLineNumType, notificationType, rxLineBuffRspType } from './worker/workerHandler'

interface fetchSerialOption {
    method:string;
    headers?:object;
    body?:object;
}

export interface fetchSerialObject extends fetchSerialOption{
    path:string;
    reqId:number;
}

export interface webSerialPortType {
    idStr: string;
    venderName: string;
    pid: number;
    vid: number;
    isOpen: boolean;
    signals: object;
    errorStr: string;
}

interface resolver {
    resolve:(value:responseType)=>void;
    reject:(reasone:responseType)=>void;
}

class MicroStore <T> {
    private obj: T;
    private callbacks: Set<() => void>;
  
    constructor(initObj: T){
      this.obj = initObj
      this.callbacks = new Set<() => void>();
    }
    subscribe(cb: () => void): () => boolean {
      this.callbacks.add(cb);
      return () => this.callbacks.delete(cb);
    }
    update(newObj: T){
      this.obj = newObj
      this.callbacks.forEach(cb => cb())
    }
    get(): T{
      return this.obj
    }
}

export const portsStore:MicroStore<webSerialPortType[]> = new MicroStore([])
export const openSttStore:MicroStore<boolean>[] = []
export const rxLineNumStore:MicroStore<rxLineNumType>[] = []

const resolverMap:Map<number, resolver> = new Map()

const onMessageFromWorker = (e: MessageEvent<string>) => {
    const parsedMessage = JSON.parse(e.data)
    if ('rspId' in parsedMessage) {
        // if use fetchSerial(), fetchSerialCaller may wait for resolve Promise.
        const response:responseType = parsedMessage
        if (resolverMap.has(response.rspId)) {
            const {resolve, reject} = resolverMap.get(response.rspId) ?? {resolve:()=>{}, reject:()=>{}}
            resolverMap.delete(response.rspId)
            if ('error' in response) {
                reject(response)
            } else if ('data' in response) {
                resolve(response)
            } else {
                reject(response)
            }
        }
    } else if ('notId' in parsedMessage) {
        // notification:worker side triggerd information
//        console.log("Notification", response)
        const notification:notificationType = parsedMessage
        if ('msg' in notification) {
            if (notification.msg === "PortsChanged") {
                if ('ports' in notification && notification.ports !== undefined) {
                    portsStore.update(notification.ports)
                    if ('maxId' in notification && notification.maxId !== undefined) {
                        const len = notification.maxId
                        if (openSttStore.length < len) {
                            for(let portId = openSttStore.length; portId < len; portId++) {
                                const port = notification.ports.find((ele:webSerialPortType)=>parseInt(ele.idStr, 10) === portId)
                                openSttStore[portId] = new MicroStore(port?.isOpen ?? false)
                                rxLineNumStore[portId] = new MicroStore({"totalLines": 0,"updatedLines": 0})
                            }
                        }
                    } else {
                        console.error(".maxId dosen't exist")
                    }
                } else {
                    console.error(".ports dosen't exist")
                }
            } else if (notification.msg === "IsOpen") {
                if ('portId' in notification && notification.portId !== undefined) {
                    const portId = notification.portId
                    if ('stt' in notification && notification.stt !== undefined) {
                        openSttStore[portId].update(notification.stt)
                    } else {
                        console.error(".stt dosen't exist")
                    }
                } else {
                    console.error(".portId dosen't exist")
                }
            } else if (notification.msg === "DataRx") {
                if ('portId' in notification && notification.portId !== undefined) {
                    const portId = notification.portId
                    if ('rxLineNum' in notification && notification.rxLineNum !== undefined) {
                        rxLineNumStore[portId].update(notification.rxLineNum)
                    } else {
                        console.error(".rxLineNum dosen't exist")
                    }
                } else {
                    console.error(".portId dosen't exist")
                }
            }
        }
    }
};

// start worker, set onMessage handler from worker
const webSerialWorker = (() => {
    let worker = null
    if (typeof window !== 'undefined') {
        worker = new Worker(new URL("./worker/webSerialWorker.ts", import.meta.url))
        worker.onmessage = onMessageFromWorker
    }
    return worker
})()

// post message to worker
let fetechSerialId:number = 0
export const fetchSerial = (resource:string, option:fetchSerialOption):Promise<responseType>=>{
    return new Promise((resolve, reject)=>{
        resolverMap.set(fetechSerialId, {resolve, reject})
        webSerialWorker?.postMessage(JSON.stringify({...option, path:resource, reqId:fetechSerialId}));
        fetechSerialId += 1
    })
}

/*
- /ports
    - GET:useGetPorts
    - PATCH:useCreate
- /ports/id
    - GET:useGetPort
    - DELETE:useDelete
- /ports/id/open
    - POST:useOpen
- /ports/id/close
    - POST:useClose
- /ports/id/data
    - POST:useSend
- /ports/id/rxdata
    - GET:getRxLineBUffers()
    - POST:useReceive
*/

export const getPorts = ():Promise<webSerialPortType[]> => {
    return fetchSerial("/ports", {method:'GET'})
    .then((rsp:responseType)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else if ('data' in rsp) {
            return rsp.data as webSerialPortType[]
        } else {
            return Promise.reject("Both 'error' and 'data' field not exist in response")
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const updatePort = ():Promise<webSerialPortType> => {
    return fetchSerial("/ports", {method:'PATCH'})
    .then((rsp:responseType)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else if ('data' in rsp) {
            return rsp.data as webSerialPortType
        } else {
            return Promise.reject("Both 'error' and 'data' field not exist in response")
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const createPort = (options?: SerialPortRequestOptions | undefined): Promise<webSerialPortType> => {
    if (typeof window !== 'undefined' && "serial" in navigator) { 
        return navigator.serial.requestPort(options)
        .then((_)=> {
            return updatePort()
        })
    } else {
        return Promise.reject("Not browser")
    }
}

export const getPort = (id:string): Promise<webSerialPortType> => {
    return fetchSerial("/ports/"+id, {method:'GET'})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else if ('data' in rsp) {
            return rsp.data as webSerialPortType
        } else {
            return Promise.reject("Both 'error' and 'data' field not exist in response")
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const openPort = (id:string, options: SerialOptions): Promise<string> => {
    return fetchSerial("/ports/"+id+"/open", {method:'POST', body:{options}})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return ""
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

const base64EncodeUint8Array = (data: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
};
export const sendPort = (id:string, data:Uint8Array):Promise<string> => {
    return fetchSerial("/ports/"+id+"/data", {method:'POST', body:{data:base64EncodeUint8Array(data)}})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return ""
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const receievePort = (id:string, byteLength: number, timeoutMs: number, newLineCode?: string | RegExp): Promise<string> => {
    return fetchSerial("/ports/"+id+"/rxdata", {method:'POST', body:{byteLength, timeoutMs, newLineCode}})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return ""
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const getPage = (id:string, page:number, perPage:number):Promise<rxLineBuffRspType> => {
    const body = {id, page, perPage}
    return fetchSerial("/ports/"+id + "/rxdata", {method:'GET', body})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return rsp.data as rxLineBuffRspType
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const closePort = (id:string) => {
    return fetchSerial("/ports/"+id+"/close", {method:'POST'})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return ""
        }
    })
    .catch((e)=>(Promise.reject(e)))
}

export const deletePort = (id:string): Promise<string> => {
    return fetchSerial("/ports/"+id, {method:'DELETE'})
    .then((rsp)=>{
        if ('error' in rsp) {
            return Promise.reject(rsp.error as string)
        } else {
            return ""
        }
    })
    .catch((e)=>(Promise.reject(e)))
}
