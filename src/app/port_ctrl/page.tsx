"use client";
import { useState, useEffect } from 'react'

import SlideSwitch from '@/components/common/SlideSwitch'
import CheckIndicator from '@/components/common/CheckIndicator'
import { ErrorMessagePre } from '@/components/common/ErrorMsg'
import { DispDebugSelect } from '@/components/common/DispDebugSelect'
import { usePortInfos } from '@/features/ws-serial/PortInfosProvider';
import { portControlerType } from '@/features/ws-serial/wsFt4232';
import { HwReset } from './components/ResetButtons'

//---------------------------------------

export default function RootPage() {
  const [initSuccess, setInitSuccess] = useState<boolean>(false)
  const [disable, setDisable] = useState<boolean>(true)
  const [dispDebug, setDispDebug] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string[]>([])

  const [hwAccess, setHwAccess] = useState<portControlerType | null>(null)

  const [enablePortStt, setEnablePortStt] = useState<boolean>(false)
  const [sleepPortStt, setSleepPortStt] = useState<boolean>(false)

  const ports = usePortInfos()
  useEffect(()=>{
    if (ports.port_ctrl.portCtrl) {
      setHwAccess(ports.port_ctrl.portCtrl)
      setDisable(false)
      setInitSuccess(true)
    }
  },[ports])

  const targetCtrlDisable = !(initSuccess && !disable)
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
          disable={targetCtrlDisable}
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
        <ErrorMessagePre errMsgs = {errMsg}></ErrorMessagePre>
        <hr></hr>
        <DispDebugSelect setDispDebug={setDispDebug} dispDebug={dispDebug} />
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
              checked={targetCtrlDisable}
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
