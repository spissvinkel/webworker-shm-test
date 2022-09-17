export const DEBUG = true;

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

export const NUM_PIXEL_BYTES = 4; // RGBA
export const NUM_TEXTURE_BYTES = CANVAS_WIDTH * CANVAS_HEIGHT * NUM_PIXEL_BYTES;

export const NUM_CONTROL_INTS = 2;

export const enum ControlIndex { REMAINING_SLICES, REMAINING_WORKERS }

export const NUM_SLICES = 8; // Divide the work/canvas into horizontal slices
export const SLICE_HEIGHT = CANVAS_HEIGHT / NUM_SLICES;

export const NUM_WORKERS = 3; // Number of workers/threads which will process the slices

// texture buffer, control buffer, and worker id - passed to each worker to make it run
export interface WorkerMessage {
    textureData: Uint8Array;
    controlData: Int32Array;
    workerId: number;
}

export interface BufferChunk {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
    iStart: number;
}

export const mkBufferChunk = (): BufferChunk => {
    const xStart = 0;
    const xEnd = CANVAS_WIDTH;
    const yStart = 0;
    const yEnd = SLICE_HEIGHT;
    const iStart = 0;
    return { xStart, xEnd, yStart, yEnd, iStart };
};

export const updateBufferChunk = (chunk: BufferChunk, sliceNum: number): BufferChunk => {
    chunk.yStart = sliceNum * SLICE_HEIGHT;
    chunk.yEnd = chunk.yStart + SLICE_HEIGHT;
    chunk.iStart = chunk.yStart * CANVAS_WIDTH * NUM_PIXEL_BYTES;
    return chunk;
};

export type ColourRGB = [ number, number, number ];

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

export const getColour = (workerId: number): ColourRGB => WORKER_COLOURS[workerId % WORKER_COLOURS.length];
