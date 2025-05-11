
import { throttle } from 'throttle-debounce';
import { ImageCapture } from './imagecapture.ts';
type StreamMode = 'screen' | 'camera';
type EventListenerName = 'start' | 'stop' | 'close' | 'frame' | 'resize';
const resizeToMaxPixels = (originalWidth: number, originalHeight: number, maxPixels: number): { width: number, height: number } => {
    const originalPixels = originalWidth * originalHeight;

    if (originalPixels <= maxPixels) {
        return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    const scale = Math.sqrt(maxPixels / originalPixels);

    const width = Math.floor(originalWidth * scale);
    const height = Math.floor(originalHeight * scale);

    return { width, height };
}

class EventListener {
    private eventListeners: any = {};
    addEventListener = (type: EventListenerName, listener: (...args: any[]) => any) => {
        this.eventListeners[type] ||= [];
        this.eventListeners[type].push(listener);
    }
    _callEventListeners = (type: EventListenerName, ...args: any[]) => {
        this.eventListeners[type]?.forEach((listener: (...args: any[]) => any) => {
            listener(...args);
        });
    }
}


class FrameGrabber extends EventListener {
    // mediaStream: MediaStream;
    imageCapture: any;
    destroyed = false;
    track: MediaStreamTrack;

    constructor(mediaStream: MediaStream) {
        super();
        // this.mediaStream = mediaStream;
        this.track = mediaStream.getVideoTracks()[0];
        this.imageCapture = new ImageCapture(this.track,);

    }

    loop = async () => {
        while (!this.destroyed) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            await this.grabFrame()
        }
    }


    grabFrame = async () => {
        const imageBitmap = await this.imageCapture.grabFrame();
        this._callEventListeners('frame', imageBitmap);
    }

    destroy = () => {
        this.destroyed = true;
        this.track.stop();
        this._callEventListeners('close');
    }



}


export class BroadcastManager extends EventListener {
    canvas: HTMLCanvasElement; // video preview
    streamMode: string;
    video: HTMLVideoElement;
    mediaStream!: MediaStream;
    destroyed: any;
    animationFrame: number | undefined;

    constructor(canvas: HTMLCanvasElement, streamMode: StreamMode) {
        super();
        this.canvas = canvas;
        this.streamMode = streamMode;
        this.video = document.createElement('video');
        // this._start();
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

        await new Promise<void>((resolve) => this.animationFrame = requestAnimationFrame(() => resolve()));

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
        while (!this.destroyed) {
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

            await new Promise<void>((resolve) => this.animationFrame = requestAnimationFrame(() => resolve()));
        }

        this.video.removeEventListener('resize', resize);
        window.removeEventListener('resize', resize);
    }

    destroy = async () => {
        if (this.destroyed) {
            return
        }
        // typeof this.animationFrame === 'number' && cancelAnimationFrame(this.animationFrame);
        this.destroyed = true;
        this.mediaStream.getTracks()
            .forEach(track => track.stop())
    }
}







//     const video = this.$refs.previewVideo;
//     const canvas = this.$refs.previewCanvas;


//     video.srcObject = mediaStream;
//     await this.$refs.previewVideo.play();

//     canvas.width = video.clientWidth;
//     canvas.height = video.clientHeight;

//     const ctx = canvas.getContext('2d');
//     const resize = () => {
//       canvas.width = video.clientWidth;
//       canvas.height = video.clientHeight;
//       ctx.fillStyle = '#FB3C4E';
//       ctx.font = '30px Akkurat';
//     };
//     window.addEventListener('resize', resize);

//     resize();

//     const updateCanvas = () => {
//       if (video.ended || video.paused) {
//         return;
//       }


//       ctx.drawImage(
//         video,
//         0,
//         0,
//         video.clientWidth,
//         video.clientHeight
//       );

//       const date = new Date();
//       const dateText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
//       ctx.fillText(`${dateText}`, 10, 50, canvas.width - 20);

//       this.requestAnimation = requestAnimationFrame(updateCanvas);
//     };
//     this.requestAnimation = requestAnimationFrame(updateCanvas);


//     this.mediaHandler = new MediaHandler();
//     this.mediaHandler.inputStream = mediaStream;

//     this.mediaHandler.setupStreamConnection(
//       'rtmp://localhost/live',
//       'nyades'
//     );

//     this.mediaHandler.streamHandler(canvas);

//     this.mediaHandler.addEventListener('stop', () => {
//       // setConnected(false);
//       // stopStreaming();
//     })


//   });
// } catch (err) {
//   this.streamError = 'Failed to start screencast: ' + (err && err.message ? err.message : err);
