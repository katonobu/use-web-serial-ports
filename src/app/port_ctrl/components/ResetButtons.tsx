import SlideSwitch from './SlideSwitch'
import {portControlerType} from '@/features/ws-serial/wsFt4232';

enum resetSequenceEnum {
    Normal,
    NormalLong,
    FwUpdate,
    FwUpdateLong,
}

const setHwAndEnablePortStt = async (
    stt: boolean,
    hwAccess: portControlerType | null,
    setEnablePortStt: (stt: boolean) => void,
    setErrMsg: (msgs:string[]) => void
): Promise<boolean> => {
    let ret = false
    if (hwAccess?.setRts) {
        try {
            if (await hwAccess.setRts(stt)) {
                setEnablePortStt(stt)
                ret = true
            } else {
                setErrMsg(["Fail to hwAccess.setResetPort(stt)"])
            }
        } catch (e) {
            if (e instanceof Error) {
                const errorMessage: string = e.message;
                setErrMsg([errorMessage])
            } else {
                setErrMsg(["Unknown Error"])
            }            
        }
    } else {
        setErrMsg(["hwAccess is falsy"])
    }
    return ret
}

const setHwAndSleepPortStt = async (
    stt: boolean,
    hwAccess: portControlerType | null,
    setSleepPortStt: (stt: boolean) => void,
    setErrMsg: (msgs:string[]) => void
): Promise<boolean> => {
    let ret = false
    if (hwAccess?.setDtr) {
        try {
            if (await hwAccess.setDtr(stt)) {
                setSleepPortStt(stt)
            } else {
                setErrMsg(["Fail to hwAccess.setSleepPort(stt)"])
            }
        } catch (e) {
            if (e instanceof Error) {
                const errorMessage: string = e.message;
                setErrMsg([errorMessage])
            } else {
                setErrMsg(["Unknown Error"])
            }            
        }
    } else {
        setErrMsg(["hwAccess is falsy"])
    }
    return ret
}

const execResetSequence = async (
    hwAccess: portControlerType | null,
    sequenceType: resetSequenceEnum,
    setEnablePortStt: (stt: boolean) => void,
    setSleepPortStt: (stt: boolean) => void,
    setDisable: (stt: boolean) => void,
    setErrMsg: (msgs:string[]) => void
) => {
    if (hwAccess) {
        try {
            setDisable(true)
            const reestDuration = (sequenceType === resetSequenceEnum.NormalLong || sequenceType === resetSequenceEnum.FwUpdateLong) ? 1000 : 500
            setHwAndEnablePortStt(false, hwAccess, setEnablePortStt,setErrMsg)
            if (
                sequenceType === resetSequenceEnum.FwUpdateLong ||
                sequenceType === resetSequenceEnum.FwUpdate
            ) {
                setHwAndSleepPortStt(true, hwAccess, setSleepPortStt,setErrMsg)
            } else {
                setHwAndSleepPortStt(false, hwAccess, setSleepPortStt,setErrMsg)
            }
            await new Promise<void>((resolve) => setTimeout(resolve, 300))
            setHwAndEnablePortStt(true, hwAccess, setEnablePortStt,setErrMsg)
            await new Promise<void>((resolve) => setTimeout(resolve, reestDuration))
            setHwAndEnablePortStt(false, hwAccess, setEnablePortStt,setErrMsg)
        } catch (e) {
            if (e instanceof Error) {
                const errorMessage: string = e.message;
                setErrMsg([errorMessage])
            } else {
                setErrMsg(["Unknown Error"])
            }            
        } finally {
            setDisable(false)
        }
    } else {
        setErrMsg(["hwAccess is null"])
    }
}

export const HwReset = (props: {
    setErrMsg:(msgs:string[])=>void,
    hwAccess: portControlerType | null,
    disable: boolean,
    setDisable: (stt: boolean) => void,
    enablePortStt: boolean,
    setEnablePortStt: (stt: boolean) => void,
    sleepPortStt: boolean,
    setSleepPortStt: (stt: boolean) => void,
}) => {
    const {
        setErrMsg,
        hwAccess,
        disable,
        setDisable,
        enablePortStt,
        setEnablePortStt,
        sleepPortStt,
        setSleepPortStt,
    } = props
    return (
        <>
            <div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <button
                        onClick={() => execResetSequence(hwAccess, resetSequenceEnum.NormalLong, setEnablePortStt, setSleepPortStt, setDisable, setErrMsg)}
                        disabled={disable}
                        style={{
                            width: '8em',
                            height: '3em',
                            margin: '8px',
                        }}
                    >
                        Normal RESET
                    </button>
                    <button
                        onClick={() => execResetSequence(hwAccess, resetSequenceEnum.FwUpdateLong, setEnablePortStt, setSleepPortStt, setDisable, setErrMsg)}
                        disabled={disable}
                        style={{
                            width: '8em',
                            height: '3em',
                            margin: '8px',
                        }}
                    >
                        FW Update RESET
                    </button>
                </div>
                <div>
                    <div
                        style={{
                            margin: '8px'
                        }}
                    >
                        <SlideSwitch
                            disabled={disable}
                            id={'reset'}
                            checked={enablePortStt}
                            setChecked={async (stt: boolean) => {
                                setHwAndEnablePortStt(stt, hwAccess, setEnablePortStt,setErrMsg)
                            }}
                            checkedStr={"Resetting"}
                            unCheckedStr={'Reset Released'}
                            transformDurationMs={500}
                            checkedColor='blue'
                            unCheckedBackgroundColor='rgb(208,208,208)'
                        />
                    </div>
                    <div
                        style={{
                            margin: '8px'
                        }}
                    >
                        <SlideSwitch
                            disabled={disable}
                            id={'sleep'}
                            checked={sleepPortStt}
                            setChecked={async (stt: boolean) => {
                                setHwAndSleepPortStt(stt, hwAccess, setSleepPortStt,setErrMsg)
                            }}
                            checkedStr={"FW Update"}
                            unCheckedStr={'Normal Reset'}
                            transformDurationMs={500}
                            checkedColor='blue'
                            unCheckedBackgroundColor='rgb(208,208,208)'
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
