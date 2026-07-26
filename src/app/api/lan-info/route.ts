import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export const dynamic = "force-dynamic"; // never cache

// Returns the dev machine's LAN IP so the frontend can build a link
// like http://<lan-ip>:3000 that phones on the same Wi-Fi can reach.
// We read it server-side (the browser can't see its own LAN IP because
// public IP-echo services return the WAN IP, which phones on the LAN
// cannot route back to).
export async function GET(request: Request) {
  const port = process.env.PORT || "3000";
  const url = new URL(request.url);
  const explicitPort = url.searchParams.get("port") || port;

  // Prefer private RFC1918 ranges; skip virtual/docker interfaces.
  const interfaces = networkInterfaces();
  const candidates: { name: string; ip: string; family: string }[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const a of addrs) {
      const ip = a.address;
      const isPrivate =
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
      const isInternal = a.internal;
      const isIPv4 = a.family === "IPv4";
      if (isIPv4 && isPrivate && !isInternal) {
        candidates.push({ name, ip, family: a.family });
      }
    }
  }

  // Sort: prefer Wi-Fi / Ethernet adapters; demote virtual adapters.
  candidates.sort((a, b) => {
    const score = (n: string) =>
      /wi-?fi|wlan|ethernet|eth0|en0/i.test(n) ? 0 :
      /virtual|vmware|hyper-v|veth|docker|wsl/i.test(n) ? 2 : 1;
    return score(a.name) - score(b.name);
  });

  const lanIp = candidates[0]?.ip || null;

  return NextResponse.json({
    lanIp,
    port: explicitPort,
    candidates,
    url: lanIp ? `http://${lanIp}:${explicitPort}` : null,
  });
}