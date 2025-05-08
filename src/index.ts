// index.ts - Simple WebRTC signaling server for screencast
import '@dotenvx/dotenvx/config'
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import wrtc from '@roamhq/wrtc';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

// Configure logging
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // 'debug', 'info', 'warn', 'error'
const LOG_FILE = process.env.LOG_FILE || path.join(process.cwd(), 'signaling-server.log');

// Create a logger that writes to both console and file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

const logger = {
  debug: (...args: any[]) => {
    if (['debug'].includes(LOG_LEVEL)) {
      const msg = `[DEBUG][${new Date().toISOString()}] ${util.format(...args)}`;
      console.debug(msg);
      logStream.write(msg + '\n');
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(LOG_LEVEL)) {
      const msg = `[INFO][${new Date().toISOString()}] ${util.format(...args)}`;
      console.info(msg);
      logStream.write(msg + '\n');
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
      const msg = `[WARN][${new Date().toISOString()}] ${util.format(...args)}`;
      console.warn(msg);
      logStream.write(msg + '\n');
    }
  },
  error: (...args: any[]) => {
    if (['debug', 'info', 'warn', 'error'].includes(LOG_LEVEL)) {
      const msg = `[ERROR][${new Date().toISOString()}] ${util.format(...args)}`;
      console.error(msg);
      logStream.write(msg + '\n');
    }
  }
};

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8267; // Use the port from your error message
const RTMP_URL = process.env.RTMP_URL || 'rtmp://live.vrchat.com/app/your-stream-key';

logger.info(`Starting signaling server with RTMP URL: ${RTMP_URL.replace(/\/[^/]*$/, '/***')}`); // Hide stream key

const server = http.createServer();
const wss = new WebSocketServer({ 
  server,
  // Add WebSocket validation to prevent invalid status codes
  verifyClient: (info) => {
    return true; // Basic validation - can be expanded
  },
  maxPayload: 65536 // Limit payload size
});

// Track broadcaster and viewers
let broadcaster: WebSocket | null = null;
const viewers = new Set<WebSocket>();
let ffmpeg: any = null;
let serverPeer: any = null;

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

// Handle WebSocket errors properly
wss.on('error', (error) => {
  logger.error('WebSocket Server Error:', error);
});

