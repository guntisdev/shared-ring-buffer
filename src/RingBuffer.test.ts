import { describe, expect, it } from 'vitest'
import { createRingBuffer } from '.';

describe("RingBuffer", () => {
    it("Should create ringbuffer with correct capacity", () => {
        const ringBuffer = createRingBuffer(50);
        expect(ringBuffer).toBeDefined();
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        expect(ringBuffer.getCapacity()).toBe(50);
    });

    it("Should get actual buffer with size plus empty/full byte indicator + head/tail 8 bytes", () => {
        const ringBuffer = createRingBuffer(50);
        expect(ringBuffer).toBeDefined();
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        expect(ringBuffer.getBuffer().byteLength).toBe(50 + 1 + 8);
    });

    it("Should return error if ringbuffer size too big", () => {
        expect(createRingBuffer(1e10)).toBeInstanceOf(Error);
    });

    it("Should create ringbuffer for float32array", () => {
        const arrTypes = [Uint8ClampedArray, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array];
        for (const arrType of arrTypes) {
            expect(createRingBuffer(10, arrType)).not.toBeInstanceOf(Error);
        }
    });

    it("Should return correct occupied and available sizes", () => {
        const ringBuffer = createRingBuffer(30);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        expect(ringBuffer.getOccupiedSize()).toBe(4);
        expect(ringBuffer.getAvailableSize()).toBe(26);
    });

    it("Should return correct occupied and available sizes after two pushes", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        expect(ringBuffer.getOccupiedSize()).toBe(7);
        expect(ringBuffer.getAvailableSize()).toBe(3);
    });

    it("Should true when written to full buffer", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        const result = ringBuffer.push(new Uint8Array([8, 9, 10]));
        expect(result).toBe(true);
        expect(ringBuffer.getAvailableSize()).toBe(0);
    });

    it("Should return error if buffer overflow", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        const result = ringBuffer.push(new Uint8Array([8, 9, 10, 11]));
        expect(result).toBeInstanceOf(Error);
    });

    it("Should get correct data from written buffer", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        const result = ringBuffer.shift(5);
        expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
        expect(ringBuffer.getOccupiedSize()).toBe(2);
        expect(ringBuffer.getAvailableSize()).toBe(8);
    });

    it("Should write data which will be splitted at end and begginging of buffer", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        ringBuffer.shift(5);
        const result = ringBuffer.push(new Uint8Array([8, 9, 10, 11]));
        expect(result).toBe(true);
    });

    it("Should read data which is splitted at end and begginging of buffer", () => {
        const ringBuffer = createRingBuffer<Uint8Array>(10);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Uint8Array([1, 2, 3, 4]));
        ringBuffer.push(new Uint8Array([5, 6, 7]));
        ringBuffer.shift(6);
        ringBuffer.push(new Uint8Array([8, 9, 10, 11, 12, 13]));
        expect(ringBuffer.getOccupiedSize()).toBe(7);
        expect(ringBuffer.getAvailableSize()).toBe(3);
        const result = ringBuffer.shift(6);
        expect(result).toEqual(new Uint8Array([7, 8, 9, 10, 11, 12]));
    });

    it("Should copy data on buffer created from outside", () => {
        const ringBuffer = createRingBuffer<Float32Array>(10, Float32Array);
        expect(ringBuffer).not.toBeInstanceOf(Error);
        if (ringBuffer instanceof Error) return;
        ringBuffer.push(new Float32Array([1.0, 2.0, 3.0, 4.0]));
        ringBuffer.push(new Float32Array([5.0, 6.0, 7.0]));
        const result1 = new Float32Array(6);
        ringBuffer.shiftAndCopy(result1);
        expect(result1).toEqual(new Float32Array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0]));
        ringBuffer.push(new Float32Array([8.0, 9.0, 10.0, 11.0, 12.0, 13.0]));
        expect(ringBuffer.getOccupiedSize()).toBe(7);
        expect(ringBuffer.getAvailableSize()).toBe(3);
        const result2 = new Float32Array(6);
        ringBuffer.shiftAndCopy(result2);
        expect(result2).toEqual(new Float32Array([7.0, 8.0, 9.0, 10.0, 11.0, 12.0]));
    });
})
