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
            const track = event.track;
            if (track.kind === 'video') {
              if (typeof track.onframe === 'function' || (track && 'onframe' in track)) {
                logger.info('Receiving video: MediaStreamTrack.onframe is available');
                track.onframe = (frame) => {
                  // Example: log frame info
                  logger.debug(`Received video frame: width=${frame.width}, height=${frame.height}, timestamp=${frame.timestamp}`);
                  // TODO: process frame.data (Uint8ClampedArray) as needed
                };
              } else {
                logger.error('MediaStreamTrack.onframe is not supported.');
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
      logger.error(`Error in message handling [${connectionId}]:`, e);
      try {
        ws.send(JSON.stringify({ type: 'error', error: 'Internal error processing message' }));
      } catch (sendError) {
        logger.error(`Error sending error message [${connectionId}]:`, sendError);
      }
    }
  });

  ws.on('close', (code, reason) => {
    logger.info(`WebSocket [${connectionId}] closed with code ${code}, reason: ${reason || 'none provided'}`);
    if (ws === broadcaster) {
      logger.info(`Broadcaster [${connectionId}] disconnected`);
      broadcaster = null;
      if (ffmpeg) {
        logger.debug(`Stopping ffmpeg process [${connectionId}]`);
        ffmpeg.stdin.end();
        ffmpeg.kill();
        ffmpeg = null;
      }
      if (serverPeer) {
        logger.debug(`Closing server peer connection [${connectionId}]`);
        serverPeer.close();
        serverPeer = null;
      }
      // Notify all viewers
      viewers.forEach(v => {
        if (v.readyState === WebSocket.OPEN) {
          try {
            v.send(JSON.stringify({ type: 'broadcaster-disconnected' }));
          } catch (e) {
            logger.error(`Error notifying viewer of broadcaster disconnect [${connectionId}]:`, e);
          }
        }
      });
    } else if (viewers.has(ws)) {
      logger.info(`Viewer [${connectionId}] disconnected`);
    }
    viewers.delete(ws);
    logger.debug(`Current connection count: ${viewers.size} viewers, broadcaster: ${broadcaster ? 'connected' : 'disconnected'}`);
  });
});

// Handle server errors
server.on('error', (error) => {
  logger.error('HTTP Server Error:', error);
});

// Handle process termination
// process.on('SIGINT', () => {
//   logger.info('SIGINT received, shutting down...');
//   wss.close(() => {
//     logger.info('WebSocket server closed');
//     server.close(() => {
//       logger.info('HTTP server closed');
//       logStream.end();
//       process.exit(0);
//     });
//   });
// });

// process.on('SIGTERM', () => {
//   logger.info('SIGTERM received, shutting down...');
//   wss.close(() => {
//     logger.info('WebSocket server closed');
//     server.close(() => {
//       logger.info('HTTP server closed');
//       logStream.end();
//       process.exit(0);
//     });
//   });
// });

// Track statistics periodically
let connectionStats = {
  totalConnections: 0,
  activeViewers: 0,
  peakConcurrent: 0,
  broadcastTime: 0,
  lastStatsTime: Date.now()
};

setInterval(() => {
  const now = Date.now();
  const activeViewers = viewers.size;
  
  // Update stats
  connectionStats.activeViewers = activeViewers;
  connectionStats.peakConcurrent = Math.max(connectionStats.peakConcurrent, activeViewers);
  if (broadcaster) {
    connectionStats.broadcastTime += (now - connectionStats.lastStatsTime);
  }
  connectionStats.lastStatsTime = now;
  
  // Log current status
  logger.info(`Stats: ${activeViewers} active viewers, peak: ${connectionStats.peakConcurrent}, broadcast time: ${Math.floor(connectionStats.broadcastTime/1000)}s`);
}, 60000); // Log stats every minute

server.listen(PORT, () => {
  logger.info(`WebRTC signaling server running on port ${PORT}`);
  logger.info(`Log level: ${LOG_LEVEL}, log file: ${LOG_FILE}`);
});