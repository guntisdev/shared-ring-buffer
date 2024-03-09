import { TypedArray, TypedArrayConstructor } from "./interfaces";

export const HEAD_TAIL_SIZE = 8; // 4 bytes for head int, 4 bytes for tail size
export const FLAG_SIZE = 1; // 1 byte for the full/empty flag

export class RingBuffer<T extends TypedArray> {
    private readonly headTailView: Uint32Array;
    private readonly flagView: Uint8Array;
    private bufferView: T;

    constructor(
        private readonly buffer: SharedArrayBuffer,
        private readonly typedArrayConstructor: TypedArrayConstructor,
    ) {
        // 8 bytes at start of buffer
        this.headTailView = new Uint32Array(this.buffer, 0, 2);
        // 1 byte at end of buffer
        this.flagView = new Uint8Array(this.buffer, this.buffer.byteLength - 1, 1);
        const bufferLength = (this.buffer.byteLength - HEAD_TAIL_SIZE - FLAG_SIZE) / typedArrayConstructor.BYTES_PER_ELEMENT;
        // data between headTailView and flagView
        this.bufferView = new this.typedArrayConstructor(this.buffer, HEAD_TAIL_SIZE, bufferLength) as T;
    }

    public getBuffer = (): ArrayBuffer => this.buffer;

    public shift(size: number): T {
        if (this.getOccupiedSize() < size) return this.bufferView.slice(0, 0) as T;
        
        const outputBuffer = new this.typedArrayConstructor(size) as T;
        return this.shiftAndCopy(outputBuffer);
    }

    // same as shift, but buffer passed from outside
    public shiftAndCopy(outputBuffer: T): T {
        if (this.getOccupiedSize() < outputBuffer.length) return outputBuffer;

        const tmpTail = this.read(outputBuffer, this.getTail());
        this.setTail(tmpTail);
        if (this.getHead() === this.getTail()) this.setEmpty(true);

        return outputBuffer;
    }

    public push(data: T): true | Error {
        if (!(data instanceof this.typedArrayConstructor)) return new Error("Typed array mismatch on push");
        if (data.length > this.getAvailableSize()) return new Error("Not enough available size in ring buffer");

        const tmpHead = this.write(data, this.getHead());
        this.setHead(tmpHead);
        if (this.getHead() === this.getTail()) this.setEmpty(false);

        return true;
    }

    public getCapacity(): number {
        return this.bufferView.length;
    }

    public getAvailableSize(): number {
        return this.getCapacity() - this.getOccupiedSize();
    }

    public getOccupiedSize(): number {
        if (this.getHead() === this.getTail()) {
            return this.isEmpty() ? 0 : this.getCapacity();
        }

        return this.getHead() > this.getTail()
            ? this.getHead() - this.getTail()
            : this.bufferView.length - (this.getTail() - this.getHead());
    }

    private getHead = (): number => this.headTailView[0];
    private setHead = (newHead: number): void => { this.headTailView[0] = newHead; }
    private getTail = (): number => this.headTailView[1];
    private setTail = (newTail: number): void => { this.headTailView[1] = newTail; }
    private isEmpty = (): boolean => this.flagView[0] === 0;
    private setEmpty = (isEmpty: boolean): void => this.flagView.set([ isEmpty ? 0 : 1]);

    /*
        internal method, should be only private
        write data without checking ranges, return newHead
        this method handles moving head from end to start
    */
    private write(data: T, startHead: number): number {
        let newHead = 0;
        if (startHead + data.length <= this.bufferView.length) {
            this.bufferView.set(data, startHead);
            newHead = (startHead + data.length) % this.bufferView.length;
        } else {
            const remainderToEnd = this.bufferView.length - startHead;
            const startOfData = data.subarray(0, remainderToEnd);
            this.bufferView.set(startOfData, startHead);
            const endOfData = data.subarray(remainderToEnd);
            this.bufferView.set(endOfData);
            newHead = endOfData.length;
        }

        return newHead;
    }

    /*
        internal method, should be only private
        read data without checking range
        this method handles moving tail from end to start
    */
    private read(outputBuffer: TypedArray, startTail: number): number {
        if (startTail + outputBuffer.length <= this.getCapacity()) {
            outputBuffer.set(this.bufferView.subarray(startTail, startTail + outputBuffer.length));
            return (startTail + outputBuffer.length) % this.getCapacity();
        } else {
            const endBuffer = this.bufferView.subarray(startTail);
            outputBuffer.set(endBuffer);
            const startBuffer = this.bufferView.subarray(0, outputBuffer.length - endBuffer.length);
            outputBuffer.set(startBuffer, endBuffer.length);
            return (startTail + outputBuffer.length) % this.getCapacity();
        }
    }
}
