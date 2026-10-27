import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string, version: string, arch: string }> }) {
  const { type, version, arch } = await params;
  if (type !== "server" && type !== "cli") return new NextResponse(null, { status: 404 });
  if (!version.match(/v[0-9]\.[0-9]\.[0-9]/g)) return new NextResponse(null, { status: 404 });
  if (arch !== "amd64" && arch !== "arm64") return new NextResponse(null, { status: 404 });
  try {
  const ghRes = await fetch(`https://api.github.com/repos/aelithron/folderharbor/releases/${type}/${version}`, { headers: { "User-Agent": "Aelithron-FolderHarbor-LandingPage", "Authorization": `Bearer ${process.env.GITHUB_PAT!}` } });
  let sum;
  for (const asset of (await ghRes.json() as { assets: { name: string, digest: string }[] }).assets) {
    if (asset.name === `folderharbor-${type}-${version}-linux-${arch}${type === "server" ? ".tar.gz" : ""}`)
  }
  if (!sum) return new NextResponse(null, { status: 404 });
  return new NextResponse(sum);
  } catch { return new NextResponse(null, { status: 500 }); }
}