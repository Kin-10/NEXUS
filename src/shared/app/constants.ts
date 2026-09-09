export const AppIpcChannel = {
  GetKeyfromAttribution: 'app:getKeyfromAttribution',
  GetAnalyticsDeviceInfo: 'app:getAnalyticsDeviceInfo',
  OpenSystemNotificationSettings: 'app:openSystemNotificationSettings',
} as const;

export type AppIpcChannel = (typeof AppIpcChannel)[keyof typeof AppIpcChannel];
