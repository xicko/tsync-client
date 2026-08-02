<div align="center">

# tsync-client ✧\*:･ﾟ

**personal, tailscale-based cross-platform client for seamless device management.**

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black&style=flat-square)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo&logoColor=white&style=flat-square)](https://expo.dev/)
[![Tamagui](https://img.shields.io/badge/Tamagui-Premium_UI-FF69B4?style=flat-square)](https://tamagui.dev/)
[![Tailscale](https://img.shields.io/badge/Tailscale-Networking-4B23D1?logo=tailscale&logoColor=white&style=flat-square)](https://tailscale.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)

</div>

---

## features

- **real-time status**: access device statuses instantly across your tailnet.
- **smart notifications**: multi-channel push alerts via onesignal & ntfy.
- **android power user**:
  - enforce 99.9% tailscale uptime for reliable connectivity.
  - aggressive reconnection modes (root required).
  - remote control & terminal command execution (root required).
  - battery status retrieval
- **windows wol**: remotely wake devices using [local-wol](https://github.com/xicko/local-wol).
- **native cron jobs**: schedule reminders, day counters, and health checks.
- **tailnet broadcast**: send system-wide messages to all network devices.

---

## requirements

- **network**: a working [tailscale](https://tailscale.com) setup.
- **backend**: [tsync-server](https://github.com/xicko/tsync-server) instance.
- **push services**: [onesignal](https://onesignal.com/) account & [firebase](https://firebase.google.com/) project.

### environment setup

create a `.env` file in the root:

| Variable                      | Description              |
| :---------------------------- | :----------------------- |
| `EXPO_PUBLIC_BASE_API_URL`    | tsync-server endpoint    |
| `EXPO_PUBLIC_ONESIGNAL_APPID` | onesignal application id |

---

## project startup

1. **install dependencies**

   ```bash
   npm install
   ```

2. **prebuild expo native directories**

   ```bash
   npx expo prebuild
   ```

3. **ios setup (macOS only)**

   ```bash
   npx pod-install
   ```

4. **launch application**

   ```bash
   # android native
   npx expo run:android

   # ios native
   npx expo run:ios

   # start expo metro server
   npx expo start
   ```

---

> [!NOTE]
> this project is subject to changes; expect bugs and missing features while in active development.
