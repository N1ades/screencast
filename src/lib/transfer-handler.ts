import { WebsocketManager } from "./websocket-manager";
import { EventListener } from "./event-listener";
import { supportedMime } from "./supported-mime";

export class TransferHandler extends EventListener<'error' | 'destroy' | 'open' | 'stop' | 'close'> {
    audioTracks: MediaStreamTrack[];
    mediaRecorder?: MediaRecorder;
    ws: WebsocketManager;
    secret: string | null;
    canvas: HTMLCanvasElement;
    videoOutputStream?: MediaStream;
    constructor(canvas: HTMLCanvasElement, audioTracks: MediaStreamTrack[]) {
        super();
        this.audioTracks = audioTracks;
        this.secret = localStorage.getItem('secret');
        this.canvas = canvas;
    }

    static CAMERA_CONSTRAINTS = {
        audio: true,
        video: true,
    };

    start = () => {
        this.ws = new WebsocketManager(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}/`);
        this.ws.addEventListener('open', this.open);
    }

    open = async () => {
        // const settings = TransferHandler.getRecorderSettings();

        const codecs = [
            {
                mime: 'video/mp4;codecs=h264,aac',
                video: 'h264',
                audio: 'aac',
            },
            {
                mime: 'video/webm;codecs=h264,aac',
                video: 'h264',
                audio: 'aac',
            },
            {
                mime: 'video/mp4;codecs=h264,opus',
                video: 'h264',
                audio: 'opus',
            },
            {
                mime: 'video/webm;codecs=h264,opus',
                video: 'h264',
                audio: 'opus',
            },
            {
                mime: 'video/webm;codecs=vp8,aac',
                video: 'vp8',
                audio: 'aac',
            },
            {
                mime: 'video/webm;codecs=vp8,opus',
                video: 'vp8',
                audio: 'opus',
            },
        ]

        const supportedMime = codecs.filter(codec => MediaRecorder.isTypeSupported(codec.mime));


        this.ws.send(JSON.stringify({
            type: 'start',
            video: supportedMime[0]?.video,
            audio: supportedMime[0]?.audio,
            secret: this.secret
        }));

        const messageEvent = await this.ws.onceMessage({ timeoutDelay: 3000 });
        console.log('once messageEvent', messageEvent);

        const { secret, code } = JSON.parse(messageEvent.data);

        this.secret = secret;
        localStorage.setItem('secret', secret);

        this._callEventListeners('open', {
            // rtmpLink: `rtmp://rtmp.nyades.dev/live/${code}`,
            rtmpLink: `https://hls.nyades.dev/hls/${code}.m3u8`,
            secret,
            code
        });
        this.ws.addEventListener('close', () => {
            this.close();
        });

        this.videoOutputStream = this.canvas.captureStream(30);

        const outputStream = new MediaStream();

        [...this.videoOutputStream.getVideoTracks(), ...this.audioTracks].forEach((track: MediaStreamTrack) => {
            outputStream.addTrack(track);
        })


        this.mediaRecorder = new MediaRecorder(outputStream, {
            mimeType: supportedMime[0]?.mime,
            videoBitsPerSecond: 3_000_000, // 3 Mbps
            audioBitsPerSecond: 128_000,    // 128 Kbps
        });

        console.log(supportedMime);


        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            // console.log('Data available:', event.data);
            this.ws.send(event.data);
        });

        this.mediaRecorder.addEventListener('error', (event) => {
            console.error('MediaRecorder error:', event);
            this._callEventListeners('error', event);
        });

        // this.mediaRecorder.addEventListener('stop', () => {
            // this._callEventListeners('stop');
            // this.ws.destroy();
        // });

        this.mediaRecorder.start(1000);
    }

    close = () => {
        this.videoOutputStream?.getTracks().forEach((track: MediaStreamTrack) => {
            track.stop();
        });
        delete this.videoOutputStream;
        this.mediaRecorder?.stop();
        delete this.mediaRecorder;
        this._callEventListeners('close');
    }

    destroy() {
        this.close();
        this.ws?.destroy();
        this._callEventListeners('destroy');
    }
}









