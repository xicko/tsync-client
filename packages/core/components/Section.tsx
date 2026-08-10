import { View, Text } from 'tamagui';

interface Props {
  label: string;
  children: React.ReactNode;
}

export const Section: React.FC<Props> = ({ label, children }) => {
  return (
    <View gap="$2">
      <Text fontSize={'$3'} color={'$color9'}>
        {label}
      </Text>

      {children}
    </View>
  );
};
