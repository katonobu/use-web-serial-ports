"use client";
import {
    ReactNode,
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import { WsFt4232, portInfosType } from "./wsFt4232";

// , Dispatch<SetStateAction<CreContextType>>

const PortInfosContext = createContext< portInfosType | undefined>(undefined)

export const PortInfosProvider = ({ children }: { children: ReactNode }) => {
    const [portInfos, setPortInfos] = useState< portInfosType >({
        sys_ctrl:{device:"",name:""},
        port_ctrl:{device:"",name:""},
        gnss_mon:{device:"",name:""},
    });

    useEffect(()=>{
        const hw = new WsFt4232()
        hw.init({
            sys_ctrl:{'suffix':"A"},
            port_ctrl:{'suffix':"B"},
            gnss_mon:{'suffix':"C"}
        }).then((ports)=>{
            console.log(ports)
            setPortInfos(ports)
        }).catch((e)=>{
            if (e instanceof Error) {
                const errorMessage: string = e.message;
                console.error([errorMessage])
            } else {
                console.log(["Unknown Error"])
            }            
        })
        return ()=>{
            hw.finilize()
        }
    },[])
    return (
        <PortInfosContext.Provider value={portInfos}>
          {children}
        </PortInfosContext.Provider>
    );
};

export const usePortInfos = () => {
    const context = useContext(PortInfosContext);
    if (context === undefined)
        throw new Error("Function 'usePortInfos' must be used in Provider.");
    return context;
};