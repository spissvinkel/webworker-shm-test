import { BufferChunk, ColourRGB, ControlIndex, DEBUG, getColour, mkBufferChunk, updateBufferChunk, WorkerMessage } from './common';

let textureData: Uint8Array;
let controlData: Int32Array;
let id: number;
let colour: ColourRGB;
const alpha = 255;
let chunk: BufferChunk;

// Handle (init) message from main thread
const handleMessage = (e: MessageEvent<WorkerMessage | null>): void => {
    const { data } = e;
    if (data !== null) {
        textureData = data.textureData;
        controlData = data.controlData;
        id = data.workerId;
        colour = getColour(id);
        chunk = mkBufferChunk();
    }
    doUpdate();
};

const doUpdate = (): void => {
    if (DEBUG) console.log(`[worker] [${id}] message received from main`);
    let n: number;
    while ((n = Atomics.sub(controlData, ControlIndex.REMAINING_SLICES, 1)) >= 0) {
        if (DEBUG) console.log(`[worker] [${id}] processing slice ${n}`);
        fillSliceWithStatic(textureData, n, id);
    }
    // All slices are now done - and also this worker
    if (Atomics.sub(controlData, ControlIndex.REMAINING_WORKERS, 1) === 0) {
        // This is the last worker, which gets to post the message back to the main thread
        if (DEBUG) console.log(`[worker] [${id}] posting message`);
        postMessage(id);
    }
};

// Do the actual work for a particular slice
const fillSliceWithStatic = (buffer: Uint8Array, n: number, id: number): void => {
    const { xStart, xEnd, yStart, yEnd, iStart} = updateBufferChunk(chunk, n);
    let i = iStart; // buffer index
    if (DEBUG) console.log(`[worker] [${id}] filling buffer chunk [ ${xStart}, ${xEnd}, ${yStart}, ${yEnd} ] (${iStart})`);
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

// Register handler for messages from the main thread
self.addEventListener('message', handleMessage);
