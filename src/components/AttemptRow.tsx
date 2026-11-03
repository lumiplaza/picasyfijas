import { Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

type AttemptRowProps = {
  index: number;
  guess: string;
  picas: number;
  fijas: number;
};

export function AttemptRow({ index, guess, picas, fijas }: AttemptRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.index}>#{index + 1}</Text>

      <View style={styles.digits}>
        {guess.split('').map((d, i) => (
          <View key={i} style={styles.digitBox}>
            <Text style={styles.digitText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.feedback}>
        <View style={styles.badge}>
          <Text style={[styles.badgeValue, { color: colors.fija }]}>{fijas}</Text>
          <Text style={styles.badgeLabel}>Fijas</Text>
        </View>
        <View style={styles.badge}>
          <Text style={[styles.badgeValue, { color: colors.pica }]}>{picas}</Text>
          <Text style={styles.badgeLabel}>Picas</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  index: { color: colors.textMuted, width: 36, fontSize: 13 },
  digits: { flexDirection: 'row', gap: 6 },
  digitBox: {
    width: 32,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  digitText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  feedback: { flexDirection: 'row', gap: 14 },
  badge: { alignItems: 'center' },
  badgeValue: { fontSize: 18, fontWeight: '700' },
  badgeLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});