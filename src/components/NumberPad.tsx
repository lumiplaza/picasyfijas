import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

type NumberPadProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function NumberPad({ value, onChange, onSubmit, disabled = false }: NumberPadProps) {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= 4) return;
    if (value.includes(digit)) return; // sin repetidos
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (value.length !== 4) return;
    onSubmit();
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {DIGITS.map((d) => (
          <Pressable
            key={d}
            onPress={() => handleDigit(d)}
            disabled={disabled || value.length >= 4 || value.includes(d)}
            style={({ pressed }) => [
              styles.key,
              pressed && styles.keyPressed,
              (disabled || value.length >= 4 || value.includes(d)) && styles.keyDisabled,
            ]}
          >
            <Text style={styles.keyText}>{d}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={handleBackspace}
          disabled={disabled || value.length === 0}
          style={({ pressed }) => [
            styles.key,
            styles.keyAction,
            pressed && styles.keyPressed,
            (disabled || value.length === 0) && styles.keyDisabled,
          ]}
        >
          <Text style={styles.keyActionText}>⌫</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={disabled || value.length !== 4}
          style={({ pressed }) => [
            styles.key,
            styles.keySubmit,
            pressed && styles.keyPressed,
            (disabled || value.length !== 4) && styles.keyDisabled,
          ]}
        >
          <Text style={styles.keySubmitText}>OK</Text>
        </Pressable>
      </View>
    </View>
  );
}

const KEY_SIZE = 68;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12 },
  grid: {
    width: KEY_SIZE * 3 + 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  keyDisabled: { opacity: 0.3 },
  keyText: { color: colors.text, fontSize: 26, fontWeight: '600' },
  keyAction: { backgroundColor: colors.danger + '33' },
  keyActionText: { color: colors.danger, fontSize: 24, fontWeight: '700' },
  keySubmit: { backgroundColor: colors.primary },
  keySubmitText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});