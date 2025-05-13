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

    static getRecorderSettings() {
        const settings: { format?: string; video?: string; audio?: string } = {};
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
            settings.format = 'mp4';
            settings.video = 'h264';
            settings.audio = 'aac';
        } else {
            settings.format = 'webm';
            settings.audio = 'opus';
            settings.video = MediaRecorder.isTypeSupported('video/webm;codecs=h264') ? 'h264' : 'vp8';
        }
        console.log('Recorder settings used:', settings);
        return settings;
    }

    static getRecorderMimeType() {
        const settings = TransferHandler.getRecorderSettings();
        const codecs = settings.format === 'webm' ? `;codecs="${settings.video}, ${settings.audio}"` : '';
        return `video/${settings.format}${codecs}`;
    }

    start = () => {
        this.ws = new WebsocketManager(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}/`);
        this.ws.addEventListener('open', this.open);
    }

    open = async () => {
        const settings = TransferHandler.getRecorderSettings();

        this.ws.send(JSON.stringify({
            type: 'start',
            video: settings.video,
            audio: settings.audio,
            secret: this.secret
        }))
        const messageEvent = await this.ws.onceMessage({ timeoutDelay: 3000 });
        console.log('once messageEvent', messageEvent);

        const { secret, code } = JSON.parse(messageEvent.data);

        this.secret = secret;
        localStorage.setItem('secret', secret);

        this._callEventListeners('open', {
            rtmpLink: `rtmp://rtmp.nyades.dev/live/${code}`,
            secret,
            code
        });
        this.ws.addEventListener('close', () => {
            this.close();
        });

        // this.ws.addEventListener('message', (message) => {
        //     console.log('Info from server:', message);
        // });

        this.videoOutputStream = this.canvas.captureStream(30);

        // Log supported video codecs
        const videoCodecs = ['vp8', 'vp9', 'h264', 'av1'];
        videoCodecs.forEach(codec => {
            const mimeType = `video/webm;codecs=${codec}`;
            if (MediaRecorder.isTypeSupported(mimeType)) {
                console.log(`Supported video codec: ${mimeType}`);
            }
        });
        // Log supported audio codecs
        const audioCodecs = ['opus', 'aac', 'vorbis', 'mp3'];
        audioCodecs.forEach(codec => {
            const mimeType = `audio/webm;codecs=${codec}`;
            if (MediaRecorder.isTypeSupported(mimeType)) {
                console.log(`Supported audio codec: ${mimeType}`);
            }
        });

        const outputStream = new MediaStream();

        [...this.videoOutputStream.getVideoTracks(), ...this.audioTracks].forEach((track: MediaStreamTrack) => {
            outputStream.addTrack(track);
        })

        const codecs = [
            {
                mime: 'video/webm;codecs=h264,opus',
                video: 'h264',
                audio: 'opus',
            },
        ]

        this.mediaRecorder = new MediaRecorder(outputStream, {
            mimeType: codecs[0].mime,
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
        //     // this._callEventListeners('stop');
        //     // this.ws.destroy();
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









