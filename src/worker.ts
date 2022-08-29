import { CANVAS_WIDTH, NUM_PIXEL_BYTES, NUM_SLICES, SLICE_HEIGHT, WorkerMessage, WORKER_COLOURS } from './common';

onmessage = (e: MessageEvent<WorkerMessage>): void => {
    const [ textureDataBuffer, controlDataBuffer, id ] = e.data;
    // console.log(`[worker] [${id}] message received from main`);
    // Control data is two numbers:
    //     [0] is next slice number (increased by workers when not all slices done)
    //     [1] is remaining workers (decreased by workers when all slices done)
    // and must be accessed using Atomics
    let n = Atomics.load(controlDataBuffer, 0);
    // console.log(`[worker] [${id}] n starts at ${n}`);
    while (n < NUM_SLICES) {
        // Try to increase slice number - another thread may have done so already
        if (Atomics.compareExchange(controlDataBuffer, 0, n, n + 1) === n) {
            // console.log(`[worker] [${id}] n increased to ${n + 1}`);
            // textureDataBuffer may be updated without using Atomics because the slice is now reserved
            fillBuffer(textureDataBuffer, n, id);
        }
        // Check if all slices are done
        n = Atomics.load(controlDataBuffer, 0);
        // console.log(`[worker] [${id}] n is now ${n}`);
    }
    // All slices are now done
    if (Atomics.sub(controlDataBuffer, 1, 1) === 1) {
        // This is the last worker, which gets to post the message back to the main thread
        // console.log(`[worker] [${id}] posting message`);
        postMessage(id);
    }
};

const fillBuffer = (buffer: Uint8Array, n: number, id: number): void => {
    // Do the actual work for a particular slice
    const colour = WORKER_COLOURS[id % WORKER_COLOURS.length];
    const alpha = 255;
    const yStart = n * SLICE_HEIGHT;
    const yEnd = yStart + SLICE_HEIGHT;
    let i = yStart * CANVAS_WIDTH * NUM_PIXEL_BYTES; // buffer index
    // console.log(`[worker] [${id}] filling buffer from ${yStart}`);
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
