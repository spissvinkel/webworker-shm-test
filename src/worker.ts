import { CANVAS_WIDTH, ControlIndex, DEBUG, NUM_PIXEL_BYTES, SLICE_HEIGHT, WorkerMessage, WORKER_COLOURS } from './common';

let textureData: Uint8Array;
let controlData: Int32Array;
let id: number;

// Handle (init) message from main thread
const handleMessage = (e: MessageEvent<WorkerMessage | null>): void => {
    const { data } = e;
    if (data !== null) {
        textureData = data.textureData;
        controlData = data.controlData;
        id = data.workerId;
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

const fillSliceWithStatic = (buffer: Uint8Array, n: number, id: number): void => {
    // Do the actual work for a particular slice
    const colour = WORKER_COLOURS[id % WORKER_COLOURS.length];
    const alpha = 255;
    const yStart = n * SLICE_HEIGHT;
    const yEnd = yStart + SLICE_HEIGHT;
    let i = yStart * CANVAS_WIDTH * NUM_PIXEL_BYTES; // buffer index
    if (DEBUG) console.log(`[worker] [${id}] filling buffer from ${yStart}`);
    for (let y = yStart; y < yEnd; y++) { // bottom-to-top
        for (let x = 0; x < CANVAS_WIDTH; x++) { // left-to-right
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
