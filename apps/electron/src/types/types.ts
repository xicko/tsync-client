export type AppStateStatus = 'active' | 'inactive' | 'background';

export type TrayIconInterface = { type: 'default'; path: string } | { type: 'hidden'; path: string };
