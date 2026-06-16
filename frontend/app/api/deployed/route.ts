import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

const DEPLOYED_PATH = path.resolve(process.cwd(), "..", "deployed.json");

export async function GET() {
  try {
    const data = await fs.readFile(DEPLOYED_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ contractAddress: "" });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload = {
    contractAddress: body.contractAddress ?? "",
    network: body.network ?? "arc-testnet",
    deployedAt: body.deployedAt ?? new Date().toISOString(),
  };
  await fs.writeFile(DEPLOYED_PATH, JSON.stringify(payload, null, 2), "utf-8");
  return NextResponse.json(payload);
}
