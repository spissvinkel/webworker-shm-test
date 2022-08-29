const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const BG_COLOUR = [ 0.25, 0.0, 0.0, 1.0 ];

const VERTICES = [
    -1.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
     1.0,  1.0,  0.0
];
const UVS = [
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0
];
const INDICES = [
    0, 1, 2,
    2, 3, 0
];

const NUM_TEXTURE_BYTES = CANVAS_WIDTH * CANVAS_HEIGHT * 4;

const main = (): void => {
    checkSharedBufferReqs();
    const canvas = initCanvas();
    const gl = initWebGlContext(canvas);
    initShaderProgram(gl);
    initGlBuffers(gl);

    const sharedBuffer = new SharedArrayBuffer(NUM_TEXTURE_BYTES);
    const textureDataBuffer = new Uint8Array(sharedBuffer);
    const a = 255;
    let i = 0;
    for (let y = 0; y < CANVAS_HEIGHT; y++) { // bottom-to-top
        for (let x = 0; x < CANVAS_WIDTH; x++) { // left-to-right
            const r = Math.random() * 255;
            const g = Math.random() * 255;
            const b = Math.random() * 255;
            textureDataBuffer[i++] = r;
            textureDataBuffer[i++] = g;
            textureDataBuffer[i++] = b;
            textureDataBuffer[i++] = a;
        }
    }

    /* const glTexture = */ initGlTexture(gl, textureDataBuffer);

    gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_SHORT, 0);
};

const checkSharedBufferReqs = (): void => {
    // Should be true if loading web page from http://localhost/ or https
    console.log(`[main] window.isSecureContext = ${window.isSecureContext}`);
    // Should be true if required response headers are set
    console.log(`[main] window.crossOriginIsolated = ${window.crossOriginIsolated}`);
};

const initCanvas = (): HTMLCanvasElement => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (canvas === null) throw 'No canvas';
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    return canvas;
};

const initWebGlContext = (canvas: HTMLCanvasElement): WebGLRenderingContext => {
    const gl = canvas.getContext('webgl');
    if (gl === null) throw 'No context';
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(BG_COLOUR[0], BG_COLOUR[1], BG_COLOUR[2], BG_COLOUR[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
};

const initShaderProgram = (gl: WebGLRenderingContext): WebGLProgram => {
    const glVertexShader = compileShader(gl, gl.VERTEX_SHADER, 'vertex-shader');
    const glFragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, 'fragment-shader');
    const glProgram = gl.createProgram();
    if (glProgram === null) throw 'Failed to create shader program';
    gl.attachShader(glProgram, glVertexShader);
    gl.attachShader(glProgram, glFragmentShader);
    gl.linkProgram(glProgram);
    const linkStatus = gl.getProgramParameter(glProgram, gl.LINK_STATUS);
    if (linkStatus === false) throw 'Failed to link shader program';
    gl.validateProgram(glProgram);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) throw `Failed to validate shader program: ${error}`;
    gl.useProgram(glProgram);
    const samplerLocation = gl.getUniformLocation(glProgram, 'txSampler');
    gl.uniform1i(samplerLocation, 0);
    return glProgram;
};

const compileShader = (gl: WebGLRenderingContext, type: number, id: string): WebGLShader => {
    const glShader = gl.createShader(type);
    if (glShader === null) throw `Failed to create shader: ${id}`;
    gl.shaderSource(glShader, getShaderSource(id));
    gl.compileShader(glShader);
    const compileStatus = gl.getShaderParameter(glShader, gl.COMPILE_STATUS);
    if (compileStatus === false) throw `Failed to compile shader: ${id}`;
    return glShader;
};

const getShaderSource = (id: string): string => {
    const elem = document.getElementById(id) as HTMLScriptElement | null;
    if (elem === null) throw `No shader source: ${id}`;
    return elem.text;
};

const initGlBuffers = (gl: WebGLRenderingContext): [ WebGLBuffer, WebGLBuffer ] => {
    const size = VERTICES.length + UVS.length;
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
    const offset = 3 * Float32Array.BYTES_PER_ELEMENT;
    const vertexDataBuffer = new Float32Array(size);
    let i = 0, j = 0, k = 0;
    while (k < size) {
        vertexDataBuffer[k++] = VERTICES[i++];
        vertexDataBuffer[k++] = VERTICES[i++];
        vertexDataBuffer[k++] = VERTICES[i++];
        vertexDataBuffer[k++] = UVS[j++];
        vertexDataBuffer[k++] = UVS[j++];
    }
    const vertexGlBuffer = createGlBuffer(gl, gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(1);

    const indexDataBuffer = new Uint16Array(INDICES.length * Uint16Array.BYTES_PER_ELEMENT);
    indexDataBuffer.set(INDICES);
    const indexGlBuffer = createGlBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer);
    return [ vertexGlBuffer, indexGlBuffer ];
};

const createGlBuffer = (gl: WebGLRenderingContext, target: number, dataBuffer: BufferSource): WebGLBuffer => {
    const glBuffer = gl.createBuffer();
    if (glBuffer === null) throw 'Failed to create GL buffer';
    gl.bindBuffer(target, glBuffer);
    gl.bufferData(target, dataBuffer, gl.STATIC_DRAW);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) throw `Failed to create GL buffer: ${error}`;
    return glBuffer;
};

const initGlTexture = (gl: WebGLRenderingContext, dataBuffer: Uint8Array): WebGLTexture => {
    const glTexture = gl.createTexture();
    if (glTexture === null) throw 'Failed to create texture';
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, CANVAS_WIDTH, CANVAS_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataBuffer);
    gl.activeTexture(gl.TEXTURE0);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) throw `Failed to create texture: ${error}`;
    return glTexture;
};

window.addEventListener('load', main);
