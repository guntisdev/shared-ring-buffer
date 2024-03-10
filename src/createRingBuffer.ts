import { TypedArray, TypedArrayConstructor } from "./interfaces";
import { FLAG_SIZE, HEAD_TAIL_SIZE, RingBuffer } from "./RingBuffer";

export function createRingBuffer<T extends TypedArray>(
    elementCount: number,
    typedArrayConstructor: TypedArrayConstructor = Uint8Array,
    bufferConstructor: { new (byteLength: number): ArrayBufferLike } = SharedArrayBuffer,
): RingBuffer<T> | Error {
    let sharedBuffer: ArrayBufferLike | undefined;
    try {
        sharedBuffer = new bufferConstructor(elementCount * typedArrayConstructor.BYTES_PER_ELEMENT + HEAD_TAIL_SIZE + FLAG_SIZE);
        new Uint8Array(sharedBuffer); // required for error throw if size too big
    } catch (e) {
        // error if buffer too big/no memory
        return e instanceof Error ? e : new Error(JSON.stringify(e));
    }

    return new RingBuffer<T>(sharedBuffer, typedArrayConstructor);
}
