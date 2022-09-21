import { BufferChunk } from './chunk';
import { fillChunkWithMandelbrot, initMandelbrot } from './mandel';
import { fillChunkWithStatic, initStatic } from './static';

export type InitWorkFn = (workerId: number) => void;
export type FillChunkFn = (buffer: Uint8Array, chunk: BufferChunk, workerId: number) => void;

export const WORK_INIT_FNS: InitWorkFn[] = [ ];
export const FILL_CHUNK_FNS: FillChunkFn[] = [ ];

export const enum WorkFn { STATIC, MANDELBROT }

WORK_INIT_FNS[WorkFn.STATIC] = initStatic;
FILL_CHUNK_FNS[WorkFn.STATIC] = fillChunkWithStatic;

WORK_INIT_FNS[WorkFn.MANDELBROT] = initMandelbrot;
FILL_CHUNK_FNS[WorkFn.MANDELBROT] = fillChunkWithMandelbrot;
