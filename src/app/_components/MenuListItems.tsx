"use client";
import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useState, useEffect } from 'react'
import SerialPortIcon from '@/features/web-serial/SerialPortIcon'
import {usePortInfos} from '@/features/ws-serial/PortInfosProvider';

import Link from 'next/link';

export const MenuListItems = ()=>{
  const [portsInfo, setPortsInfo] = useState([
    <ListItemButton key={"hoge"}>
      <ListItemIcon>
        {<SerialPortIcon color="rgba(0, 0, 0, 0.54)"/>}
      </ListItemIcon>
      <ListItemText primary={"Searching port..."} />
    </ListItemButton>
  ])
  const ports = usePortInfos()
  useEffect(()=>{
    const portList = Object.keys(ports).map((key)=>{
      return (
        <Link href={`/${key}`} key={key}>
          <ListItemButton>
            <ListItemIcon>
              {<SerialPortIcon color="rgba(0, 0, 0, 0.54)"/>}
            </ListItemIcon>
            <ListItemText primary={key} />
          </ListItemButton>
        </Link>
      )
    })
    setPortsInfo(portList)
  },[ports])
  return (
    <React.Fragment>
      {portsInfo}
    </React.Fragment>
  )
}
