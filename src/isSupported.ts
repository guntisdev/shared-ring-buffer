export function isSupportedSharedArrayBuffer(): boolean {
    try {
        if ((window as any).SharedArrayBuffer) {
            return !!(new (window as any).SharedArrayBuffer(1));
        }
    } catch (e) {
        return false;
    }
    return false;
}
