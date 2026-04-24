#!/bin/bash
set -e
echo "-- Welcome to FolderHarbor! --"
echo "This script will install FolderHarbor Server onto this device."
if [ "$EUID" -ne 0 ]; then
  echo 'Error: Not running as root! Please invoke this script with "sudo".'
  exit 1
fi
case "$(uname -m)" in
  x86_64)
    ARCH="x86_64"
    ;;
  *)
    echo "Error: Unsupported CPU architecture $(uname -m)! Please try again on another computer, or make a GitHub Issue on https://github.com/aelithron/folderharbor/issues to request server support."
    exit 1
    ;;
esac
echo "Finding latest server version..."
LATEST=$(curl -fsS https://fh.novatea.dev/api/version/server)
if [ -z "$LATEST" ]; then
  echo "Error: Couldn't find a FolderHarbor Server version! Please make a GitHub Issue on https://github.com/aelithron/folderharbor/issues."
  exit 1
fi
echo "Found FolderHarbor Server $LATEST!"
echo "Beginning installation..."
mkdir -p /usr/lib/folderharbor
mkdir -p /etc/folderharbor
cd /usr/lib/folderharbor
echo "Creating user..."
useradd -r -s /usr/sbin/nologin folderharbor
echo "Downloading..."
curl -A "Aelithron-FolderHarbor-Installer" -o "/usr/lib/folderharbor/folderharbor.tar.gz" -fsSL "https://github.com/aelithron/folderharbor/releases/download/server%2F$LATEST/folderharbor-server-$LATEST-linux-$ARCH.tar.gz"
echo "Extracting..."
tar -xzf /usr/lib/folderharbor/folderharbor.tar.gz
chmod +x folderharbor-server
chmod 600 example.config.json
chmod -R 755 drizzle
chmod -R 755 node_modules
chmod 644 index.js
chmod 644 folderharbor.service
chmod 755 folderharbor-server
chown -R folderharbor /usr/lib/folderharbor
echo "Setting up some things..."
mv folderharbor.service /etc/systemd/system/folderharbor.service
mv folderharbor-server /usr/bin/folderharbor-server
systemctl daemon-reload
echo "Installed FolderHarbor Server $LATEST!"
read -p "Do you want to install the CLI as well? (y/n): " -n 1
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then

fi
echo "Your server is ready to be used.