import { CANVAS_HEIGHT, CANVAS_WIDTH, ControlIndex, DEBUG, NUM_CONTROL_INTS, NUM_SLICES, NUM_TEXTURE_BYTES, NUM_WORKERS, WorkerMessage } from './common';
import { mkCounter, updateCounter, updateTime } from './counter';
import { initWebGlContext, uploadAndRender } from './webgl';

const workers: Worker[] = [];

let gl: WebGLRenderingContext;
let textureData: Uint8Array;
let controlData: Int32Array;
let bufferIsUpdated = false;

// The main function
const main = (): void => {

    // Chjeck if shared buffers are available
    checkSharedBufferReqs();

    // All the shared data is stored in this buffer
    const sharedBufferSize = NUM_TEXTURE_BYTES + NUM_CONTROL_INTS * Int32Array.BYTES_PER_ELEMENT;
    const sharedBuffer = new SharedArrayBuffer(sharedBufferSize);

    // Create a view for the texture data part
    // This view will be updated (by workers) without Atomics (faster)
    textureData = new Uint8Array(sharedBuffer, 0, NUM_TEXTURE_BYTES);

    // Create a view for the control data part - which is two numbers:
    //     [0] is remaining slices (decreased by workers when not all slices done)
    //     [1] is remaining workers (decreased by workers when all slices done)
    // This view will be updated using Atomics (thread safe)
    controlData = new Int32Array(sharedBuffer, NUM_TEXTURE_BYTES, NUM_CONTROL_INTS);
    Atomics.store(controlData, ControlIndex.REMAINING_SLICES, NUM_SLICES - 1);
    Atomics.store(controlData, ControlIndex.REMAINING_WORKERS, NUM_WORKERS - 1);

    // Init the canvas element and the WebGL context
    const canvas = initCanvas();
    gl = initWebGlContext(canvas, textureData);

    // Make FPS and UPS (worker update) counters
    mkCounter('fps');
    mkCounter('ups');

    // Spawn the worker threads
    for (let id = 0; id < NUM_WORKERS; id++) {
        const message: WorkerMessage = { textureData, controlData, workerId: id };
        workers[id] = new Worker('worker.js');
        workers[id].addEventListener('message', handleWorkerMessage);
        workers[id].postMessage(message);
    }

    // Start the show
    window.requestAnimationFrame((time: number) => {
        updateTime(time);
        window.requestAnimationFrame(update);
    });
};

// Update the view
const update = (time: number): void => {

    updateTime(time);
    updateCounter('fps');

    // If texture buffer is updated by workers - upload to GPU and render
    if (bufferIsUpdated) {

        updateCounter('ups');
        uploadAndRender(gl, textureData);
        bufferIsUpdated = false;
        if (DEBUG) return; // Only render once

        // Reset control buffer and start workers again
        Atomics.store(controlData, ControlIndex.REMAINING_SLICES, NUM_SLICES - 1);
        Atomics.store(controlData, ControlIndex.REMAINING_WORKERS, NUM_WORKERS - 1);
        for (let id = 0; id < NUM_WORKERS; id++) {
            workers[id].postMessage(null);
        }
    }

    // Loop
    window.requestAnimationFrame(update);
};

// All workers have finished
const handleWorkerMessage = (e: MessageEvent<number>): void => {
    if (DEBUG) console.log(`[main] message received from worker ${e.data}`);
    bufferIsUpdated = true;
};

// Checked if security requirements are met so we can use SharedArrayBuffer
const checkSharedBufferReqs = (): void => {
    // Should be true if loading web page from http://localhost/ or https
    console.log(`[main] window.isSecureContext = ${window.isSecureContext}`);
    // Should be true if required response headers are set
    console.log(`[main] window.crossOriginIsolated = ${window.crossOriginIsolated}`);
};

// Initialize the Canvas element (set its size)
const initCanvas = (): HTMLCanvasElement => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas === null) throw 'No canvas';
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    return canvas;
};

// Run the 'main' function when everything is loaded
window.addEventListener('load', main);
