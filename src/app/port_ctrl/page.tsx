"use client";
import { useState, useEffect } from 'react'

import SlideSwitch from './components/SlideSwitch'
import CheckIndicator from './components/CheckIndicator'
import {HwReset} from './components/ResetButtons'
import {usePortInfos} from '@/features/ws-serial/PortInfosProvider';
import {portControlerType} from '@/features/ws-serial/wsFt4232';
  
export default function RootPage() {
  const [initSuccess, setInitSuccess] = useState<boolean>(false)
  const [enablePortStt, setEnablePortStt] = useState<boolean>(false)
  const [sleepPortStt, setSleepPortStt] = useState<boolean>(false)
  const [disable, setDisable] = useState<boolean>(true)
  const [dispDebug, setDispDebug] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string[]>([])
  const [hwAccess, setHwAccess] = useState<portControlerType | null>(null)
  const resetCtrlDisable = !(initSuccess && !disable)
  const ports = usePortInfos()
  useEffect(()=>{
    if (ports.port_ctrl.portCtrl) {
      setHwAccess(ports.port_ctrl.portCtrl)
      setDisable(false)
      setInitSuccess(true)
    }
  },[ports])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        maxWidth: '640px'
      }}
    >
      <div
        style={{
          padding: '32px'
        }}
      >
        <HwReset
          setErrMsg={setErrMsg}
          hwAccess={hwAccess}
          disable={resetCtrlDisable}
          setDisable={setDisable}
          enablePortStt={enablePortStt}
          setEnablePortStt={setEnablePortStt}
          sleepPortStt={sleepPortStt}
          setSleepPortStt={setSleepPortStt}
        />
      </div>
      <div
        style={{
          padding: '32px'
        }}
      >
        <div>
          {errMsg.map((msg, idx)=>(<pre key={idx.toString(10)} style={{ margin: '8px'}}>{msg}</pre>))}
        </div>
        <hr></hr>
        <label
            // このlabel要素内でクリックするとcheckboxのonChange()が呼ばれる
            htmlFor={'disp-debug'}
        >
          <input
            // width,heightともに0なので見えない
            type="checkbox"
            id={'disp-debug'}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                //              console.log(event.target.checked)
                setDispDebug(event.target.checked)
            }}
            checked={dispDebug}
          />
          View Debugging Info
        </label>                
        {dispDebug ? (
          <div>
            <SlideSwitch
              id={'hw-init'}
              checked={initSuccess}
              setChecked={setInitSuccess}
              checkedStr={"HW Init Success"}
              unCheckedStr={'HW not initialized'}
              transformDurationMs={10}
              checkedColor='blue'
              unCheckedBackgroundColor='rgb(208,208,208)'
            />
            <CheckIndicator
              checked={enablePortStt}
              checkedStr={"ResetStatus"}
              attackDurationMs={10}
              releaseDurationMs={10}
              checkedColor='blue'
              unCheckedColor='rgb(208,208,208)'
            />
            <CheckIndicator
              checked={sleepPortStt}
              checkedStr={"SleepStatus"}
              attackDurationMs={10}
              releaseDurationMs={10}
              checkedColor='blue'
              unCheckedColor='rgb(208,208,208)'
            />
            <SlideSwitch
              id={'disable'}
              checked={disable}
              setChecked={setDisable}
              checkedStr={"Disabled"}
              unCheckedStr={'Enabled'}
              transformDurationMs={10}
              checkedColor='blue'
              unCheckedBackgroundColor='rgb(208,208,208)'
            />
            <CheckIndicator
              checked={resetCtrlDisable}
              checkedStr={"ResetCtrlDisable"}
              attackDurationMs={10}
              releaseDurationMs={10}
              checkedColor='blue'
              unCheckedColor='rgb(208,208,208)'
            />
          </div>
        ) :
          null
        }
      </div>
    </div>
  )
}
