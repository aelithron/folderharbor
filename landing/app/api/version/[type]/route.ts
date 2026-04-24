import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (type !== "server" && type !== "cli" && type !== "web") return new NextResponse(null, { status: 404 });
  try {
  const ghRes = await fetch("https://api.github.com/repos/aelithron/folderharbor/releases", { headers: { "User-Agent": "Aelithron-FolderHarbor-LandingPage", "Authorization": `Bearer ${process.env.GITHUB_PAT!}` } });
  const tag = (await ghRes.json() as { tag_name: string, name: string }[]).find((item) => item.tag_name.startsWith(`${type}/`));
  if (!tag) return new NextResponse(null, { status: 404 });
  return new NextResponse(tag.tag_name.split("/")[1]);
  } catch { return new NextResponse(null, { status: 500 }); }
}