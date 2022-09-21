import { CANVAS_HEIGHT, CANVAS_WIDTH } from './common';
import { FillChunkFn, InitWorkFn } from './work';

const ALPHA = 255;

const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
let X_SCALE: number, Y_SCALE: number;
if (ASPECT >= 1.0) {
    Y_SCALE = 2.3 / 2.0;
    X_SCALE = Y_SCALE * ASPECT;
} else {
    X_SCALE = 2.5 / 2.0;
    Y_SCALE = X_SCALE / ASPECT;
}

const NORM_WIDTH = 2.0 / CANVAS_WIDTH, NORM_HEIGHT = 2.0 / CANVAS_HEIGHT;
const HALF_WIDTH = CANVAS_WIDTH / 2, HALF_HEIGHT = CANVAS_HEIGHT / 2;

const ZOOM_IN = 0.99925;
const MAX_ITER = 100, RCP_MAX_ITER = 1 / MAX_ITER;

const MB_X_OFFSET = -0.77568377, MB_Y_OFFSET = 0.13646737;
// const MB_X_OFFSET = -0.10109636384562, MB_Y_OFFSET = 0.95628651080914;

let zoom = 1.0;

export const initMandelbrot: InitWorkFn = () => {
    return;
};

// Do the actual work for a particular chunk
export const fillChunkWithMandelbrot: FillChunkFn = (buffer, chunk): void => {
    const { xStart, xEnd, yStart, yEnd, iStart } = chunk;
    const x0 = xStart - HALF_WIDTH, xn = xEnd - HALF_WIDTH;
    const y0 = yStart - HALF_HEIGHT, yn = yEnd - HALF_HEIGHT;
    let i = iStart; // buffer index
    const xScale = X_SCALE * zoom * NORM_WIDTH, yScale = Y_SCALE * zoom * NORM_HEIGHT;
    let mbX0: number, mbY0: number, mbX: number, mbY: number, tmp: number, iter: number, red: number, green: number, blue: number, c: number;
    for (let y = y0; y < yn; y++) { // bottom-to-top
        mbY0 = y * yScale + MB_Y_OFFSET;
        for (let x = x0; x < xn; x++) { // left-to-right
            red = 0.25; green = 0.05; blue = 0.05;
            if (!(y === 0 || x === 0)) {
                mbX0 = x * xScale + MB_X_OFFSET;
                mbX = 0.0; mbY = 0.0; iter = 0;
                while (mbX * mbX + mbY * mbY <= 4 && iter < MAX_ITER) {
                    tmp = mbX * mbX - mbY * mbY + mbX0;
                    mbY = 2 * mbX * mbY + mbY0;
                    mbX = tmp;
                    iter++;
                }
                c = iter * RCP_MAX_ITER;
                if (c === 1.0) c = 0.0;
                red = c * c;
                green = red * c;
                blue = green * 0.75 * c;
            }
            buffer[i++] = red * 255.999;
            buffer[i++] = green * 255.999;
            buffer[i++] = blue * 255.999;
            buffer[i++] = ALPHA;
        }
    }
    if (zoom > 0.0) {
        zoom *= ZOOM_IN;
    }
};
