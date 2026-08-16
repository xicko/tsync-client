import BatteryInfo from '@/features/Devices/components/BatteryInfo';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, H4, Separator, Text, View, XStack, YStack } from 'tamagui';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}
function formatLastSeen(lastSeen?: string): string {
  if (!lastSeen) return 'Never';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  children: React.ReactNode;
}
function Section({ title, children }: SectionProps) {
  return (
    <YStack gap="$2" mb="$4">
      <Text fontSize="$3" fontWeight="700" color="$color10" letterSpacing={1}>
        {title.toUpperCase()}
      </Text>
      <Separator />
      <YStack gap="$1" pt="$1">
        {children}
      </YStack>
    </YStack>
  );
}
interface RowProps {
  label: string;
  value: string | boolean | undefined | null;
}
function Row({ label, value }: RowProps) {
  const display =
    value === undefined || value === null ? '—' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—';
  return (
    <XStack justify="space-between" items="flex-start" gap="$2">
      <Text fontSize="$3" color="$color9" flex={1}>
        {label}
      </Text>
      <Text fontSize="$3" fontWeight="500" flex={2} style={{ textAlign: 'right' }}>
        {display}
      </Text>
    </XStack>
  );
}
interface ListRowProps {
  label: string;
  items: string[];
}
function ListRow({ label, items }: ListRowProps) {
  if (!items || items.length === 0) {
    return <Row label={label} value="None" />;
  }
  return (
    <YStack gap="$1">
      <Text fontSize="$3" color="$color9">
        {label}
      </Text>
      {items?.map((item) => (
        <Text key={item} fontSize="$3" fontWeight="500" pl="$2">
          • {item}
        </Text>
      ))}
    </YStack>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DeviceInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const selectedDevice = useDeviceStore((s) => s.selectedDevice);
  const router = useRouter();
  const [showRaw, setShowRaw] = useState(true);

  const toggleRaw = useCallback(() => setShowRaw((v) => !v), []);

  const d = selectedDevice;
  const clientSupports = d?.clientConnectivity?.clientSupports;
  const latencyEntries = Object.entries(d?.clientConnectivity?.latency ?? {});

  if (!selectedDevice || selectedDevice.id !== id) {
    return (
      <View flex={1} justify="center" items="center" bg="$background">
        <Text color="$color10">Device not found.</Text>
        <Button mt="$4" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  return (
    <View bg={'$background'} style={{ flex: 1 }}>
      {/* ── Header ── */}
      <XStack px="$4" py="$3" items="center" justify="space-between" borderBottomWidth={1} borderBottomColor="$color4">
        <YStack flex={1}>
          <H4 numberOfLines={1}>{d?.hostname}</H4>
          <Text fontSize="$2" color="$color10">
            {d?.user}
          </Text>
        </YStack>

        <YStack gap="$2" items="flex-end">
          {/* Active badge */}
          <View rounded="$2" px="$3" py="$1" bg={d?.isActive ? '$green3' : '$color4'}>
            <Text fontSize="$2" fontWeight="700" color={d?.isActive ? '$green10' : '$color10'}>
              {d?.isActive ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>

          {/* Raw toggle */}
          <Button size="$2" onPress={toggleRaw}>
            {showRaw ? 'Formatted' : 'Raw'}
          </Button>
        </YStack>
      </XStack>

      {/* ── Body ── */}
      {showRaw ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text fontSize="$2" color="$color11" select={'text'}>
            {JSON.stringify(d, null, 2)}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Identity */}
          <Section title="Identity">
            <Row label="Name" value={d?.name} />
            <Row label="Hostname" value={d?.hostname} />
            <Row label="Node ID" value={d?.nodeId} />
            <Row label="ID" value={d?.id} />
            <Row label="User" value={d?.user} />
            <Row label="OS" value={d?.os} />
            {d?.distro && (
              <>
                <Row label="Distro" value={d?.distro?.name} />
                <Row label="Distro version" value={d?.distro?.version} />
                <Row label="Code name" value={d?.distro?.codeName} />
              </>
            )}
          </Section>

          {/* Network */}
          <Section title="Network">
            <ListRow label="Addresses" items={d?.addresses ?? []} />
            <ListRow label="Enabled routes" items={d?.enabledRoutes ?? []} />
            <ListRow label="Advertised routes" items={d?.advertisedRoutes ?? []} />
          </Section>

          {/* Status */}
          <Section title="Status">
            <Row label="Active" value={d?.isActive} />
            <Row label="Connected to control" value={d?.connectedToControl} />
            <Row label="Authorized" value={d?.authorized} />
            <Row label="Ephemeral" value={d?.isEphemeral} />
            <Row label="External" value={d?.isExternal} />
            <Row label="Last seen" value={formatLastSeen(d?.lastSeen)} />
            <Row label="Last seen (raw)" value={d?.lastSeen} />
            <Row label="Created" value={formatDate(d?.created)} />
            <Row label="Key expires" value={formatDate(d?.expires)} />
            <Row label="Key expiry disabled" value={d?.keyExpiryDisabled} />
            {d ? <BatteryInfo item={d} /> : null}
          </Section>

          {/* Capabilities */}
          <Section title="Capabilities">
            <Row label="SSH enabled" value={d?.sshEnabled} />
            <Row label="Blocks incoming" value={d?.blocksIncomingConnections} />
            <Row label="Multiple connections" value={d?.multipleConnections} />
            <Row label="Update available" value={d?.updateAvailable} />
            <Row label="Client version" value={d?.clientVersion} />
          </Section>

          {/* Connectivity */}
          {d?.clientConnectivity && (
            <Section title="Connectivity">
              <Row label="Mapping varies by dest" value={d?.clientConnectivity?.mappingVariesByDestIP} />
              {clientSupports && (
                <>
                  <Row label="Hair-pinning" value={clientSupports?.hairPinning} />
                  <Row label="IPv6" value={clientSupports?.ipv6} />
                  <Row label="UDP" value={clientSupports?.udp} />
                  <Row label="UPnP" value={clientSupports?.upnp} />
                  <Row label="PCP" value={clientSupports?.pcp} />
                  <Row label="PMP" value={clientSupports?.pmp} />
                </>
              )}
              {latencyEntries?.length > 0 && (
                <YStack gap="$1">
                  <Text fontSize="$3" color="$color9">
                    Latency (DERP)
                  </Text>
                  {latencyEntries?.map(([region, info]) => (
                    <XStack key={region} justify="space-between" pl="$2">
                      <Text fontSize="$3">
                        {region}
                        {info?.preferred ? ' ★' : ''}
                      </Text>
                      <Text fontSize="$3" fontWeight="500">
                        {info?.latencyMs != null ? `${info.latencyMs!.toFixed(1)} ms` : '—'}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              )}
              <ListRow label="Endpoints" items={d?.clientConnectivity?.endpoints ?? []} />
            </Section>
          )}

          {/* Keys */}
          <Section title="Keys & Security">
            <Row label="Machine key" value={d?.machineKey} />
            <Row label="Node key" value={d?.nodeKey} />
            <Row label="Tailnet lock key" value={d?.tailnetLockKey || '—'} />
            <Row label="Tailnet lock error" value={d?.tailnetLockError || '—'} />
          </Section>

          {/* Tags */}
          {d?.tags && d?.tags?.length > 0 && (
            <Section title="Tags">
              <ListRow label="Tags" items={d?.tags ?? []} />
            </Section>
          )}

          {/* Posture identity */}
          {d?.postureIdentity && (
            <Section title="Posture Identity">
              <Row label="Disabled" value={d?.postureIdentity?.disabled} />
              <ListRow label="Serial numbers" items={d?.postureIdentity?.serialNumbers ?? []} />
            </Section>
          )}
        </ScrollView>
      )}
    </View>
  );
}
