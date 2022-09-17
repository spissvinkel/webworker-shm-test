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

export const uploadAndRender = (gl: WebGLRenderingContext, dataBuffer: Uint8Array): void => {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, dataBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_SHORT, 0);
};

export const initWebGlContext = (canvas: HTMLCanvasElement, dataBuffer: Uint8Array): WebGLRenderingContext => {
    const gl = initContext(canvas);
    initShaderProgram(gl);
    initGlBuffers(gl);
    initGlTexture(gl, dataBuffer);
    return gl;
};

// Initialize the WebGL context
const initContext = (canvas: HTMLCanvasElement): WebGLRenderingContext => {
    const gl = canvas.getContext('webgl');
    if (gl === null) throw 'No webgl context';
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(BG_COLOUR[0], BG_COLOUR[1], BG_COLOUR[2], BG_COLOUR[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
};

// Initialize the GLSL shader program (vertex + fragment, embedded in the HTML)
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

// Compile a shader
const compileShader = (gl: WebGLRenderingContext, type: number, id: string): WebGLShader => {
    const glShader = gl.createShader(type);
    if (glShader === null) throw `Failed to create shader: ${id}`;
    gl.shaderSource(glShader, getShaderSource(id));
    gl.compileShader(glShader);
    const compileStatus = gl.getShaderParameter(glShader, gl.COMPILE_STATUS);
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

// Create a WebGL buffer
const createGlBuffer = (gl: WebGLRenderingContext, target: number, dataBuffer: BufferSource): WebGLBuffer => {
    const glBuffer = gl.createBuffer();
    if (glBuffer === null) throw 'Failed to create GL buffer';
    gl.bindBuffer(target, glBuffer);
    gl.bufferData(target, dataBuffer, gl.STATIC_DRAW);
    const error = gl.getError();
    if (error !== gl.NO_ERROR) throw `Failed to create GL buffer: ${error}`;
    return glBuffer;
};

// Initialize a WebGL texture, backed by the buffer which will be updated by the workers
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
