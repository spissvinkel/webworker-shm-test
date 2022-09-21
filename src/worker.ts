import { BufferChunk, mkBufferChunk, updateBufferChunk } from './chunk';
import { DEBUG, WORK_FN_IX } from './common';
import { decreaseRemainingChunks, decreaseRemainingWorkers, getWorkerState, setWaitingWorkerState, waitOnWorkerState, WorkerState } from './control';
import { InitWorkerMessage, mkWorkerReadyMsg, WorkerMessage, WorkerMessageTag } from './message';
import { FILL_CHUNK_FNS, WORK_INIT_FNS } from './work';

let workerId: number;
let controlData: Int32Array;
let textureData: Uint8Array;
let chunk: BufferChunk;

// Handle messages (from main thread)
const handleMessage = (e: MessageEvent<WorkerMessage>): void => {
    const { data: message } = e;
    switch (message.tag) {
        case WorkerMessageTag.INIT:
            console.log(`[worker] [${message.workerId}] init message received from main`);
            init(message);
            self.postMessage(mkWorkerReadyMsg(message.workerId));
            break;
        case WorkerMessageTag.RUN:
            console.log(`[worker] [${workerId}] run message received from main`);
            run();
            break;
    }
};

const init = (message: InitWorkerMessage): void => {
    workerId = message.workerId;
    controlData = message.controlData;
    textureData = message.textureData;
    chunk = mkBufferChunk();
    WORK_INIT_FNS[WORK_FN_IX](workerId);
};

// Grab chunks and process them until all done
const run = (): void => {
    const fillChunkFn = FILL_CHUNK_FNS[WORK_FN_IX];
    const shouldStop = false;
    while (!shouldStop) {
        if (DEBUG) console.log(`[worker] [${workerId}] waiting...`);
        waitOnWorkerState(controlData);
        if (getWorkerState(controlData) === WorkerState.STOP) break;
        if (DEBUG) console.log(`[worker] [${workerId}] running...`);
        let n: number;
        while ((n = decreaseRemainingChunks(controlData)) > 0) {
            const chunkIx = n - 1;
            if (DEBUG) console.log(`[worker] [${workerId}] processing chunk ${chunkIx}`);
            const { xStart, xEnd, yStart, yEnd, iStart } = updateBufferChunk(chunk, chunkIx);
            if (DEBUG) console.log(`[worker] [${workerId}] filling buffer chunk [ ${xStart}, ${xEnd}, ${yStart}, ${yEnd} ] (${iStart})`);
            fillChunkFn(textureData, chunk, workerId);
        }
        setWaitingWorkerState(controlData);
        decreaseRemainingWorkers(controlData);
    }
    if (DEBUG) console.log(`[worker] [${workerId}] stopping...`);
};

// Register handler for messages from the main thread
self.addEventListener('message', handleMessage);
