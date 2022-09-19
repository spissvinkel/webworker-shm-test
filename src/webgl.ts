import { CANVAS_HEIGHT, CANVAS_WIDTH } from './common';

const BG_COLOUR = [ 0.25, 0.0, 0.0, 1.0 ];

// Vertices, UVs and indices for screen space quad
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

let GL: WebGLRenderingContext;

export const uploadAndRender = (dataBuffer: Uint8Array): void => {
    GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, GL.RGBA, GL.UNSIGNED_BYTE, dataBuffer);
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.drawElements(GL.TRIANGLES, INDICES.length, GL.UNSIGNED_SHORT, 0);
};

export const initWebGl = (canvas: HTMLCanvasElement, dataBuffer: Uint8Array): void => {
    initContext(canvas);
    initShaderProgram();
    initGlBuffers();
    initGlTexture(dataBuffer);
};

// Initialize the WebGL context
const initContext = (canvas: HTMLCanvasElement): void => {
    const gl = canvas.getContext('webgl');
    if (gl === null) throw 'No webgl context';
    GL = gl;
    GL.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    GL.clearColor(BG_COLOUR[0], BG_COLOUR[1], BG_COLOUR[2], BG_COLOUR[3]);
    GL.clear(gl.COLOR_BUFFER_BIT);
};

// Initialize the GLSL shader program (vertex + fragment, embedded in the HTML)
const initShaderProgram = (): WebGLProgram => {
    const glVertexShader = compileShader(GL.VERTEX_SHADER, 'vertex-shader');
    const glFragmentShader = compileShader(GL.FRAGMENT_SHADER, 'fragment-shader');
    const glProgram = GL.createProgram();
    if (glProgram === null) throw 'Failed to create shader program';
    GL.attachShader(glProgram, glVertexShader);
    GL.attachShader(glProgram, glFragmentShader);
    GL.linkProgram(glProgram);
    const linkStatus = GL.getProgramParameter(glProgram, GL.LINK_STATUS);
    if (linkStatus === false) throw 'Failed to link shader program';
    GL.validateProgram(glProgram);
    const error = GL.getError();
    if (error !== GL.NO_ERROR) throw `Failed to validate shader program: ${error}`;
    GL.useProgram(glProgram);
    const samplerLocation = GL.getUniformLocation(glProgram, 'txSampler');
    GL.uniform1i(samplerLocation, 0);
    return glProgram;
};

// Compile a shader
const compileShader = (type: number, id: string): WebGLShader => {
    const glShader = GL.createShader(type);
    if (glShader === null) throw `Failed to create shader: ${id}`;
    GL.shaderSource(glShader, getShaderSource(id));
    GL.compileShader(glShader);
    const compileStatus = GL.getShaderParameter(glShader, GL.COMPILE_STATUS);
    if (compileStatus === false) throw `Failed to compile shader: ${id}`;
    return glShader;
};

// Get the shader source from the HTML page
const getShaderSource = (id: string): string => {
    const elem = document.getElementById(id) as HTMLScriptElement | null;
    if (elem === null) throw `No shader source: ${id}`;
    return elem.text;
};

// Initialize the WebGL buffers for the "full screen" quad which will display the generated texture
const initGlBuffers = (): [ WebGLBuffer, WebGLBuffer ] => {
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
    const vertexGlBuffer = createGlBuffer(GL.ARRAY_BUFFER, vertexDataBuffer);
    GL.vertexAttribPointer(0, 3, GL.FLOAT, false, stride, 0);
    GL.enableVertexAttribArray(0);
    GL.vertexAttribPointer(1, 2, GL.FLOAT, false, stride, offset);
    GL.enableVertexAttribArray(1);

    const indexDataBuffer = new Uint16Array(INDICES.length * Uint16Array.BYTES_PER_ELEMENT);
    indexDataBuffer.set(INDICES);
    const indexGlBuffer = createGlBuffer(GL.ELEMENT_ARRAY_BUFFER, indexDataBuffer);
    return [ vertexGlBuffer, indexGlBuffer ];
};

// Create a WebGL buffer
const createGlBuffer = (target: number, dataBuffer: BufferSource): WebGLBuffer => {
    const glBuffer = GL.createBuffer();
    if (glBuffer === null) throw 'Failed to create GL buffer';
    GL.bindBuffer(target, glBuffer);
    GL.bufferData(target, dataBuffer, GL.STATIC_DRAW);
    const error = GL.getError();
    if (error !== GL.NO_ERROR) throw `Failed to create GL buffer: ${error}`;
    return glBuffer;
};

// Initialize a WebGL texture, backed by the buffer which will be updated by the workers
const initGlTexture = (dataBuffer: Uint8Array): WebGLTexture => {
    const glTexture = GL.createTexture();
    if (glTexture === null) throw 'Failed to create texture';
    GL.bindTexture(GL.TEXTURE_2D, glTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, CANVAS_WIDTH, CANVAS_HEIGHT, 0, GL.RGBA, GL.UNSIGNED_BYTE, dataBuffer);
    GL.activeTexture(GL.TEXTURE0);
    const error = GL.getError();
    if (error !== GL.NO_ERROR) throw `Failed to create texture: ${error}`;
    return glTexture;
};
