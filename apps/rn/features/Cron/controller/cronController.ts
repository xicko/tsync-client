import { useDomainStore } from '@/store/domainStore';

export interface CronJobInfo {
  name: string;
  type: string;
  cronExpression: string;
  data: any;
  isActive: boolean;
  lastLog: {
    status: 'SUCCESS' | 'FAILED';
    createdAt: string;
    durationMs: number;
  } | null;
}

export async function getCrons(): Promise<CronJobInfo[]> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons`);
    if (res.ok) {
      const data = (await res.json()) as CronJobInfo[];
      return data;
    }
    return [];
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return [];
  }
}

export async function toggleCronState(cron: CronJobInfo): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons/${cron.name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cronExpression: cron.cronExpression,
        isActive: !cron.isActive,
      }),
    });
    return res.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

export async function triggerCronJob(cronName: string): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons/${cronName}/trigger`, {
      method: 'POST',
    });
    return res.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

export interface CreateCronPayload {
  name: string;
  type: string;
  cronExpression: string;
  data: any;
}

export async function createCronJobConfig(payload: CreateCronPayload): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

export async function deleteCronJobConfig(cronName: string): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons/${cronName}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

export async function reinitCronsSystem(): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  try {
    const res = await fetch(`${domain}/api/crons/reinit/system`, {
      method: 'POST',
    });
    return res.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}
