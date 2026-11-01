import { execAsync } from '../utils/exec-async';

export async function getBatteryNative(): Promise<{ level: number; isCharging: boolean } | null> {
  try {
    const { stdout } = await execAsync('pmset -g batt');
    const percentMatch = stdout.match(/(\d+)%/);
    if (!percentMatch) throw new Error('No battery');
    const level: number = parseInt(percentMatch[1], 10);
    const isCharging: boolean = stdout.includes('charging') && !stdout.includes('discharging');

    return { level, isCharging };
  } catch (err) {
    console.error('Failed to get battery status:', err);
    return null;
  }
}
