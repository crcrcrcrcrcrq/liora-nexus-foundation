import { describe, expect, it } from "bun:test";
import { createHmac } from "crypto";
import { verifyInitData } from "@/lib/tma/verify.server";

const BOT_TOKEN = "123456:TEST-TOKEN-NOT-REAL";

/** Buduje poprawnie podpisane `initData` — dokładnie jak robi to Telegram. */
function signInitData(fields: Record<string, string>): string {
  const dataCheckString = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const hash = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const params = new URLSearchParams(fields);
  params.set("hash", hash);
  return params.toString();
}

const now = new Date("2026-08-10T12:00:00Z");
const authDate = String(Math.floor(now.getTime() / 1000) - 60);
const user = JSON.stringify({ id: 987654321, username: "liora_admin" });

describe("TMA initData", () => {
  it("accepts data genuinely signed with the bot token", async () => {
    const initData = signInitData({ auth_date: authDate, user, query_id: "AAE" });
    const result = await verifyInitData(initData, BOT_TOKEN, now);
    expect(result?.telegramId).toBe("987654321");
    expect(result?.username).toBe("liora_admin");
  });

  it("rejects a tampered payload", async () => {
    const initData = signInitData({ auth_date: authDate, user });
    // Podmiana użytkownika na innego, bez przeliczenia podpisu.
    const forged = initData.replace(
      encodeURIComponent(user),
      encodeURIComponent(JSON.stringify({ id: 1, username: "intruz" })),
    );
    expect(await verifyInitData(forged, BOT_TOKEN, now)).toBeNull();
  });

  it("rejects a signature from a different bot token", async () => {
    const initData = signInitData({ auth_date: authDate, user });
    expect(await verifyInitData(initData, "999:OTHER", now)).toBeNull();
  });

  it("rejects stale initData beyond the freshness window", async () => {
    const stale = signInitData({
      auth_date: String(Math.floor(now.getTime() / 1000) - 48 * 60 * 60),
      user,
    });
    expect(await verifyInitData(stale, BOT_TOKEN, now)).toBeNull();
  });

  it("rejects missing hash and empty input", async () => {
    expect(await verifyInitData(`auth_date=${authDate}`, BOT_TOKEN, now)).toBeNull();
    expect(await verifyInitData("", BOT_TOKEN, now)).toBeNull();
  });
});
