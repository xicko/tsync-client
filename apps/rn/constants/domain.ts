import Constants from 'expo-constants';

export const domain = Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_API_URL || '';

export const DOMAIN_KEY = 'domain';
