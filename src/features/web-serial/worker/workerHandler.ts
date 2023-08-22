import {webSerialPortType, fetchSerialObject} from '../webSerialWorkerAdapter'
import webSerialPorts from './webSerialPorts';
import { MicroStore } from './webSerialPorts';

interface rxLineBuffType {
    ts:number,
    data:string
}

export interface rxLineBuffRspType {
    data:rxLineBuffType[];
    total:number;
    pageInfo?:{hasPreviousPage:boolean, hasNextPage:boolean}
}

export interface rxLineNumType {
    totalLines:number;
    updatedLines:number
}

export interface responseType {
    status:number;
    error?:string;
    data?:webSerialPortType | webSerialPortType[] | string | rxLineBuffRspType | null;
    rspId:number
}

export interface notificationArgType {
    msg:string;
    ports?:webSerialPortType[];
    maxId?:number;
    stt?:boolean;
    portId?:number;
    rxLineNum?:rxLineNumType;
    result?:string;
}
export interface notificationType extends notificationArgType{
    notId:number;
}

const toWebSerialType = (port:any):webSerialPortType => {
    return {
        idStr:port?.idStr,
        venderName:port?.venderName,
        pid:port?.pid,
        vid:port?.vid,
        isOpen:port?.isOpen,
        signals:port?.signals,
        errorStr:port?.errorStr
    }
}

const rxLineBuffers:MicroStore<rxLineBuffType[]>[] = []
export const getRxLineBuffers = (id:number, page:number,perPage:number):rxLineBuffRspType => {
    if (id < rxLineBuffers.length) {
        const buff = rxLineBuffers[id].get()
        const len = buff.length
        const startIndex = Math.min(page * perPage, len)
        const endIndex = Math.min((page + 1) * perPage, len)
        const pageInfo = {
            hasPreviousPage: 0 < startIndex,
            hasNextPage: endIndex < len
        }        
        return { data:buff.slice(startIndex, endIndex), total:buff.length, pageInfo}
    } else {
        return { data:[], total:0}
    }
}

let notifyId = 0
const sendNotify = (sendObj:notificationArgType) => {
    self.postMessage(JSON.stringify({...sendObj, notId:notifyId}));
    notifyId += 1
}

const rxLineNum:rxLineNumType[] = []
const onPortsChange = ()=>{
    sendNotify({
        msg:"PortsChanged",
        ports:webSerialPorts.getPorts().map((port)=>toWebSerialType(port)),
        maxId:webSerialPorts.getMaxId()
    })

    console.log("AddPortsId :: ", rxLineBuffers.length, " to ", webSerialPorts.getMaxId())
    for (let portId = rxLineBuffers.length; portId < webSerialPorts.getMaxId(); portId++) {
        const port = webSerialPorts.getPortById(portId)
        port.subscribeIsOpen(()=>{
            sendNotify({msg:"IsOpen", stt:port.isOpen, portId})
        })
        rxLineBuffers[portId] = new MicroStore([])
        rxLineBuffers[portId].subscribe(()=>{
            sendNotify({msg:"DataRx", rxLineNum:rxLineNum[portId], portId})
        })
        rxLineNum[portId] = {totalLines:0, updatedLines:0}
        port.subscribeRx(()=>{
            const ts:number = (new Date()).getTime()
            const rxLines = port.rx
            const idBase = rxLineBuffers[portId].get().length
            const addLines = rxLines.map((data, idx)=>({data, ts, id:idx+idBase}))
//            console.log(portId, ts, rxLines.length, addLines)
            const newRxLines = rxLineBuffers[portId].get().concat(addLines)
            rxLineNum[portId] = {totalLines:newRxLines.length, updatedLines:rxLines.length}
//            console.log(ts, rxLines.length, newRxLines)
            rxLineBuffers[portId].update(newRxLines)
        })
    }
}

 /*
- /ports
    - GET:webSerialPorts.getPorts()
    - PATCH:webSerialPorts.onCreate({})
- /ports/id
    - GET:webSerialPorts.getPortById(id)
    - DELETE:webSerialPorts.getPortById(id).forget()
- /ports/id/open
    - POST:webSerialPorts.getPortById(id).open(option)
- /ports/id/close
    - POST:webSerialPorts.getPortById(id).close()
- /ports/id/data
    - POST:webSerialPorts.getPortById(id).send()
- /ports/id/rxdata
    - GET:getRxLineBUffers()
    - POST:webSerialPorts.getPortById(id).receive(length, timeoutMs)
*/
// (from: https://gist.github.com/borismus/1032746#gistcomment-1493026)
const base64ToUint8Array = (base64Str: string): Uint8Array => {
    const raw = atob(base64Str);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
};

