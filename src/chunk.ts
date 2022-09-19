import { CANVAS_HEIGHT, CANVAS_WIDTH, NUM_CHUNKS, NUM_PIXEL_BYTES } from './common';

// Divide the work/canvas into horizontal slices (aka chunks)
export const SLICE_HEIGHT = CANVAS_HEIGHT / NUM_CHUNKS;

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

export const updateBufferChunk = (chunk: BufferChunk, chunkIx: number): BufferChunk => {
    chunk.yStart = chunkIx * SLICE_HEIGHT;
    chunk.yEnd = chunk.yStart + SLICE_HEIGHT;
    chunk.iStart = chunk.yStart * CANVAS_WIDTH * NUM_PIXEL_BYTES;
    return chunk;
};
