import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

const ARTIFACT_PATH = path.resolve(
  process.cwd(),
  "..",
  "contracts",
  "artifacts",
  "contracts",
  "BatchPayment.sol",
  "BatchPayment.json"
);

export async function GET() {
  try {
    const data = await fs.readFile(ARTIFACT_PATH, "utf-8");
    const artifact = JSON.parse(data);
    return NextResponse.json({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Contract artifact not found. Run `npm run compile` first.",
        details: (error as Error).message,
      },
      { status: 404 }
    );
  }
}
