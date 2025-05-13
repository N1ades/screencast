
import { throttle } from 'throttle-debounce';
import { EventListener } from './event-listener.ts';
import { TransferHandler } from './transfer-handler.ts';
type StreamMode = 'screen' | 'camera';
const resizeToMaxPixels = (originalWidth: number, originalHeight: number, maxPixels: number): { width: number, height: number } => {
    const originalPixels = originalWidth * originalHeight;

    if (originalPixels <= maxPixels) {
        return { width: originalWidth, height: originalHeight };
    }

    const scale = Math.sqrt(maxPixels / originalPixels);

    const width = Math.floor(originalWidth * scale);
    const height = Math.floor(originalHeight * scale);

    return { width, height };
}


export class BroadcastManager extends EventListener<'resize' | 'link' | 'error'> {
    canvas: HTMLCanvasElement; // video preview
    streamMode: string;
    video: HTMLVideoElement;
    mediaStream!: MediaStream;
    destroyed: any;

    constructor(canvas: HTMLCanvasElement, streamMode: StreamMode) {
        super();
        this.canvas = canvas;
        this.streamMode = streamMode;
        this.video = document.createElement('video');
    }

    start = async () => {
        if (this.streamMode === 'screen') {
            this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
        } else if (this.streamMode === 'camera') {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
        } else {
            throw new Error('Invalid stream mode');
        }

        this.mediaStream.getTracks()
            .forEach(track => {
                track.addEventListener('ended', this.destroy)
            })

        const videoElementPlaying = new Promise(resolve => {
            this.video.addEventListener('playing', resolve);
        });
        this.video.srcObject = this.mediaStream;
        this.video.muted = true;
        this.video.setAttribute('playsinline', ''); // Required by Safari on iOS 11. See https://webkit.org/blog/6784
        this.video.play();

        await videoElementPlaying;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('getContext failed');
        }

        const resize = throttle(200, () => {
            const { width, height } = resizeToMaxPixels(this.video.videoWidth, this.video.videoHeight, 1280 * 720)
            this.canvas.width = width;
            this.canvas.height = height;
            ctx.fillStyle = '#FB3C4E';
            ctx.font = `${Math.ceil(this.video.videoHeight / 15)}px Akkurat`;
            this._callEventListeners('resize', { originalWidth: this.video.videoWidth, originalHeight: this.video.videoHeight, width, height })
        });

        window.addEventListener('resize', resize);
        this.video.addEventListener('resize', resize);
        resize();

        const transferHandler = new TransferHandler(this.canvas, this.mediaStream.getAudioTracks());
        transferHandler.on('open', (event) => {
            console.log('TransferHandler opened');
            this._callEventListeners('link', event.rtmpLink)
        })
        transferHandler.on('close', () => {
            console.log('TransferHandler closed');
        })
        transferHandler.on('error', (event) => {
            console.error('TransferHandler error:', event);
            this._callEventListeners('error', event);
        })

        transferHandler.start();


        const customRAF = (callback: () => void) => {
            // requestAnimationFrame(callback)
            setTimeout(callback, 1000 / 60); // 60 FPS
        };
        // const customRAF = requestAnimationFrame
        let frames = 0;
        const interval = setInterval(() => {
            console.log(`FPS: ${frames}`);
            frames = 0;
        }, 1000);

        await new Promise<void>((resolve) => customRAF(() => resolve()));
        while (!this.destroyed) {
            frames++;
            ctx.drawImage(
                this.video,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
            const date = new Date();
            const dateText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
            ctx.fillText(`${dateText}`, 10, 50, this.canvas.width - 20);

            await new Promise<void>((resolve) => customRAF(() => resolve()));
        }

        clearInterval(interval);

        this.video.removeEventListener('resize', resize);
        window.removeEventListener('resize', resize);
        transferHandler.destroy();
    }

    destroy = async () => {
        if (this.destroyed) {
            return
        }
        this.destroyed = true;
        this.mediaStream.getTracks()
            .forEach(track => track.stop())
    }
}