const handlerImplements = (path:string, method:string, headers:any, body:any) =>{
    const upperMethod = method.toUpperCase()
    let rsp = {} as responseType
    if (path.startsWith("/ports")){
        if (path === "/ports") {
            if (upperMethod === "GET"){
                rsp.status = 200
                rsp.data = webSerialPorts.getPorts().map((port)=>toWebSerialType(port))
            } else if (upperMethod === "PATCH"){
                return webSerialPorts.onCreate()
                .then((res)=>{
                    rsp.status = 200
                    rsp.data = toWebSerialType(res)
                    console.log(path, method, body, rsp)
                    return rsp
                })
                .catch((e)=>{
                    rsp.status = 400
                    rsp.error = e.toString()
                    console.log(path, method, body, rsp)
                    return rsp
                })
            } else {
                rsp.status = 400
                rsp.error = "Unsupported Method"
            }
        } else if (path.endsWith("/open")) {
            const idStr = path.split('/')[2]
            if (parseInt(idStr, 10) < webSerialPorts.getMaxId()){
                if (upperMethod === "POST"){
                    return webSerialPorts.getPortById(idStr).open(body.options)
                    .then((result:string)=>{
                        if (0 == result.length) {
                            rsp.status = 200
                            rsp.data = "OK"
                        } else {
                            rsp.status = 400
                            rsp.error = result
                        }
                        console.log(path, method, body, rsp)
                        return rsp
                    })
                } else {
                    rsp.status = 400
                    rsp.error = "Unsupported Method"
                }
            } else {
                rsp.status = 400
                rsp.error = "Id Not Found"
            }
        } else if (path.endsWith("/close")) {
            const idStr = path.split('/')[2]
            if (parseInt(idStr, 10) < webSerialPorts.getMaxId()){
                if (upperMethod === "POST"){
                    return webSerialPorts.getPortById(idStr).close()
                    .then((result:string)=>{
                        if (0 == result.length) {
                            rsp.status = 200
                            rsp.data = "OK"
                        } else {
                            rsp.status = 400
                            rsp.error = result
                        }
                        console.log(path, method, body, rsp)
                        return rsp
                    })
                } else {
                    rsp.status = 400
                    rsp.error = "Unsupported Method"
                }
            } else {
                rsp.status = 400
                rsp.error = "Id Not Found"
            }
        } else if (path.endsWith("/data")) {
            const idStr = path.split('/')[2]
            if (parseInt(idStr, 10) < webSerialPorts.getMaxId()){
                if (upperMethod === "POST"){
                    return webSerialPorts.getPortById(idStr).send(base64ToUint8Array(body.data))
                    .then((result:string)=>{
                        if (0 == result.length) {
                            rsp.status = 200
                            rsp.data = "OK"
                        } else {
                            rsp.status = 400
                            rsp.error = result
                        }
                        console.log(path, method, body, rsp)
                        return rsp
                    })
                } else {
                    rsp.status = 400
                    rsp.error = "Unsupported Method"
                }
            } else {
                rsp.status = 400
                rsp.error = "Id Not Found"
            }
        } else if (/^\/ports\/\d+\/rxdata/.test(path)) {
            const idStr = path.split('/')[2]
            if (parseInt(idStr, 10) < webSerialPorts.getMaxId()){
                if (upperMethod === "GET"){
                    const {id, page, perPage} = body
                    rsp.status = 200
                    rsp.data = getRxLineBuffers(id, page, perPage)
                } else if (upperMethod === "POST"){
                    if (body.byteLength === 0 && body.timeoutMs === 0) {
                        webSerialPorts.getPortById(idStr).receive(body.byteLength, body.timeoutMs)
                        .then((result:string)=>{
                            sendNotify({msg:"Stop Rx", result})
                        })
                        rsp.status = 200
                        rsp.data = "Start Rx"
                    } else {
                        return webSerialPorts.getPortById(idStr).receive(body.byteLength, body.timeoutMs)
                        .then((result:string)=>{
                            if (0 == result.length) {
                                rsp.status = 200
                                rsp.data = "OK"
                            } else {
                                rsp.status = 400
                                rsp.error = result
                            }
                            console.log(path, method, body, rsp)
                            return rsp
                        })
                    }
                } else {
                    rsp.status = 400
                    rsp.error = "Unsupported Method"
                }
            } else {
                rsp.status = 400
                rsp.error = "Id Not Found"
            }
        } else if (/^\/ports\/\d+/.test(path)) {
            const idStr = path.split('/')[2]
            if (parseInt(idStr, 10) < webSerialPorts.getMaxId()){
                if (upperMethod === "GET"){
                    rsp.status = 200
                    rsp.data = toWebSerialType(webSerialPorts.getPortById(idStr))
                } else if (upperMethod === "DELETE"){
                    rsp.status = 200
                    webSerialPorts.getPortById(idStr).forget()
                    rsp.data = "OK"          
                } else {
                    rsp.status = 400
                    rsp.error = "Unsupported Method"
                }
            } else {
                rsp.status = 400
                rsp.error = "Id Not Found"
            }
        } else {
            rsp.status = 400
            rsp.error = "Unsupported URL"
        }
    } else {
        rsp.status = 400
        rsp.error = "Unsupported URL"
    }
    console.log(path, method, body, rsp)
    return Promise.resolve(rsp)
}

const workerHandler = ()=>{
    self.onmessage = (e: MessageEvent<string>) => {
        const {reqId, path, method, headers, body} = JSON.parse(e.data) as fetchSerialObject
        handlerImplements(path, method, headers, body)
        .then((response:responseType)=>{
            self.postMessage(JSON.stringify({...response, rspId:reqId}));
        })
    }
    webSerialPorts.subscribe(onPortsChange)
}

export default workerHandler