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
