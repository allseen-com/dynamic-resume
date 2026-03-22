import { cookies } from "next/headers";
import Header from "./Header";
import { TOOLING_COOKIE_NAME, hasValidToolingCookie, isToolingProtectionEnabled } from "../lib/toolingSession";

export default async function AppHeader() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOOLING_COOKIE_NAME)?.value;
  const protectionOn = isToolingProtectionEnabled();
  const showToolingNav = !protectionOn || hasValidToolingCookie(cookie);

  return <Header showToolingNav={showToolingNav} toolingProtectionEnabled={protectionOn} />;
}
