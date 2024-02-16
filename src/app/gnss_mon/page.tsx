"use client";
import { useState, useEffect } from 'react'

import SlideSwitch from '@/components/common/SlideSwitch'
import CheckIndicator from '@/components/common/CheckIndicator'
import { ErrorMessagePre } from '@/components/common/ErrorMsg'
import { DispDebugSelect } from '@/components/common/DispDebugSelect'
import { usePortInfos } from '@/features/ws-serial/PortInfosProvider';
import { CreHandler } from '@/features/ws-serial/creHandler'

import {useNmeaRxSentences, useNmeaSingleLineAnalyseSentence,useNmeaMultiLineAnalyseSentence} from './hooks/useNmea'
import {NmeaSentencesPre, NmeaMultiLineSentencesPre, ZdaView, RmcHeadVelView, RmcNorthCompass, GsvView} from './components/Nmea'
/*
import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css';
import {updatePosByRmc, PositionMap} from './components/PositionMap'
Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/'
*/
import {updatePosByRmc} from './components/PositionMap'

const PositionMap = (props: {
  positionFixed: boolean,
  currentPosition: [number,number],
  currentPositionMakesCenter:boolean
}) => {
  return null
}

const startEndSentences:string[] = [
  '$PSPRA', // useNmeaRxSentences()では先頭に記載したセンテンスがセンテンスの一塊の先頭として扱われる
  '$PSEND', // useNmeaRxSentences()では最後に記載したセンテンスがセンテンスの一塊の先頭として扱われる
]

const analyseSentences:string[] = [
  '$GPGGA',
  '$GNGLL',
  '$GNGSA',
  '$GNGNS',
  '$GNRMC',
  '$GPRMC',
  '$GNVTG',
  '$GNZDA',
  '$GPZDA',
  '$PSGSA',
  '$PSGES',
  '$PSLES',
  '$PSZDA',
  '$PSEPU',
]
const multiLineAnalyseSentences:string[] = [
  '$GPGSV',
  '$QZGSV'
]

//---------------------------------------

export default function RootPage() {
  const [dispDebug, setDispDebug] = useState<boolean>(true)
  const [errMsg, setErrMsg] = useState<string[]>([])
  
  const [creHandler, setCreHandler] = useState<CreHandler | null>(null)
  
  const [currentPosition, setCurrentPosition] = useState<[number,number]>([35.450329,139.634197])
  const [positionFixed, setPositionFixed] = useState<boolean>(false)
  const [currentPositionMakesCenter, setCurrentPositionMakesCenter] = useState<boolean>(true)
  
  const sentences = useNmeaRxSentences(creHandler, startEndSentences)
  const sentenceInfos = useNmeaSingleLineAnalyseSentence(sentences, analyseSentences)
  const sentencesInfos = useNmeaMultiLineAnalyseSentence(sentences, multiLineAnalyseSentences)
  
  updatePosByRmc(sentenceInfos, setCurrentPosition, setPositionFixed)
    
  const ports = usePortInfos()
  useEffect(()=>{
    if (ports.gnss_mon.creHandler) {
      setCreHandler(ports.gnss_mon.creHandler)
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div>
            <ZdaView sentenceInfos={sentenceInfos}/>
            <RmcHeadVelView sentenceInfos={sentenceInfos}/>
            <RmcNorthCompass width={150} height={150} sentenceInfos={sentenceInfos}/>
            <CheckIndicator
              checked={positionFixed}
              checkedStr={currentPosition[0].toFixed(6)+" "+currentPosition[1].toFixed(6)}
              unCheckedStr={"Not Fixed"}
              attackDurationMs = {300}
              releaseDurationMs = {300}
              unCheckedColor='silver'
            />
          </div>
          <div>
            <GsvView
              width={300}
              height={300}
              sentencesInfos={sentencesInfos}
              colorSelFunc={()=>positionFixed?'blue':'black'}
              isFixed={positionFixed}
            />
          </div>
        </div>

        <div>
          <SlideSwitch
            id={"setCurrentPositionToCenter"}
            checked={currentPositionMakesCenter}
            setChecked={setCurrentPositionMakesCenter}
            checkedStr={"MapFollowsCurrentPosition"}
            unCheckedStr={"MapPositionFree"}
            disabled={!positionFixed}
          ></SlideSwitch>
          <PositionMap
            currentPosition={currentPosition}
            currentPositionMakesCenter={currentPositionMakesCenter}
            positionFixed={positionFixed}
          />
        </div>
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
            <NmeaMultiLineSentencesPre multiLineSentencesInfo={sentencesInfos}/>
            <NmeaSentencesPre sentenceInfos={sentenceInfos}/>
          </div>
        ) :
          null
        }
      </div>
    </div>
  )
}
