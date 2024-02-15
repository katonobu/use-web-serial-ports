import axios, {AxiosResponse} from 'axios';
import {io, Socket} from 'socket.io-client';
import {CreHandler} from '@/features/ws-serial/creHandler'

interface wsFt4232eachParam {
    suffix:string
}
interface wsFt4232initParam {
    sys_ctrl:wsFt4232eachParam;
    port_ctrl:wsFt4232eachParam;
    gnss_mon:wsFt4232eachParam;
}

export type portControlerType = {
    setRts?: (stt:boolean)=>Promise<boolean>;
    setDtr?: (stt:boolean)=>Promise<boolean>;
}

export type portInfoType = {
    device:string;
    name: string;
    description?: string | undefined;
    hwid?: string | undefined;
    vid?: number | undefined;
    pid?: number | undefined;
    serial_number?: string | undefined;
    location?: string | undefined;
    manufacturer?: string | undefined;
    product?: string | undefined;
    interface?: string | undefined;
    creHandler?:CreHandler | undefined;
    portCtrl?:portControlerType;
}

export type portInfosType = {
    sys_ctrl:portInfoType;
    port_ctrl:portInfoType;
    gnss_mon:portInfoType;
}

export class WsFt4232 {
    private readonly portNumber = 5001;
    private portInfos: portInfosType
    private socket: Socket | null
    constructor() {
        this.socket = null
        this.portInfos = {
            sys_ctrl:{device:"",name:""},
            port_ctrl:{device:"",name:""},
            gnss_mon:{device:"",name:""},
        }
    }
    async init(
        findPorts: wsFt4232initParam
    ): Promise<portInfosType> {
        let ret: portInfosType = {
            sys_ctrl:{device:"",name:""},
            port_ctrl:{device:"",name:""},
            gnss_mon:{device:"",name:""},
        }
        try {
            const response: AxiosResponse = await axios.get(`http://localhost:${this.portNumber}/ports`)
            const rsps: AxiosResponse[] = await Promise.all(response.data.map((port: string) => axios.get(`http://localhost:${this.portNumber}/ports/${port}`)))
            const filtered = rsps.filter((rsp) => (
                rsp.data.pid === 24593 &&
                rsp.data.vid === 1027
            ))
            Object.keys(findPorts).forEach((key) => {
                this.portInfos[key] = filtered.find((rsp) => rsp.data.serial_number.slice(-1) == findPorts[key].suffix)?.data
            })

            await new Promise<void>((resolve, reject) => {
                try {
                    this.socket = io(`http://localhost:${this.portNumber}/serialtransaction`, {
                        reconnectionDelayMax: 10000,
                    });
                    this.socket.on("connect", () => {
                        this.socket?.off("connect")
                        resolve()
                    })
                } catch (e) {
                    reject(e)
                }
            })

            if (this.socket && this.socket.id) {
                const rooms = Object.keys(this.portInfos).map((key) => this.portInfos[key].name)
                const all_joined_promise = new Promise<void>((resolve, reject) => {
                    this.socket?.on('join_response', (data: any) => {
                        if (rooms.reduce((prev, room) => prev && data.data.rooms.includes(room), true)) {
                            this.socket?.off('join_response')
                            resolve()
                        } else if (data.data.Error) {
                            console.error(data.data.Error);
                            reject(new Error(data.data.Error))
                        }
                    })
                })
                rooms.forEach((room) => {
                    this.socket?.emit('join', { room: room, client: this.socket?.id });
                })
                await all_joined_promise

                const sys_room_name = this.portInfos.sys_ctrl.name
                const sysCreHandler = new CreHandler((dataToSend: string) => {
                    this.socket?.emit('send_data', { 'room': sys_room_name, 'tx_data': dataToSend })
                    return Promise.resolve(1)
                })
                this.portInfos.sys_ctrl.creHandler = sysCreHandler

                const nmea_room_name = this.portInfos.gnss_mon.name
                const gnssCreHandler = new CreHandler((dataToSend: string) => {
                    this.socket?.emit('send_data', { 'room': nmea_room_name, 'tx_data': dataToSend })
                    return Promise.resolve(1)
                })
                this.portInfos.gnss_mon.creHandler = gnssCreHandler

                this.socket?.on('rx_data_notify', (data: any) => {
                    const rxRoom = data.data.room
                    const rxData = data.data.rx_data
                    if (rxRoom === sys_room_name) {
                        if (rxData.startsWith("> ")) {
                            //console.log(" SYS.RSP", rxData.replace("\r",""))
                            sysCreHandler.updateRsp(rxData.replace("\r", ""))
                        } else if (rxData.startsWith("| ")) {
                            //console.log(" SYS.EVT", rxData.replace("\r",""))
                            sysCreHandler.updateEvt(rxData.replace("\r", ""))
                        } else {
                            console.log(" SYS.???", rxData.replace("\r", ""))
                        }
                    } else if (rxRoom === nmea_room_name) {
                        if (rxData.startsWith("$")) {
                            //console.log(" GNS.EVT", rxData.replace("\r",""))
                            gnssCreHandler.updateEvt(rxData.replace("\r", ""))
                        } else if (rxData.endsWith("[WUP] Done")) {
                            console.log("Target is reseted")
                        }
                    }
                })
                this.portInfos.port_ctrl.portCtrl = {
                    setRts: (stt:boolean):Promise<boolean> => {
                        return new Promise((resolve) => {
                            this.socket?.on('set_rts_response', (data:any)=> {
                                this.socket?.off('set_rts_response')
                                // console.log(data.data.rts)
                                if (data.data.rts === stt) {
                                    resolve(true)
                                } else {
                                    resolve(false)
                                }
                            })
                            this.socket?.emit('set_rts_port', {room: this.portInfos.port_ctrl.name, requestToSend:stt});
                        })
                    },
                    setDtr: (stt:boolean):Promise<boolean> => {
                        return new Promise((resolve) => {
                            this.socket?.on('set_dtr_response', (data:any)=> {
                                this.socket?.off('set_dtr_response')
                                // console.log(data.data.dtr)
                                if (data.data.dtr === stt) {
                                    resolve(true)
                                } else {
                                    resolve(false)
                                }
                            })
                            this.socket?.emit('set_dtr_port', {room: this.portInfos.port_ctrl.name, dataTerminalReady:stt});
                        })
                    }
                }
            } else {
                console.error("Empty or not connected socket")
            }
            ret = this.portInfos
        } catch (e: unknown) {
            console.log(e);
        }
        return ret;
    }
    async finilize(): Promise<void> {
        console.log("Finalize start")
        const rooms = Object.keys(this.portInfos).map((key) => this.portInfos[key].name)
        this.socket?.off('rx_data_notify')
        rooms.forEach((room) => {
            this.socket?.emit('leave', { room: room });
        })

        await new Promise<void>((resolve, reject) => {
            try {
                this.socket?.on("disconnect", () => {
                    this.socket?.off("disconnect")
                    resolve()
                })
                this.socket?.disconnect()
            } catch (e) {
                reject(e)
            }
        })
        console.log("Finalize end")
    }
}
