export type TypedArrayConstructor = {
    new (length: number): TypedArray;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): TypedArray;
    BYTES_PER_ELEMENT: number;
};

export type TypedArray = Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;
