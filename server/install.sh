#!/bin/bash
set -e
echo "-- Welcome to FolderHarbor! --"
echo "This script will install FolderHarbor Server onto this computer/server."
if [ "$EUID" -ne 0 ]; then
  echo 'Error: Not running as root! Please invoke this script with "sudo".'
  exit 1
fi
NODEVER="24.15.0"
case "$(uname -m)" in
  x86_64)
    ARCH="x86_64"
    NODEARCH="x64"
    CLIARCH="amd64"
    ;;
  aarch64 | arm64)
    ARCH="arm64"
    NODEARCH="arm64"
    CLIARCH="arm64"
    ;;
  *)
    echo "Error: Unsupported CPU architecture $(uname -m)! Please try again on another computer/server, or make a GitHub Issue on https://github.com/aelithron/folderharbor/issues to request we support your architecture."
    exit 1
    ;;
esac
case "$(uname -s)" in
  Linux*)
    ;;
  *)
    echo "Error: Unsupported operating system $(uname -s)! Please try again on a Linux computer/server, or make a GitHub Issue on https://github.com/aelithron/folderharbor/issues to request we support your OS."
    exit 1
    ;;
esac
echo "Note that this is the full server, not something to connect to an existing server!"
echo "If you want to connect to an existing server, check out the Web Panel (https://fh.novatea.dev/web) and the CLI (https://fh.novatea.dev/cli)."
read -p "Do you want to install FolderHarbor Server on this machine? (y/n): " -n 1  </dev/tty
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
echo ""
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
echo "Downloading Node.JS..."
curl -A "Aelithron-FolderHarbor-Installer" -fsSL "https://nodejs.org/dist/v$NODEVER/node-v$NODEVER-linux-$NODEARCH.tar.gz" | tar -xz
mv node-v$NODEVER-linux-$NODEARCH/ node/
if ! id "folderharbor"; then
  echo "Creating user..."
  useradd -r -s /usr/sbin/nologin folderharbor
else
  echo "This server already has a user for FolderHarbor! If you have installed FolderHarbor before on it, this is expected behavior."
fi
echo "Downloading..."
curl -A "Aelithron-FolderHarbor-Installer" -o "/usr/lib/folderharbor/folderharbor.tar.gz" -fsSL "https://github.com/aelithron/folderharbor/releases/download/server%2F$LATEST/folderharbor-server-$LATEST-linux-$ARCH.tar.gz"
echo "Verifying..."
CHECKSUM=$(curl -fsS https://fh.novatea.dev/api/shasum/server/$LATEST/$ARCH)
if [ -z "$CHECKSUM" ]; then
  echo "Error: Couldn't find the FolderHarbor Server checksum! Please make a GitHub Issue on https://github.com/aelithron/folderharbor/issues."
  exit 1
fi
if ! echo "$CHECKSUM  folderharbor.tar.gz" | sha256sum --check --status; then
  echo "Checksum $CHECKSUM is invalid for the downloaded FolderHarbor Server files! This likely means the files were corrupted in the downloading process."
  echo "Please try running this script again, and make a GitHub Issue on https://github.com/aelithron/folderharbor/issues if it persists."
  exit 1  
fi
echo "Checksum $CHECKSUM is valid for folderharbor.tar.gz."
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
[ ! -f "/etc/folderharbor/config.json" ] && cp example.config.json /etc/folderharbor/config.json
chown -R folderharbor /etc/folderharbor
systemctl daemon-reload
echo "Installed FolderHarbor Server $LATEST!"
read -p "Do you want the server to automatically start when this device does? (y/n): " -n 1 </dev/tty
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  systemctl enable folderharbor.service
  echo "Enabled auto-start!"
fi
read -p "Do you want to install the CLI as well? (y/n): " -n 1 </dev/tty
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Finding latest CLI version..."
  LATESTCLI=$(curl -fsS https://fh.novatea.dev/api/version/cli)
  if [ -z "$LATESTCLI" ]; then
    echo "Error: Couldn't find a FolderHarbor CLI version! Please make a GitHub Issue on https://github.com/aelithron/folderharbor/issues."
    exit 1
  fi
  echo "Found FolderHarbor CLI $LATESTCLI! Downloading..."
  curl -A "Aelithron-FolderHarbor-Installer" -o "/usr/bin/folderharbor" -fsSL "https://github.com/aelithron/folderharbor/releases/download/cli%2F$LATESTCLI/folderharbor-cli-$LATESTCLI-linux-$CLIARCH"
  echo "Verifying..."
  CHECKSUMCLI=$(curl -fsS https://fh.novatea.dev/api/shasum/cli/$LATESTCLI/$CLIARCH)
  if [ -z "$CHECKSUMCLI" ]; then
    echo "Error: Couldn't find the FolderHarbor CLI checksum! Please make a GitHub Issue on https://github.com/aelithron/folderharbor/issues."
    exit 1
  fi
  cd /usr/bin
  if echo "$CHECKSUMCLI  folderharbor" | sha256sum --check --status; then
    echo "The checksum was invalid for the downloaded FolderHarbor CLI binary! This likely means it got corrupted in the downloading process."
    echo "Please try installing the CLI separately, the invalid file has been deleted."
    rm /usr/bin/folderharbor
  else
    chmod 755 /usr/bin/folderharbor
    chown root /usr/bin/folderharbor
    echo "Installed FolderHarbor CLI $LATESTCLI!"
  fi
fi
echo ""
echo "FolderHarbor Server is now installed!"
echo "You still need to do a few more things, though:"
echo "1. Create a PostgreSQL database. You will need a username, password, host, port, and database name."
echo '2. Add these details (in "connection string" format) to /etc/folderharbor/config.json (you can also customize this file in other ways).'
echo "3. Run the following command: sudo systemctl start folderharbor.service"
echo "4. Run another command: sudo folderharbor-server --setup"
echo "After that, you will have a running and usable FolderHarbor Server! Welcome, and thanks for using FolderHarbor! ~Nova"