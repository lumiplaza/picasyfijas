import { Text, View, StyleSheet } from 'react-native';
import { colors, mono } from '@/constants/colors';

type AttemptRowProps = {
  index: number;
  guess: string;
  picas: number;
  fijas: number;
};

export function AttemptRow({ index, guess, picas, fijas }: AttemptRowProps) {
  const isWin = fijas === 4;
  const isClose = fijas === 3;

  return (
    <View
      style={[
        styles.row,
        isWin && styles.rowWin,
        isClose && styles.rowClose,
      ]}
    >
      <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>

      <View style={styles.digits}>
        {guess.split('').map((d, i) => (
          <View key={i} style={styles.digitBox}>
            <Text style={styles.digitText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.feedback}>
        <View style={[styles.pill, { backgroundColor: 'rgba(0,255,156,0.12)', borderColor: colors.fija }]}>
          <Text style={[styles.pillPrefix, { color: colors.fija }]}>F</Text>
          <Text style={[styles.pillValue, { color: colors.fija }]}>{fijas}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: 'rgba(255,176,32,0.12)', borderColor: colors.pica }]}>
          <Text style={[styles.pillPrefix, { color: colors.pica }]}>P</Text>
          <Text style={[styles.pillValue, { color: colors.pica }]}>{picas}</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowClose: {
    borderColor: 'rgba(255,176,32,0.5)',
    backgroundColor: 'rgba(255,176,32,0.04)',
  },
  rowWin: {
    borderColor: colors.fija,
    backgroundColor: 'rgba(0,255,156,0.08)',
    shadowColor: colors.fija,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  index: {
    color: colors.primary,
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    width: 28,
    letterSpacing: 1,
  },
  digits: { flexDirection: 'row', gap: 6 },
  digitBox: {
    width: 32,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
  },
  digitText: {
    color: colors.text,
    fontSize: 17,
    fontFamily: mono,
    fontWeight: '700',
  },
  feedback: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  pillPrefix: { fontFamily: mono, fontSize: 10, fontWeight: '700', opacity: 0.85 },
  pillValue: { fontFamily: mono, fontSize: 15, fontWeight: '800' },
});