wss.on('connection', (ws, req) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const connectionId = `conn_${Math.random().toString(36).substring(2, 10)}`;
  
  logger.info(`New connection [${connectionId}] from ${clientIp}`);
  
  // Add error handler for each connection
  ws.on('error', (error) => {
    logger.error(`Connection [${connectionId}] error:`, error);
    // Close connection with a valid code if there's an error
    try {
      ws.close(1011, 'Internal server error');
    } catch (e) {
      logger.error(`Error while closing connection [${connectionId}]:`, e);
    }
  });

  ws.on('message', async (data) => {
    let msg;
    try {
      const dataStr = data.toString();
      logger.debug(`Message received [${connectionId}]: ${dataStr.length > 1000 ? dataStr.substring(0, 997) + '...' : dataStr}`);
      msg = JSON.parse(dataStr);
    } catch (e) {
      logger.error(`Invalid JSON received [${connectionId}]:`, e);
      try {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
        logger.debug(`Sent error response [${connectionId}]: Invalid JSON`);
      } catch (sendError) {
        logger.error(`Error sending error message [${connectionId}]:`, sendError);
      }
      return;
    }

    try {
      switch (msg.type) {
        case 'broadcaster':
          logger.info(`Client [${connectionId}] registered as broadcaster`);
          broadcaster = ws;
          ws.send(JSON.stringify({ type: 'ack', role: 'broadcaster' }));
          logger.debug(`Sent broadcaster acknowledgement [${connectionId}]`);
          break;
        case 'viewer':
          logger.info(`Client [${connectionId}] registered as viewer (id: ${wsId(ws)})`);
          viewers.add(ws);
          ws.send(JSON.stringify({ type: 'ack', role: 'viewer' }));
          logger.debug(`Sent viewer acknowledgement [${connectionId}]`);
          if (broadcaster && broadcaster.readyState === WebSocket.OPEN) {
            broadcaster.send(JSON.stringify({ type: 'viewer-joined' }));
            logger.debug(`Notified broadcaster of new viewer [${connectionId}]`);
          } else {
            logger.warn(`Cannot notify broadcaster of new viewer - broadcaster not available`);
          }
          break;
        case 'offer':
          logger.info(`Received WebRTC offer [${connectionId}]`);
          if (serverPeer) {
            logger.debug(`Closing existing serverPeer connection`);
            serverPeer.close();
            serverPeer = null;
          }
          logger.debug(`Creating new RTCPeerConnection`);
          serverPeer = new wrtc.RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          serverPeer.onicecandidate = (event) => {
            if (event.candidate) {
              try {
                ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
              } catch (e) {
                console.error('Error sending ICE candidate:', e);
              }
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
              console.log(receiver.createEncodedStreams);
              
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
                logger.error(`Encoded streams API not available [${connectionId}]`);
                ws.send(JSON.stringify({ type: 'error', error: 'Server does not support encoded streams API' }));
              }
            }
          };
          try {
            logger.debug(`Setting remote description [${connectionId}]`);
            await serverPeer.setRemoteDescription(new wrtc.RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
            
            logger.debug(`Creating answer [${connectionId}]`);
            const answer = await serverPeer.createAnswer();
            
            logger.debug(`Setting local description [${connectionId}]`);
            await serverPeer.setLocalDescription(answer);
            
            logger.info(`Sending WebRTC answer [${connectionId}]`);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
          } catch (e) {
            logger.error(`Error in RTC connection setup [${connectionId}]:`, e);
            ws.send(JSON.stringify({ type: 'error', error: 'RTC connection setup failed' }));
          }
          break;
        case 'answer':
          logger.info(`Received answer to forward to viewer [${connectionId}]`);
          const viewer = getViewerById(msg.to);
          if (viewer && viewer.readyState === WebSocket.OPEN) {
            logger.debug(`Forwarding answer to viewer ${msg.to} [${connectionId}]`);
            viewer.send(JSON.stringify({ type: 'answer', sdp: msg.sdp }));
          } else {
            logger.warn(`Cannot forward answer - viewer ${msg.to} not found or not connected [${connectionId}]`);
          }
          break;
        case 'ice-candidate':
          if (msg.to === 'broadcaster' && broadcaster && broadcaster.readyState === WebSocket.OPEN) {
            broadcaster.send(JSON.stringify({ type: 'ice-candidate', candidate: msg.candidate, from: wsId(ws) }));
          } else if (serverPeer && msg.candidate) {
            try {
              await serverPeer.addIceCandidate(new wrtc.RTCIceCandidate(msg.candidate));
            } catch (e) {
              // ignore but log
              logger.debug(`Ice candidate could not be added [${connectionId}]:`, e);
            }
          } else {
            const viewer = getViewerById(msg.to);
            if (viewer && viewer.readyState === WebSocket.OPEN) {
              viewer.send(JSON.stringify({ type: 'ice-candidate', candidate: msg.candidate }));
            }
          }
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
      }
    } catch (e) {
      console.error('Error in message handling:', e);
      try {
        ws.send(JSON.stringify({ type: 'error', error: 'Internal error processing message' }));
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket closed with code ${code}, reason: ${reason}`);
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
      viewers.forEach(v => {
        if (v.readyState === WebSocket.OPEN) {
          try {
            v.send(JSON.stringify({ type: 'broadcaster-disconnected' }));
          } catch (e) {
            console.error('Error notifying viewer of broadcaster disconnect:', e);
          }
        }
      });
    }
    viewers.delete(ws);
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('HTTP Server Error:', error);
});

server.listen(PORT, () => {
  console.log(`WebRTC signaling server running on :${PORT}`);
});