import '@dotenvx/dotenvx/config'
import child_process from 'child_process';
import { createServer } from './lib/ssl.ts';
import express from 'express';
import { nanoid } from "nanoid";
import { db } from './lib/db.ts';
import type { WebSocket } from 'ws';

const { wss, app } = createServer();
// const transcode = process.env.SMART_TRANSCODE || true;

app.use('/assets', express.static('./dist/assets', {
  maxAge: '1y', // cache for 1 year
  immutable: true // tells browser the content won't change
}));

app.use(express.static('./dist'));


app.use('/donate', express.static('./dist/index.html'));
app.use('/contact', express.static('./dist/index.html'));

const codeBySecret = db.collection('codeBySecret');

wss.on('connection', async (ws: WebSocket) => {
  const data = await ws.onceMessage({ timeoutDelay: 3000 });
  let { secret, video, audio } = JSON.parse(data.toString());

  console.log('new connection', { secret, video, audio });

  let code = secret && codeBySecret.get(secret);
  secret = (code && secret) ?? nanoid();

  if (!code) {
    code = nanoid();
    codeBySecret.set(secret, code);
  }


  ws.send(JSON.stringify({ secret, code }));

  const videoCodec =
    video === 'h264' ?
      ['-c:v', 'copy']
      :
      // video codec config: low latency, adaptive bitrate
      ['-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-vf', 'scale=w=-2:0'];

  const audioCodec =
    // audio === 'aac' && !transcode ? 
    audio === 'aac' ?
      ['-c:a', 'copy'] :
      // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
      ['-c:a', 'aac', '-ar', '44100', '-b:a', '64k'];

  const ffmpeg = child_process.spawn('ffmpeg', [
    '-i', '-',

    //force to overwrite
    '-y',

    // used for audio sync
    '-use_wallclock_as_timestamps', '1',
    '-async', '1',

    // force 30 fps
    '-r', '30',

    ...videoCodec,

    ...audioCodec,
    //'-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100
    //'-strict', 'experimental',
    '-bufsize', '1000',
    '-f', 'flv',
    '-flvflags', 'no_duration_filesize',
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '2',
    `rtmp://localhost/live/${code}`,
  ]);
  // console.log('FFmpeg command:', ffmpeg.spawnargs.join(' '));


  // Kill the WebSocket connection if ffmpeg dies.
  ffmpeg.on('close', (code, signal) => {
    console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
    if (code !== 0) {
      ws.send(JSON.stringify({
        error: true,
        message: 'FFmpeg process terminated abnormally',
        code,
        signal
      }));
    }
    ws.close();
  });

  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.f If left unhandled, the server will crash.
  ffmpeg.stdin.on('error', (e) => {
    console.log('FFmpeg STDIN Error', e);
  });

  // FFmpeg outputs all of its messages to STDERR. Let's log them to the console.
  ffmpeg.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    console.log('FFmpeg STDERR:', errorMessage);

    // Send more detailed error information to the client
    if (errorMessage.includes('Broken pipe') || errorMessage.includes('Conversion failed')) {
      ws.send(JSON.stringify({
        error: true,
        message: 'Stream connection interrupted',
        details: errorMessage
      }));
    } else {
      ws.send('ffmpeg_status:' + errorMessage);
    }
  });

  ws.on('message', msg => {
    if (Buffer.isBuffer(msg)) {
      console.log('this is some video data');
      ffmpeg.stdin.write(msg);
    } else {
      console.log({ msg });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (error.code === 'WS_ERR_INVALID_CLOSE_CODE') {
      console.log('Invalid close code received, closing connection');
      ws.terminate(); // Force close the connection
    }
    ffmpeg.kill('SIGINT');
  });

  ws.on('close', async (code, reason) => {
    console.log(`WebSocket connection closed with code ${code} and reason:`, (reason || '').toString());
    try {
      ffmpeg.kill('SIGINT');
    } catch (error) {
      console.error('Error killing FFmpeg process:', error);
    }
  });

  ws.on('unexpected-response', (request, response) => {
    console.error('Unexpected WebSocket response:', response.statusCode);
    ws.terminate();
  });
});

// Handle unhandled promise rejections to prevent server crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// https://rtmp.nyades.dev/hls/m-gUhEJRm0PrhCOBRrHbC.m3u8