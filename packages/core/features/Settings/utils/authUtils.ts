import * as LocalAuthentication from 'expo-local-authentication';

export async function canLocalAuthenticate(): Promise<{ success: boolean; error?: string }> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) throw new Error('Device hardware not supported');

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const requiredTypes = [
      LocalAuthentication.AuthenticationType.FINGERPRINT,
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    ];
    if (supportedTypes.includes(requiredTypes[0]) || supportedTypes.includes(requiredTypes[1])) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) throw new Error('Device not enrolled for biometrics');

      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
      if (enrolledLevel !== LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG)
        throw new Error('Enrolled level not strong enough');

      return { success: true };
    } else throw Error('Insufficient authentication types');
  } catch (error: any) {
    if (error instanceof Error && __DEV__) console.error(error.message);
    return { success: false, error: error?.message };
  }
}

export async function localAuthenticate() {
  return (await LocalAuthentication.authenticateAsync()).success;
}
