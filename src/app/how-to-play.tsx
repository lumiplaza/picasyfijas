import { ScrollView, Text, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

type DigitChipProps = {
  value: string;
  highlight?: 'fija' | 'pica' | null;
};

function DigitChip({ value, highlight }: DigitChipProps) {
  return (
    <View
      style={[
        styles.chip,
        highlight === 'fija' && { borderColor: colors.fija, backgroundColor: colors.fija + '22' },
        highlight === 'pica' && { borderColor: colors.pica, backgroundColor: colors.pica + '22' },
      ]}
    >
      <Text style={styles.chipText}>{value}</Text>
    </View>
  );
}

function Row({ label, digits, highlights }: { label: string; digits: string; highlights?: Array<'fija' | 'pica' | null> }) {
  return (
    <View style={styles.rowExample}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowDigits}>
        {digits.split('').map((d, i) => (
          <DigitChip key={i} value={d} highlight={highlights?.[i] ?? null} />
        ))}
      </View>
    </View>
  );
}

export default function HowToPlay() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cómo jugar</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Objetivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objetivo</Text>
          <Text style={styles.paragraph}>
            Adivina el número secreto de 4 dígitos de tu oponente antes de que se te acaben los intentos.
          </Text>
        </View>

        {/* Reglas del número */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 El número secreto</Text>
          <Text style={styles.paragraph}>
            Tiene 4 dígitos y <Text style={styles.bold}>no se repiten</Text>. Ejemplos: 1234, 8059, 4736.
          </Text>
        </View>

        {/* Fijas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Fijas</Text>
          <Text style={styles.paragraph}>
            Un dígito es <Text style={styles.bold}>fija</Text> cuando está en la posición correcta.
          </Text>
          <View style={styles.exampleBox}>
            <Row label="Secreto" digits="1234" />
            <Row
              label="Intento"
              digits="1564"
              highlights={['fija', null, null, 'fija']}
            />
            <Text style={styles.exampleResult}>2 fijas (el 1 y el 4)</Text>
          </View>
        </View>

        {/* Picas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟡 Picas</Text>
          <Text style={styles.paragraph}>
            Un dígito es <Text style={styles.bold}>pica</Text> cuando existe en el secreto pero en otra posición.
          </Text>
          <View style={styles.exampleBox}>
            <Row label="Secreto" digits="1234" />
            <Row
              label="Intento"
              digits="2156"
              highlights={['pica', 'pica', null, null]}
            />
            <Text style={styles.exampleResult}>2 picas (el 1 y el 2)</Text>
          </View>
        </View>

        {/* Cómo ganar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Cómo ganar</Text>
          <Text style={styles.paragraph}>
            Ganas al conseguir <Text style={styles.bold}>4 fijas</Text>. Tienes un máximo de <Text style={styles.bold}>10 intentos</Text> en el modo solo. En el modo online, gana el primero en descubrir el número del otro.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { color: colors.textMuted, fontSize: 15 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: 24, paddingTop: 8 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  paragraph: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  bold: { color: colors.text, fontWeight: '700' },
  exampleBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  rowExample: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 12,
    width: 60,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowDigits: { flexDirection: 'row', gap: 6 },
  chip: {
    width: 32,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  exampleResult: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});