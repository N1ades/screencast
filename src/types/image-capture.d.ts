declare module 'image-capture' {
    export class ImageCapture {
        constructor(track: MediaStreamTrack);
        grabFrame(): Promise<ImageBitmap>;
        takePhoto(): Promise<Blob>;
    }
}
