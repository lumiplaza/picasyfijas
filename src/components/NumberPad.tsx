import { Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, mono } from '@/constants/colors';

type NumberPadProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function NumberPad({ value, onChange, onSubmit, disabled = false }: NumberPadProps) {
  const handleDigit = (d: string) => {
    if (disabled || value.length >= 4 || value.includes(d)) return;
    onChange(value + d);
  };
  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };
  const handleSubmit = () => {
    if (disabled || value.length !== 4) return;
    onSubmit();
  };

  const submitDisabled = disabled || value.length !== 4;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {DIGITS.map((d) => {
          const isDisabled = disabled || value.length >= 4 || value.includes(d);
          return (
            <Pressable
              key={d}
              onPress={() => handleDigit(d)}
              disabled={isDisabled}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.keyPressed,
                isDisabled && styles.keyDisabled,
              ]}
            >
              <Text style={styles.keyText}>{d}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={handleBackspace}
          disabled={disabled || value.length === 0}
          style={({ pressed }) => [
            styles.key,
            styles.keyGhost,
            pressed && styles.keyPressed,
            (disabled || value.length === 0) && styles.keyDisabled,
          ]}
        >
          <Text style={styles.keyGhostText}>⌫</Text>
        </Pressable>

        <Pressable onPress={handleSubmit} disabled={submitDisabled}>
          {({ pressed }) =>
            submitDisabled ? (
              <View style={[styles.key, styles.keySubmitDisabled]}>
                <Text style={styles.keySubmitDisabledText}>OK</Text>
              </View>
            ) : (
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.key, styles.keySubmit, styles.keySubmitGlow, pressed && styles.pressed]}
              >
                <Text style={styles.keySubmitText}>OK</Text>
              </LinearGradient>
            )
          }
        </Pressable>
      </View>
    </View>
  );
}

const KEY = 72;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  grid: {
    width: KEY * 3 + 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.overlay,
  },
  keyDisabled: { opacity: 0.2 },
  keyText: {
    color: colors.text,
    fontSize: 26,
    fontFamily: mono,
    fontWeight: '600',
  },
  keyGhost: { borderColor: colors.border },
  keyGhostText: { color: colors.textMuted, fontSize: 22, fontFamily: mono },
  keySubmit: { borderColor: 'transparent' },
  keySubmitGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  keySubmitDisabled: {
    backgroundColor: 'transparent',
    borderColor: colors.borderBright,
    opacity: 0.3,
  },
  keySubmitDisabledText: {
    color: colors.textMuted,
    fontSize: 18,
    fontFamily: mono,
    fontWeight: '800',
    letterSpacing: 1,
  },
  keySubmitText: {
    color: colors.background,
    fontSize: 18,
    fontFamily: mono,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pressed: { opacity: 0.85 },
});