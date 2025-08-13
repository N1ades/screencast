#!/bin/bash

set -e

echo "Checking for ffmpeg..."
echo "Creating nginx temp directory for rtmp-server..."
mkdir -p /srv/screencast/rtmp-server/nginx/temp/client_body

if command -v ffmpeg >/dev/null 2>&1; then
	echo "ffmpeg is already installed. Version: $(ffmpeg -version | head -n 1)"
	exit 0
fi

echo "ffmpeg not found. Installing..."
if command -v apt-get >/dev/null 2>&1; then
	sudo apt-get update
	sudo apt-get install -y ffmpeg
elif command -v yum >/dev/null 2>&1; then
	sudo yum install -y epel-release
	sudo yum install -y ffmpeg
else
	echo "Unsupported OS. Please install ffmpeg manually."
	exit 1
fi

echo "ffmpeg installation complete. Version: $(ffmpeg -version | head -n 1)"
