export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

export const NUM_PIXEL_BYTES = 4;
export const NUM_TEXTURE_BYTES = CANVAS_WIDTH * CANVAS_HEIGHT * NUM_PIXEL_BYTES;
export const NUM_CONTROL_INTS = 2;

export const NUM_SLICES = 8;
export const SLICE_HEIGHT = CANVAS_HEIGHT / NUM_SLICES;

export const NUM_WORKERS = 3;

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
