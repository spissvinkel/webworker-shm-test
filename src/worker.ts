import { BufferChunk, mkBufferChunk, updateBufferChunk } from './chunk';
import { DEBUG } from './common';
import { decreaseRemainingChunks, decreaseRemainingWorkers, getWorkerState, setWaitingWorkerState, waitOnWorkerState, WorkerState } from './control';
import { InitWorkerMessage, mkWorkerReadyMsg, WorkerMessage, WorkerMessageTag } from './message';

type ColourRGB = [ number, number, number ];

// Assign colours to workers for debug:
const WORKER_COLOURS: ColourRGB[] = [
    [ 255,   0,   0 ],
    [   0, 255,   0 ],
    [   0,   0, 255 ],
    [ 255, 255,   0 ],
    [   0, 255, 255 ],
    [ 255,   0, 255 ],
    [ 255, 255, 255 ],
    [   0,   0,   0 ]
];

const getColour = (workerId: number): ColourRGB => WORKER_COLOURS[workerId % WORKER_COLOURS.length];

let workerId: number;
let controlData: Int32Array;
let textureData: Uint8Array;
let colour: ColourRGB;
const alpha = 255;
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

// Grab chunks and process them until all done
const run = (): void => {
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
            fillChunkWithStatic(textureData, chunkIx, workerId);
        }
        setWaitingWorkerState(controlData);
        decreaseRemainingWorkers(controlData);
    }
    if (DEBUG) console.log(`[worker] [${workerId}] stopping...`);
};

// Do the actual work for a particular chunk
const fillChunkWithStatic = (buffer: Uint8Array, chunkIx: number, workerId: number): void => {
    const { xStart, xEnd, yStart, yEnd, iStart } = updateBufferChunk(chunk, chunkIx);
    let i = iStart; // buffer index
    if (DEBUG) console.log(`[worker] [${workerId}] filling buffer chunk [ ${xStart}, ${xEnd}, ${yStart}, ${yEnd} ] (${iStart})`);
    for (let y = yStart; y < yEnd; y++) { // bottom-to-top
        for (let x = xStart; x < xEnd; x++) { // left-to-right
            let [ red, green, blue ] = colour;
            if (x > 0 && y > yStart) {
                red = Math.random() * 255;
                green = Math.random() * 255;
                blue = Math.random() * 255;
            }
            buffer[i++] = red;
            buffer[i++] = green;
            buffer[i++] = blue;
            buffer[i++] = alpha;
        }
    }
};

const init = (message: InitWorkerMessage): void => {
    workerId = message.workerId;
    controlData = message.controlData;
    textureData = message.textureData;
    colour = getColour(workerId);
    chunk = mkBufferChunk();
};

// Register handler for messages from the main thread
self.addEventListener('message', handleMessage);
