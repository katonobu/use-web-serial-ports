"use client";
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

import SlideSwitch from '@/components/common/SlideSwitch'
import CheckIndicator from '@/components/common/CheckIndicator'
import { ErrorMessagePre } from '@/components/common/ErrorMsg'
import { DispDebugSelect } from '@/components/common/DispDebugSelect'
import { usePortInfos } from '@/features/ws-serial/PortInfosProvider';
import { CreHandler } from '@/features/ws-serial/creHandler'

import {useNmeaRxSentences, useNmeaSingleLineAnalyseSentence,useNmeaMultiLineAnalyseSentence} from './_hooks/useNmea'
import {NmeaSentencesPre, NmeaMultiLineSentencesPre, ZdaView, RmcHeadVelView, RmcNorthCompass, GsvView} from './_components/Nmea'
import {updatePosByRmc} from './_components/updatePosByRmc'

//import {PositionMap} from './_components/PositionMap'

const PositionMap = dynamic(
  () => import('./_components/PositionMap').then((mod) => mod.PositionMap),
  {
      ssr: false,
      loading: () => <p>MAP Loading...</p>    
  }
)

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
