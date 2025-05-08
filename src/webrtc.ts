// src/webrtc.ts
export class WebRTCStreamer {
  private peer: RTCPeerConnection;
  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private serverUrl: string;
  private isConnected: boolean = false;
  private logger: Console;

  constructor(serverUrl: string, logger: Console = console) {
    this.serverUrl = serverUrl;
    this.logger = logger;
    this.logger.info('WebRTCStreamer: Initializing with server URL:', serverUrl);
    
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      // Force H264 if possible
      sdpSemantics: 'unified-plan'
    });
    
    // Log ICE connection state changes
    this.peer.oniceconnectionstatechange = () => {
      this.logger.info(`WebRTCStreamer: ICE connection state changed: ${this.peer.iceConnectionState}`);
    };
    
    // Log signaling state changes
    this.peer.onsignalingstatechange = () => {
      this.logger.info(`WebRTCStreamer: Signaling state changed: ${this.peer.signalingState}`);
    };
    
    // Log connection state changes
    this.peer.onconnectionstatechange = () => {
      this.logger.info(`WebRTCStreamer: Connection state changed: ${this.peer.connectionState}`);
    };
  }

  async start(stream: MediaStream) {
    this.logger.info('WebRTCStreamer: Starting with stream tracks:', 
      stream.getTracks().map(t => `${t.kind}:${t.label} (${t.id})`));
    
    this.stream = stream;
    
    // Add tracks to peer connection and log
    stream.getTracks().forEach(track => {
      this.peer.addTrack(track, stream);
      this.logger.info(`WebRTCStreamer: Added track: ${track.kind}:${track.label} with settings:`, 
        track.getSettings());
    });

    // Check if we have video tracks
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      this.logger.info('WebRTCStreamer: Video capabilities:', 
        videoTracks[0].getCapabilities());
    } else {
      this.logger.warn('WebRTCStreamer: No video tracks found in stream');
    }

    this.ws = new WebSocket(this.serverUrl);
    
    this.ws.onopen = async () => {
      this.logger.info('WebRTCStreamer: WebSocket connection established');
      this.ws?.send(JSON.stringify({ type: 'broadcaster' }));
      this.logger.info('WebRTCStreamer: Sent broadcaster message');
      
      try {
        this.logger.info('WebRTCStreamer: Creating offer');
        let offer = await this.peer.createOffer();
        
        // Log original SDP
        this.logger.info('WebRTCStreamer: Original offer SDP:', offer.sdp);
        
        // Prefer H264 in SDP
        offer.sdp = this._preferH264(offer.sdp);
        
        // Log modified SDP
        this.logger.info('WebRTCStreamer: Modified offer SDP with H264 preference:', offer.sdp);
        
        // Check if H264 is actually in the SDP
        if (offer.sdp?.includes('H264')) {
          this.logger.info('WebRTCStreamer: H264 codec found in SDP');
          
          // Extract and log H264 parameters
          const h264Lines = offer.sdp.split('\n')
            .filter(line => line.toLowerCase().includes('h264'));
          this.logger.info('WebRTCStreamer: H264 codec parameters:', h264Lines);
        } else {
          this.logger.warn('WebRTCStreamer: H264 codec NOT found in offer SDP!');
        }
        
        await this.peer.setLocalDescription(offer);
        this.logger.info('WebRTCStreamer: Local description set successfully');
        
        this.ws?.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
        this.logger.info('WebRTCStreamer: Sent offer to server');
        
        this.isConnected = true;
      } catch (error) {
        this.logger.error('WebRTCStreamer: Error creating offer:', error);
      }
    };
    
    this.ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.logger.info(`WebRTCStreamer: Received message type: ${msg.type}`);
        
        switch (msg.type) {
          case 'answer':
            this.logger.info('WebRTCStreamer: Received SDP answer from server');
            // Log answer SDP and check for H264
            if (msg.sdp?.includes('H264')) {
              this.logger.info('WebRTCStreamer: H264 codec found in answer SDP');
              const h264Lines = msg.sdp.split('\n')
                .filter(line => line.toLowerCase().includes('h264'));
              this.logger.info('WebRTCStreamer: Server H264 codec parameters:', h264Lines);
            } else {
              this.logger.warn('WebRTCStreamer: H264 codec NOT found in answer SDP!');
              this.logger.info('WebRTCStreamer: Answer SDP:', msg.sdp);
            }
            
            await this.peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
            this.logger.info('WebRTCStreamer: Remote description set successfully');
            break;
            
          case 'ice-candidate':
            if (msg.candidate) {
              this.logger.info('WebRTCStreamer: Received ICE candidate from server:', 
                msg.candidate.candidate ? msg.candidate.candidate.substring(0, 50) + '...' : 'null candidate');
              try {
                await this.peer.addIceCandidate(msg.candidate);
                this.logger.info('WebRTCStreamer: Added ICE candidate from server');
              } catch (e) {
                this.logger.warn('WebRTCStreamer: Failed to add ICE candidate from server:', e);
              }
            }
            break;
            
          case 'ack':
            this.logger.info('WebRTCStreamer: Received ACK from server');
            break;
            
          case 'error':
            this.logger.error('WebRTCStreamer: Received error from server:', msg.error || msg);
            break;
            
          default:
            this.logger.info('WebRTCStreamer: Received unknown message type:', msg.type);
        }
      } catch (error) {
        this.logger.error('WebRTCStreamer: Error processing message:', error, event.data);
      }
    };
    
    this.ws.onclose = (event) => {
      this.isConnected = false;
      this.logger.info(`WebRTCStreamer: WebSocket connection closed with code: ${event.code}, reason: ${event.reason}`);
    };
    
    this.ws.onerror = (error) => {
      this.isConnected = false;
      this.logger.error('WebRTCStreamer: WebSocket error:', error);
    };

    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.logger.info('WebRTCStreamer: Generated ICE candidate:', 
          event.candidate.candidate ? event.candidate.candidate.substring(0, 50) + '...' : 'null candidate');
        
        if (this.ws && this.isConnected) {
          this.ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
          this.logger.info('WebRTCStreamer: Sent ICE candidate to server');
        } else {
          this.logger.warn('WebRTCStreamer: Could not send ICE candidate - WebSocket not connected');
        }
      } else {
        this.logger.info('WebRTCStreamer: ICE candidate gathering completed');
      }
    };
    
    // Log whenever a track is added to the connection
    this.peer.ontrack = (event) => {
      this.logger.info('WebRTCStreamer: Track added:', 
        event.track.kind, event.track.id, event.track.label);
    };
    
    // Log stats periodically to monitor connection quality
    this._startStatsMonitoring();
  }

  stop() {
    this.logger.info('WebRTCStreamer: Stopping connection');
    
    if (this._statsInterval) {
      clearInterval(this._statsInterval);
      this._statsInterval = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        this.logger.info(`WebRTCStreamer: Stopped track: ${track.kind}:${track.label}`);
      });
      this.stream = null;
    }
    
    this.peer.close();
    this.logger.info('WebRTCStreamer: Peer connection closed');
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.logger.info('WebRTCStreamer: WebSocket connection closed');
    }
    
    this.isConnected = false;
  }

  // Prefer H264 codec in SDP
  _preferH264(sdp) {
    if (!sdp) return sdp;
    this.logger.info('WebRTCStreamer: Modifying SDP to prefer H264');
    
    const sdpLines = sdp.split('\n');
    const mLineIndex = sdpLines.findIndex(line => line.startsWith('m=video'));
    
    if (mLineIndex === -1) {
      this.logger.warn('WebRTCStreamer: No video m-line found in SDP');
      return sdp;
    }
    
    const h264Payload = sdpLines
      .filter(line => line.startsWith('a=rtpmap') && line.toLowerCase().includes('h264'))
      .map(line => line.split(' ')[0].split(':')[1]);
    
    if (!h264Payload.length) {
      this.logger.warn('WebRTCStreamer: No H264 codec found in SDP');
      return sdp;
    }
    
    this.logger.info(`WebRTCStreamer: Found H264 payload types: ${h264Payload.join(', ')}`);
    
    const mLineParts = sdpLines[mLineIndex].split(' ');
    const newMLine = [mLineParts[0], mLineParts[1], mLineParts[2], ...h264Payload, ...mLineParts.slice(3).filter(p => !h264Payload.includes(p))];
    sdpLines[mLineIndex] = newMLine.join(' ');
    
    this.logger.info('WebRTCStreamer: Modified m-line to prioritize H264:', sdpLines[mLineIndex]);
    
    return sdpLines.join('\n');
  }

  // Stats monitoring
  private _statsInterval: NodeJS.Timeout | null = null;
  
  private _startStatsMonitoring() {
    this._statsInterval = setInterval(async () => {
      if (!this.peer || this.peer.connectionState !== 'connected') return;
      
      try {
        const stats = await this.peer.getStats();
        let videoSendStats = null;
        let videoRecvStats = null;
        
        stats.forEach(report => {
          // Find outbound video stats
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            videoSendStats = report;
          }
          // Find inbound video stats if any
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            videoRecvStats = report;
          }
        });
        
        if (videoSendStats) {
          this.logger.info('WebRTCStreamer: Video send stats:', {
            codec: videoSendStats.codecId,
            framesSent: videoSendStats.framesSent,
            frameWidth: videoSendStats.frameWidth,
            frameHeight: videoSendStats.frameHeight,
            framesPerSecond: videoSendStats.framesPerSecond,
            qualityLimitationReason: videoSendStats.qualityLimitationReason,
            bytesSent: videoSendStats.bytesSent,
            retransmittedPacketsSent: videoSendStats.retransmittedPacketsSent,
            packetsLost: videoSendStats.packetsLost
          });
          
          // Look up the codec information
          if (videoSendStats.codecId) {
            const codecStats = stats.get(videoSendStats.codecId);
            if (codecStats) {
              this.logger.info('WebRTCStreamer: Video codec in use:', {
                mimeType: codecStats.mimeType,
                clockRate: codecStats.clockRate,
                channels: codecStats.channels,
                sdpFmtpLine: codecStats.sdpFmtpLine
              });
              
              // Specifically log if H264 is being used
              if (codecStats.mimeType?.toLowerCase().includes('h264')) {
                this.logger.info('WebRTCStreamer: Successfully using H264 codec');
              } else {
                this.logger.warn(`WebRTCStreamer: Not using H264 codec! Using: ${codecStats.mimeType}`);
              }
            }
          }
        }
      } catch (error) {
        this.logger.error('WebRTCStreamer: Error getting stats:', error);
      }
    }, 5000);
  }
  
  // Check if H264 is supported
  static async isH264Supported(): Promise<boolean> {
    try {
      const pc = new RTCPeerConnection();
      const offer = await pc.createOffer({
        offerToReceiveVideo: true
      });
      pc.close();
      
      const isSupported = offer.sdp?.toLowerCase().includes('h264');
      console.info('WebRTCStreamer: H264 support check result:', isSupported);
      return isSupported;
    } catch (error) {
      console.error('WebRTCStreamer: Error checking H264 support:', error);
      return false;
    }
  }
  
  // Getter for connection status
  isActive(): boolean {
    return this.isConnected && this.peer.connectionState === 'connected';
  }
}