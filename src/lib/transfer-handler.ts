import { WebsocketManager } from "./websocket-manager";
import { EventListener } from "./event-listener";

export class TransferHandler extends EventListener<'open' | 'stop' | 'close'> {
    audioTracks: MediaStreamTrack[];
    mediaRecorder: MediaRecorder;
    ws: WebsocketManager;
    secret: string | null;
    canvas: HTMLCanvasElement;
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
        if (MediaRecorder.isTypeSupported('video/mp4')) {
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
        const { secret, code } = JSON.parse(messageEvent.data);

        this.secret = secret;
        localStorage.setItem('secret', secret);

        this._callEventListeners('open', {
            rtmpLink: `rtmp://${window.location.host}/live/${code}`,
            secret,
            code
        });
        this.ws.addEventListener('close', () => {
            this.destroy();
        });

        this.ws.addEventListener('message', (message) => {
            console.log('Info from server:', message);
        });

        const videoOutputStream = this.canvas.captureStream(30);

        const outputStream = new MediaStream();

        [...videoOutputStream.getTracks(), ...this.audioTracks].forEach((track: MediaStreamTrack) => {
            outputStream.addTrack(track);
        })

        const mediaRecorder = new MediaRecorder(outputStream, {
            mimeType: TransferHandler.getRecorderMimeType(),
            videoBitsPerSecond: 3_000_000, // 3 Mbps
            audioBitsPerSecond: 128_000,    // 128 Kbps
        });

        mediaRecorder.addEventListener('dataavailable', (event) => {
            console.log('Data available:', event.data);
            
            this.ws.send(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
            this._callEventListeners('stop');
            this.ws.close();
        });

        mediaRecorder.start(1000);
    }

    destroy() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        if (this.ws) {
            this.ws.close();
        }
        this._callEventListeners('close');
    }
}









