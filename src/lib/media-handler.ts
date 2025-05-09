export class MediaHandler {
    constructor() {
        this.inputStream = null;
        this.mediaRecorder = null;
        this.ws = null;
    }

    static CAMERA_CONSTRAINTS = {
        audio: true,
        video: true,
    };

    static getRecorderSettings() {
        const settings = {};
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
        const settings = MediaHandler.getRecorderSettings();
        const codecs = settings.format === 'webm' ? `;codecs="${settings.video}, ${settings.audio}"` : '';
        return `video/${settings.format}${codecs}`;
    }

    // async enableCamera() {
    //     this.inputStream = await navigator.mediaDevices.getUserMedia(
    //         MediaHandler.CAMERA_CONSTRAINTS
    //     );
    //     return this.inputStream;
    // }

    setupStreamConnection(streamUrl, streamKey, onOpen) {
        const settings = MediaHandler.getRecorderSettings();
        const protocol = window.location.protocol.replace('http', 'ws');
        const wsUrl = new URL(`${protocol}//${window.location.host}/rtmp`);
        wsUrl.searchParams.set('video', settings.video);
        wsUrl.searchParams.set('audio', settings.audio);
        if (streamUrl) wsUrl.searchParams.set('url', streamUrl);
        if (streamKey) wsUrl.searchParams.set('key', streamKey);

        this.ws = new WebSocket(wsUrl);
        this.ws.addEventListener('open', () => {

            this._callEventListeners('open');
        });
        this.ws.addEventListener('close', () => {
            this.stop();
        });
    }

    startRecording(outputStream) {
        this.mediaRecorder = new MediaRecorder(outputStream, {
            mimeType: MediaHandler.getRecorderMimeType(),
            videoBitsPerSecond: 3000000,
            audioBitsPerSecond: 64000,
        });
        return this.mediaRecorder;
    }

    createOutputStream(videoStream) {
        const audioStream = new MediaStream();
        const audioTracks = this.inputStream.getAudioTracks();
        audioTracks.forEach(track => audioStream.addTrack(track));

        const outputStream = new MediaStream();
        [audioStream, videoStream].forEach(s => {
            s.getTracks().forEach(t => outputStream.addTrack(t));
        });
        return outputStream;
    }

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        if (this.ws) {
            this.ws.close();
        }
        this._callEventListeners('close');
    }


    async streamHandler(canvas) {
        const videoOutputStream = canvas.captureStream(30);
        const outputStream = this.createOutputStream(videoOutputStream);
        const mediaRecorder = this.startRecording(outputStream);

        // this.inputStream = await this.enableCamera();

        mediaRecorder.addEventListener('dataavailable', (e) => {
            this.ws.send(e.data);
        });

        mediaRecorder.addEventListener('stop', () => {
            this._callEventListeners('stop');
            this.ws.close();
        });

        mediaRecorder.start(1000);
    }

    eventListeners: any = {};
    addEventListener = (type: string, listener: () => any) => {
        this.eventListeners[type] ||= [];
        this.eventListeners[type].push(listener);
    }

    _callEventListeners = (type: string, ...args: any[]) => {
        this.eventListeners[type]?.forEach((listener: () => any) => {
            listener(...args);
        });
    }
}