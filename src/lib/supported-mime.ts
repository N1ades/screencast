const getSupportedMimeTypes = (media: string, types: string[], codecs: string[]) => {
    const isSupported = MediaRecorder.isTypeSupported;
    const supported: string[] = [];
    types.forEach((type: string) => {
        const mimeType = `${media}/${type}`;
        codecs.forEach((codec: string) => [
            `${mimeType};codecs=${codec}`,
            `${mimeType};codecs=${codec.toUpperCase()}`,
            // /!\ false positive /!\
            // `${mimeType};codecs:${codec}`,
            // `${mimeType};codecs:${codec.toUpperCase()}` 
        ].forEach(variation => {
            if (isSupported(variation))
                supported.push(variation);
        }));
        if (isSupported(mimeType))
            supported.push(mimeType);
    });
    return supported;
};

const videoTypes = ["webm", "ogg", "mp4", "x-matroska"];
const audioTypes = ["webm", "ogg", "mp3", "x-matroska"];
const codecs = ["should-not-be-supported", "vp9", "vp9.0", "vp8", "vp8.0", "avc1", "av1", "h265", "h.265", "h264", "h.264", "opus", "pcm", "aac", "mpeg", "mp4a"];

export const supportedMime = {
    video: getSupportedMimeTypes("video", videoTypes, codecs),
    audio: getSupportedMimeTypes("audio", audioTypes, codecs)
}

console.log("Supported mime types", supportedMime);
