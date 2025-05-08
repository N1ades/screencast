// index.ts - Simple WebRTC signaling server for screencast
import '@dotenvx/dotenvx/config'
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import wrtc from '@roamhq/wrtc';
import { spawn } from 'child_process';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const RTMP_URL = process.env.RTMP_URL || 'rtmp://live.vrchat.com/app/your-stream-key';

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Track broadcaster and viewers
let broadcaster: WebSocket | null = null;
const viewers = new Set<WebSocket>();
let ffmpeg: any = null;
let serverPeer: any = null;

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

    switch (msg.type) {
      case 'broadcaster':
        broadcaster = ws;
        ws.send(JSON.stringify({ type: 'ack', role: 'broadcaster' }));
        break;
      case 'viewer':
        viewers.add(ws);
        ws.send(JSON.stringify({ type: 'ack', role: 'viewer' }));
        if (broadcaster) {
          broadcaster.send(JSON.stringify({ type: 'viewer-joined' }));
        }
        break;
      case 'offer':
        if (serverPeer) {
          serverPeer.close();
          serverPeer = null;
        }
        serverPeer = new wrtc.RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        serverPeer.onicecandidate = (event) => {
          if (event.candidate) {
            ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
          }
        };
        serverPeer.ontrack = (event) => {
          if (ffmpeg) {
            ffmpeg.stdin.end();
            ffmpeg.kill();
            ffmpeg = null;
          }
          const track = event.track;
          const receiver = event.receiver;
          if (track.kind === 'video') {
            // Use Encoded Streams API if available
            const rtpStream = receiver.createEncodedStreams ? receiver.createEncodedStreams().readable : null;
            if (rtpStream) {
              ffmpeg = spawn('ffmpeg', [
                '-f', 'h264',
                '-i', 'pipe:0',
                '-c:v', 'copy',
                '-f', 'flv',
                RTMP_URL
              ]);
              ffmpeg.stderr.on('data', (data) => {
                console.error('ffmpeg stderr:', data.toString());
              });
              ffmpeg.on('close', (code) => {
                console.log('ffmpeg exited with code', code);
              });
              rtpStream.on('data', (chunk) => {
                ffmpeg.stdin.write(chunk);
              });
              rtpStream.on('end', () => {
                ffmpeg.stdin.end();
              });
            } else {
              ws.send(JSON.stringify({ type: 'error', error: 'Server does not support encoded streams API' }));
            }
          }
        };
        await serverPeer.setRemoteDescription(new wrtc.RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
        const answer = await serverPeer.createAnswer();
        await serverPeer.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
        break;
      case 'answer':
        const viewer = getViewerById(msg.to);
        if (viewer) {
          viewer.send(JSON.stringify({ type: 'answer', sdp: msg.sdp }));
        }
        break;
      case 'ice-candidate':
        if (msg.to === 'broadcaster' && broadcaster) {
          broadcaster.send(JSON.stringify({ type: 'ice-candidate', candidate: msg.candidate, from: wsId(ws) }));
        } else if (serverPeer && msg.candidate) {
          try {
            await serverPeer.addIceCandidate(new wrtc.RTCIceCandidate(msg.candidate));
          } catch (e) {
            // ignore
          }
        } else {
          const viewer = getViewerById(msg.to);
          if (viewer) {
            viewer.send(JSON.stringify({ type: 'ice-candidate', candidate: msg.candidate }));
          }
        }
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
    }
  });

  ws.on('close', () => {
    if (ws === broadcaster) {
      broadcaster = null;
      if (ffmpeg) {
        ffmpeg.stdin.end();
        ffmpeg.kill();
        ffmpeg = null;
      }
      if (serverPeer) {
        serverPeer.close();
        serverPeer = null;
      }
      // Notify all viewers
      viewers.forEach(v => v.send(JSON.stringify({ type: 'broadcaster-disconnected' })));
    }
    viewers.delete(ws);
  });
});

// Helper to assign a unique id to each ws
const wsIds = new WeakMap<WebSocket, string>();
let nextId = 1;
function wsId(ws: WebSocket): string {
  if (!wsIds.has(ws)) wsIds.set(ws, 'viewer-' + nextId++);
  return wsIds.get(ws)!;
}
function getViewerById(id: string): WebSocket | undefined {
  for (const v of viewers) {
    if (wsId(v) === id) return v;
  }
  return undefined;
}

server.listen(PORT, () => {
  console.log(`WebRTC signaling server running on :${PORT}`);
});
