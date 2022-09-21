import { CANVAS_HEIGHT, CANVAS_WIDTH, DEBUG, NUM_TEXTURE_BYTES, NUM_WORKERS } from './common';
import { getRemainingWorkers, initControlData, NUM_CONTROL_INTS, resetControlData } from './control';
import { mkCounter, updateCounter, updateTime } from './counter';
import { isReadyMsg, MainThreadMessage, mkInitWorkerMsg, mkRunWorkerMsg } from './message';
import { initWebGl, uploadAndRender } from './webgl';

let controlData: Int32Array;
let textureData: Uint8Array;
const workers: Worker[] = [];
let numWorkersReady = 0;

// The main function
const main = (): void => {

    // Check if shared buffers are available
    checkSharedBufferReqs();

    // All the shared data is stored in this buffer
    const sharedBufferSize = NUM_TEXTURE_BYTES + NUM_CONTROL_INTS * Int32Array.BYTES_PER_ELEMENT;
    const sharedBuffer = new SharedArrayBuffer(sharedBufferSize);

    // Create a view for the texture data part
    // This view will be updated (by workers) without Atomics (faster)
    textureData = new Uint8Array(sharedBuffer, 0, NUM_TEXTURE_BYTES);

    // Create a view for the control data part and initialize the values
    // This view will be updated using Atomics (thread safe)
    controlData = new Int32Array(sharedBuffer, NUM_TEXTURE_BYTES, NUM_CONTROL_INTS);
    initControlData(controlData);

    // Init the canvas element and the WebGL context
    initWebGl(initCanvas(), textureData);

    // Make FPS counter
    mkCounter('fps');

    // Spawn the worker threads
    for (let workerId = 0; workerId < NUM_WORKERS; workerId++) {
        workers[workerId] = new Worker('worker.js');
        workers[workerId].addEventListener('message', handleMessageFromWorker);
        workers[workerId].postMessage(mkInitWorkerMsg(workerId, controlData, textureData));
    }
};

const handleMessageFromWorker = (e: MessageEvent<MainThreadMessage>): void => {
    const { data: message } = e;
    const { workerId } = message;
    if (isReadyMsg(message)) {
        console.log(`[main] ready message received from worker ${workerId}`);
        workers[workerId].postMessage(mkRunWorkerMsg());
        if (++numWorkersReady === NUM_WORKERS) {
            // All workers are ready - start the update/render loop
            console.log('[main] all workers are ready');
            resetControlData(controlData);
            window.requestAnimationFrame((time: number) => {
                updateTime(time);
                window.requestAnimationFrame(update);
            });
        }
    }
};

// Update the view
const update = (time: number): void => {

    updateTime(time);
    updateCounter('fps');

    // Wait until all workers are done...
    let remaining: number;
    while ((remaining = getRemainingWorkers(controlData)) > 0) {
        if (DEBUG) console.log(`[main] [update] remaining workers: ${remaining}`);
    }

    // Upload texture to GPU and render
    uploadAndRender(textureData);

    // Reset control buffer and start workers again
    resetControlData(controlData);

    if (DEBUG) return; // Only render once

    // Loop
    window.requestAnimationFrame(update);
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

const destroy = (): void => {
    console.log('[main] [destroy] ...');
    for (const worker of workers) {
        try { worker.terminate(); }
        catch (e) { /* ignored */ }
    }
};

// Cleanup on unload (e.g. reload)
window.addEventListener('unload', destroy);

// Run the 'main' function when everything is loaded
window.addEventListener('load', main);
