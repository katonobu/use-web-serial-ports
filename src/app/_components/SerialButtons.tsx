import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { useOpen, useClose, useSend, useReceieve, useIsOpen } from  '@/features/web-serial/webSerialDataProvider'
import { useSerialPorts, useCreate, useDelete } from "@/features/web-serial/webSerialDataProvider"
import { useMediaQuery, Button } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useRouter } from 'next/navigation'
import Link from 'next/link';

export const AddButton = (props:{
    disable_not_empty?:boolean, 
    variant?:"text" | "outlined" | "contained" | undefined
}) => {
    const {disable_not_empty = false, variant='text'} = props
    const serialPorts = useSerialPorts()
    const create = useCreate()
    return (
        <>
            <Button
                startIcon={<AddIcon/>}
                disabled={(disable_not_empty && 0 < serialPorts.length)}                
                onClick={()=> create({})}
            >
                Select/Add
            </Button>
        </>
    );
}

export const ListButton = ()=>{
    return (
        <Link href="/">
            <Button
                onClick={()=>{}}
            >
                <PlaylistAddIcon/>
                LIST
            </Button>
        </Link>        
    )
}


export const OpenCloseButton = ({idStr}:{idStr:string})=> {
    const open = useOpen(idStr)
    const close = useClose(idStr)
    const receive = useReceieve(idStr)
    const isOpen = useIsOpen(idStr)
    const [disabled, setDisabled] = useState(false)
    const isSmall = useMediaQuery((theme:any) => theme.breakpoints.down('sm'));    
    return (
        <Button
            disabled = {disabled}
            onClick={()=>{
                if (isOpen) {
                    setDisabled(true)
                    close()
                    .then((errStr)=>{
                        if (errStr) {
                            console.error(errStr)
                        }
                        setDisabled(false)
                    })
                    .catch(()=>setDisabled(false))
                } else {
                    setDisabled(true)
                    open({baudRate:115200})
                    .then((errStr)=>{
                        if (errStr) {
                            console.error(errStr)
                        } else {
                            receive(0,0)
                        }
                        setDisabled(false)
                    })
                    .catch(()=>setDisabled(false))
                }
            }}
            sx={{ width: isSmall?'24px':'10em' }}
        >
            {isOpen?<CloseFullscreenIcon/>:<OpenInFullIcon/>}
            {isSmall?<></>:isOpen?"Close Port":"Open Port"}
        </Button>        
    )
}

export const DeleteButton = ({idStr}:{idStr:string})=> {
    const isOpen = useIsOpen(idStr)
    const deletePort = useDelete(idStr)
    const router = useRouter()
    return (
        <Button
            disabled={isOpen}        
            onClick={()=>{
                console.log("isOpen", isOpen)
                if (!isOpen) {
                    router.push("/")
                    deletePort()
                }
            }}
        >
            <DeleteIcon color='error'/>
            <span style={{ color: 'error' }}>
                Delete
            </span>

        </Button>
    )
}