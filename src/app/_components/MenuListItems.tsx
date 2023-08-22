import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import UsbIcon from '@mui/icons-material/Usb';

import { useState, useEffect } from 'react'
import { useSerialPorts } from "@/features/web-serial/webSerialDataProvider"
import SerialPortIcon from '@/features/web-serial/SerialPortIcon'
import Link from 'next/link';


export const MenuListItems = ()=>{
  const [portsInfo, setPortsInfo] = useState([
    <Link href="/"  key={'list_add_port'}>
      <ListItemButton>
        <ListItemIcon>
          <PlaylistAddIcon />
        </ListItemIcon>
        <ListItemText primary="List_Add_Port" />
      </ListItemButton>
    </Link>
  ])
  const serialPorts = useSerialPorts()
  useEffect(()=>{
    const devices = serialPorts.map((port)=>{
      return (
        <Link href={`/${port.idStr}`} key={port.idStr}>
          <ListItemButton>
            <ListItemIcon>
              {(port.pid===0 && port.vid===0)?<SerialPortIcon color="rgba(0, 0, 0, 0.54)"/>:<UsbIcon />}            
            </ListItemIcon>
            <ListItemText primary={port.idStr} />
          </ListItemButton>
        </Link>
      )
    })
    setPortsInfo((old)=>[old[0], ...devices])
  },[serialPorts])

  return (
    <React.Fragment>
      {portsInfo}
    </React.Fragment>
  )
}
