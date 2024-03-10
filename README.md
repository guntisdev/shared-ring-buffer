# shared-ring-buffer

## Overview
The `shared-ring-buffer` library is designed to streamline data transfer between multiple workers or threads in JavaScript applications. It leverages a ring buffer structure for continuous data reads and writes, offering a performance boost over the traditional postMessage() method. This approach simplifies development by abstracting complex behaviors like wrap-around, making it more accessible for developers to implement efficient data sharing across threads.

## Prerequisite
To use shared-ring-buffer, your environment must have `https` enabled, and your web page must include the following headers for security and cross-origin policies:
```sh
'Cross-Origin-Opener-Policy': 'same-origin',
'Cross-Origin-Embedder-Policy': 'require-corp',
```

## Supported buffer views
The library supports a wide range of typed arrays for versatile data handling:
- Uint8Array
- Uint8ClampedArray
- Int8Array
- Uint16Array
- Int16Array
- Uint32Array
- Int32Array
- Float32Array
- Float64Array

## Why shared-ring-buffer?
`shared-ring-buffer` is meant for developing high-performance JavaScript applications with responsive UIs. Offloading tasks to Web Workers can improve application responsiveness, but traditional communication via `postMessage()` can be slow and inconsistent. Modern browsers offer the `SharedArrayBuffer` API to facilitate shared memory access across threads. shared-ring-buffer simplifies this process by providing a straightforward interface for safe, race condition-free data reading and writing, thereby enhancing developer productivity and application performance.

## API
```ts
declare function isSupportedSharedArrayBuffer(): boolean;

declare function createRingBuffer<T extends TypedArray>(
    elementCount: number,
    typedArrayConstructor?: TypedArrayConstructor,
    bufferConstructor?: { new (byteLength: number): ArrayBufferLike; }
): RingBuffer<T> | Error;

declare class RingBuffer<T extends TypedArray> {
    constructor(buffer: ArrayBufferLike, typedArrayConstructor: TypedArrayConstructor);
    getBuffer: () => ArrayBuffer;
    shift(size: number): T;
    shiftAndCopy(outputBuffer: T): T;
    push(data: T): true | Error;
    getCapacity(): number;
    getAvailableSize(): number;
    getOccupiedSize(): number;
}
```

## Usage
To effectively utilize the shared-ring-buffer in your project, start by creating a ring buffer once with `createRingBuffer`. Then, extract its raw buffer using `getBuffer()` and transfer it to another thread. In the receiving thread, instantiate a `new RingBuffer` with this raw buffer.

Following example is taken from audio processing code where Float32Array represents audio samples. 
```ts
// In the main thread
const worker = new Worker("worker.js");

const ringBuffer = createRingBuffer<Float32Array>(500_000, Float32Array);
worker.postMessage({
    sharedBuffer: ringBuffer.getBuffer(),
});
ringBuffer.push(new Float32Array(1_000)); // pushes 1000 empty audio samples to buffer

// In an audio worker
self.onmessage = (e: MessageEvent) => {
    const ringBuffer = new RingBuffer<Float32Array>(e.data.sharedBuffer, Float32Array);
    const data = ringBuffer.shift(1_000)); // reads 1000 audio samples from buffer
}
```

## Installation
```sh
npm install shared-ring-buffer
```

## Run examples
```sh
npm run dev
```

## Test
```sh
npm run test
```

## GIT
[https://github.com/guntisdev/shared-ring-buffer](https://github.com/guntisdev/shared-ring-buffer)

## License
shared-ring-buffer is MIT licensed.