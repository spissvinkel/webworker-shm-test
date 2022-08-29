export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

export const NUM_PIXEL_BYTES = 4; // RGBA
export const NUM_TEXTURE_BYTES = CANVAS_WIDTH * CANVAS_HEIGHT * NUM_PIXEL_BYTES;
export const NUM_CONTROL_INTS = 2;

export const NUM_SLICES = 8; // Divide the work/canvas into horizontal slices
export const SLICE_HEIGHT = CANVAS_HEIGHT / NUM_SLICES;

export const NUM_WORKERS = 3; // Number of workers/threads which will process the slices

// texture buffer, control buffer, and worker id - passed to each worker to make it run
export type WorkerMessage = [ Uint8Array, Int32Array, number ];

// Assign colours to workers for debug:
export type Colour = [ number, number, number ];
export const WORKER_COLOURS: Colour[] = [
    [ 255,   0,   0 ],
    [   0, 255,   0 ],
    [   0,   0, 255 ],
    [ 255, 255,   0 ],
    [   0, 255, 255 ],
    [ 255,   0, 255 ],
    [ 255, 255, 255 ],
    [   0,   0,   0 ]
];
