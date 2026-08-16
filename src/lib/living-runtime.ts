import { touchZone, zoneGains, type TouchZone } from "./living-touch";

function damp(current: number, target: number, lambda: number, dt: number) {
  return target + (current - target) * Math.exp(-lambda * dt);
}

export const livingRuntime = {
  stroking: false,
  affect: 0,
  arousal: 0,
  zone: null as TouchZone | null,
  apply(
    x: number,
    y: number,
    z: number,
    genital: string | null,
    amount: number,
    amp: number,
  ): TouchZone {
    const zone = touchZone(x, y, z, genital);
    this.zone = zone;
    this.stroking = true;
    const gain = zoneGains(zone);
    const step = Math.max(0, amount) * Math.max(0, amp);
    this.affect = Math.min(1, this.affect + gain.affect * step);
    this.arousal = Math.min(1, this.arousal + gain.arousal * step);
    return zone;
  },
  release() {
    this.stroking = false;
  },
  decay(dt: number) {
    if (this.stroking) return;
    this.affect = damp(this.affect, 0, 0.55, dt);
    this.arousal = damp(this.arousal, 0, 0.22, dt);
    if (this.affect < 0.008) this.affect = 0;
    if (this.arousal < 0.008) this.arousal = 0;
    if (this.affect === 0 && this.arousal === 0) this.zone = null;
  },
};
