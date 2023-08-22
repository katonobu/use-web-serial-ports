import workerHandler from './workerHandler'

(()=>{
    console.log("WebSerialWorkerStarted")
    workerHandler()
//    setInterval(()=>console.log("a"), 10 * 1000)
})()