import { FillChunkFn, InitWorkFn } from './work';

type ColourRGB = [ number, number, number ];

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

const getColour = (workerId: number): ColourRGB => WORKER_COLOURS[workerId % WORKER_COLOURS.length];

let colour: ColourRGB;
const ALPHA = 255;

export const initStatic: InitWorkFn = workerId => {
    colour = getColour(workerId);
};

// Do the actual work for a particular chunk
export const fillChunkWithStatic: FillChunkFn = (buffer, chunk) => {
    const { xStart, xEnd, yStart, yEnd, iStart } = chunk;
    let i = iStart; // buffer index
    for (let y = yStart; y < yEnd; y++) { // bottom-to-top
        for (let x = xStart; x < xEnd; x++) { // left-to-right
            let [ red, green, blue ] = colour;
            if (x > 0 && y > yStart) {
                red = Math.random() * 255;
                green = Math.random() * 255;
                blue = Math.random() * 255;
            }
            buffer[i++] = red;
            buffer[i++] = green;
            buffer[i++] = blue;
            buffer[i++] = ALPHA;
        }
    }
};
