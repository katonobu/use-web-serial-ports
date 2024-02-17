import { useEffect } from 'react'
import {sentenceInfoType, dmLocToD} from '../_hooks/useNmea'
export const updatePosByRmc = (
    sentenceInfos: sentenceInfoType[],
    setRmcPos:(stt:[number,number])=>void,
    setPositionFixed:(stt:boolean)=>void
) => {
    useEffect(()=>{
        let rmc = sentenceInfos.find((si) => si.name === '$GNRMC')
        if (rmc === undefined || rmc.sentence === '') {
            rmc = sentenceInfos.find((si) => si.name === '$GPRMC')
        }
        if (rmc) {
            const splitted = rmc.sentence.split(",")
            const positionFixed = splitted[2] === "A"
            setPositionFixed(positionFixed)
            if (positionFixed) {
                const lat = dmLocToD(splitted[3], splitted[4] === 'S')
                const lon = dmLocToD(splitted[5], splitted[6] === 'W')
                if (!isNaN(lat) && !isNaN(lon)) {
//                    console.log(rmc)
                    setRmcPos([lat, lon])
                }
            }
        }
    },[sentenceInfos, setRmcPos, setPositionFixed])
    return null
}
