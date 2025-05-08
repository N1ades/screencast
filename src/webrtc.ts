// src/webrtc.ts
export class WebRTCStreamer {
  private peer: RTCPeerConnection;
  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private serverUrl: string;
  private isConnected: boolean = false;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      // Force H264 if possible
      sdpSemantics: 'unified-plan'
    });
  }

  async start(stream: MediaStream) {
    this.stream = stream;
    stream.getTracks().forEach(track => this.peer.addTrack(track, stream));

    this.ws = new WebSocket(this.serverUrl);
    this.ws.onopen = async () => {
      this.ws?.send(JSON.stringify({ type: 'broadcaster' }));
      let offer = await this.peer.createOffer();
      // Prefer H264 in SDP
      offer.sdp = this._preferH264(offer.sdp);
      await this.peer.setLocalDescription(offer);
      this.ws?.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
      this.isConnected = true;
    };
    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'answer':
          await this.peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
          break;
        case 'ice-candidate':
          if (msg.candidate) {
            try {
              await this.peer.addIceCandidate(msg.candidate);
            } catch (e) {
              // ignore
            }
          }
          break;
        case 'ack':
          // ignore
          break;
        case 'error':
          // handle error if needed
          break;
      }
    };
    this.ws.onclose = () => {
      this.isConnected = false;
    };
    this.ws.onerror = () => {
      this.isConnected = false;
    };

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.ws && this.isConnected) {
        this.ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };
  }

  stop() {
    this.peer.close();
    this.stream = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Prefer H264 codec in SDP
  _preferH264(sdp) {
    if (!sdp) return sdp;
    const sdpLines = sdp.split('\n');
    const mLineIndex = sdpLines.findIndex(line => line.startsWith('m=video'));
    if (mLineIndex === -1) return sdp;
    const h264Payload = sdpLines
      .filter(line => line.startsWith('a=rtpmap') && line.toLowerCase().includes('h264'))
      .map(line => line.split(' ')[0].split(':')[1]);
    if (!h264Payload.length) return sdp;
    const mLineParts = sdpLines[mLineIndex].split(' ');
    const newMLine = [mLineParts[0], mLineParts[1], mLineParts[2], ...h264Payload, ...mLineParts.slice(3).filter(p => !h264Payload.includes(p))];
    sdpLines[mLineIndex] = newMLine.join(' ');
    return sdpLines.join('\n');
  }
}
