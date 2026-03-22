import { NextRequest, NextResponse } from "next/server";
import { TOOLING_COOKIE_NAME, isToolingProtectionEnabled } from "../../../lib/toolingSession";

export async function POST(request: NextRequest) {
  if (!isToolingProtectionEnabled()) {
    return NextResponse.json(
      { error: "Tooling protection is not configured (set TOOLING_UNLOCK_TOKEN and TOOLING_SESSION_VALUE)." },
      { status: 503 }
    );
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (token !== process.env.TOOLING_UNLOCK_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const sessionValue = process.env.TOOLING_SESSION_VALUE!;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOOLING_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
