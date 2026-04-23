import { NextResponse } from "next/server";

export async function GET() {
  try {
  const ghRes = await fetch("https://api.github.com/repos/aelithron/folderharbor/releases", { headers: { "User-Agent": "Aelithron-FolderHarbor-LandingPage", "Authorization": `Bearer ${process.env.GITHUB_PAT!}` } });
  const tag = (await ghRes.json() as { tag_name: string, name: string }[]).find((item) => item.tag_name.startsWith("server/"));
  if (!tag) return new NextResponse(null, { status: 500 });
  return new NextResponse(tag.tag_name.split("/")[1]);
  } catch { return new NextResponse(null, { status: 500 }); }
}