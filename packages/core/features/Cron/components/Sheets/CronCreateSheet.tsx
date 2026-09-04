import React, { useState } from 'react';
import ActionSheet, { SheetProps, SheetManager, ScrollView } from 'react-native-actions-sheet';
import { Button, Input, YStack, Text, XStack, useTheme } from 'tamagui';
import { useCreateCron } from '@/features/Cron/hooks/crons';
import { showToast } from '@/utils/toast';
import { Platform } from 'react-native';
import { ArrowLeft, Plus } from '@tamagui/lucide-icons';

const TYPES = ['REMINDER', 'COUNT', 'HEALTHCHECK'];

const INTERVALS = [
  { name: 'Every 10 Seconds', value: '*/10 * * * * *' },
  { name: 'Every 30 Seconds', value: '*/30 * * * * *' },
  { name: 'Every Minute', value: '* * * * *' },
  { name: 'Every 5 Minutes', value: '*/5 * * * *' },
  { name: 'Every 10 Minutes', value: '*/10 * * * *' },
  { name: 'Every 15 Minutes', value: '*/15 * * * *' },
  { name: 'Every 30 Minutes', value: '*/30 * * * *' },
  { name: 'Every Hour', value: '0 * * * *' },
  { name: 'Every 2 Hours', value: '0 */2 * * *' },
  { name: 'Every 6 Hours', value: '0 */6 * * *' },
  { name: 'Every 12 Hours', value: '0 */12 * * *' },
  { name: 'Every Day at Midnight', value: '0 0 * * *' },
  { name: 'Every Day at 8 AM', value: '0 8 * * *' },
  { name: 'Every Day at Noon', value: '0 12 * * *' },
  { name: 'Every Day at 6 PM', value: '0 18 * * *' },
  { name: 'Every Day at 11 PM', value: '0 23 * * *' },
  { name: 'Every Monday Midnight', value: '0 0 * * 1' },
  { name: 'Every 1st of Month', value: '0 0 1 * *' },
];

const CronCreateSheet: React.FC<SheetProps<'cron-create-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const createCronMutation = useCreateCron();

  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [interval, setInterval] = useState(INTERVALS[3].value);

  // Data inputs
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dataString, setDataString] = useState('');

  const handleCreate = () => {
    let parsedData = {};
    if (type === 'REMINDER') {
      parsedData = { message };
    } else if (type === 'HEALTHCHECK') {
      parsedData = { url };
    } else if (type === 'COUNT') {
      parsedData = { message, startDate };
    } else if (dataString.trim()) {
      try {
        parsedData = JSON.parse(dataString);
      } catch (e) {
        showToast({ text1: 'Invalid JSON Data string' });
        return;
      }
    }

    createCronMutation.mutate(
      {
        name,
        type,
        cronExpression: interval,
        data: parsedData,
      },
      {
        onSuccess: () => {
          showToast({ text1: 'Job created successfully' });
          SheetManager.hide(sheetId);
          setName('');
          setMessage('');
          setUrl('');
        },
        onError: () => showToast({ text1: 'Failed to create job' }),
      }
    );
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: theme.background.val }}>
      <ScrollView contentContainerStyle={{ gap: 14, padding: 24 }} keyboardShouldPersistTaps="handled">
        <Text fontWeight="bold" fontSize="$6">
          Create New Cron Job
        </Text>

        <YStack gap="$2">
          <Text fontSize="$3" color="$color10">
            Name
          </Text>
          <Input placeholder="Job Name (e.g. My Reminder)" value={name} onChangeText={setName} />
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$3" color="$color10">
            Job Type
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {TYPES.map((t) => (
              <Button key={t} size="$3" themeInverse={type === t} onPress={() => setType(t)}>
                {t}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$3" color="$color10">
            Interval
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {INTERVALS.map((i) => (
              <Button key={i.name} size="$3" themeInverse={interval === i.value} onPress={() => setInterval(i.value)}>
                {i.name}
              </Button>
            ))}
          </XStack>
          {/* Custom interval input */}
          <Input placeholder="Custom Cron (e.g. * * * * *)" value={interval} onChangeText={setInterval} mt="$2" />
        </YStack>

        {type === 'REMINDER' && (
          <YStack gap="$2">
            <Text fontSize="$3" color="$color10">
              Message
            </Text>
            <Input placeholder="Reminder message..." value={message} onChangeText={setMessage} />
          </YStack>
        )}

        {type === 'HEALTHCHECK' && (
          <YStack gap="$2">
            <Text fontSize="$3" color="$color10">
              URL to Check (e.g. health.example.com)
            </Text>
            <Input placeholder="http://example.com" value={url} onChangeText={setUrl} />
          </YStack>
        )}

        {type === 'COUNT' && (
          <YStack gap="$2">
            <Text fontSize="$3" color="$color10">
              Start Date (YYYY/MM/DD)
            </Text>
            <Input placeholder="2023/06/20" value={startDate} onChangeText={setStartDate} />
            <Text fontSize="$3" color="$color10">
              Message Suffix
            </Text>
            <Input placeholder="days since X" value={message} onChangeText={setMessage} />
          </YStack>
        )}

        {type === 'SHEETS' && (
          <YStack gap="$2">
            <Text fontSize="$3" color="$color10">
              Optional JSON Data
            </Text>
            <Input placeholder='{"key":"value"}' value={dataString} onChangeText={setDataString} />
          </YStack>
        )}

        <XStack gap="$3" mt="$4" mb={Platform.OS === 'ios' ? '$6' : '$4'}>
          <Button flex={1} icon={ArrowLeft} onPress={() => SheetManager.hide(sheetId)}>
            <Text>Cancel</Text>
          </Button>
          <Button flex={1} themeInverse icon={Plus} disabled={!name} onPress={handleCreate}>
            <Text>Create Job</Text>
          </Button>
        </XStack>
      </ScrollView>
    </ActionSheet>
  );
};

export default CronCreateSheet;
