"use client"
import { ReactNode } from "react";

export function CopyButton({ text, children } : { text: string, children: ReactNode }) {
  function copyText() {
    if (!isSecureContext) return;
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to your clipboard!`);
  }
  return <button onClick={copyText}>{children}</button>
}