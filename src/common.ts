import { WorkFn } from './work';

export const DEBUG = false;

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;
// export const CANVAS_WIDTH = 768;
// export const CANVAS_HEIGHT = 1024;

export const NUM_PIXEL_BYTES = 4; // RGBA
export const NUM_TEXTURE_BYTES = CANVAS_WIDTH * CANVAS_HEIGHT * NUM_PIXEL_BYTES;

export const NUM_CHUNKS = 12; // Divide the work to be done into chunks
export const NUM_WORKERS = 6; // Number of workers/threads which will process the chunks

export const WORK_FN_IX: WorkFn = WorkFn.MANDELBROT;
