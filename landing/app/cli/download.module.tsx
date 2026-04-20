"use client";
import { ReactNode } from "react";

export default function DownloadCLI({ version }: { version: { tag: string, name: string } | null }) {
  if (!version) return false;
  let os: "macOS" | "linux" | "windows";
  if (navigator.userAgent.includes("Mac")) {
    os = "macOS"
  } else if (navigator.userAgent.includes("Win")) {
    os = "windows"
  } else os = "linux";
  const links: { url: string, display: ReactNode }[] = [
    { url: `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli-${version.tag}-macos-arm64`, display: "Apple Silicon" },
    { url: `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli-${version.tag}-macos-amd64`, display: "Intel Macs" },
    { url: `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli-${version.tag}-linux-amd64`, display: "Linux x86_64" },
    { url: `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli-${version.tag}-linux-arm64`, display: "Linux ARM64" },
    { url: `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli-${version.tag}-windows-amd64.exe`, display: "Windows" }
  ]
  return (
    <div className="flex flex-col gap-2 bg-slate-700 p-2 rounded-xl mt-4">
      <h1 className="text-lg font-semibold">Download {version.name}</h1>
      {os === "macOS" && <div></div>}
    </div>
  )
}