import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ADHKAR from './adhkar';

const COLORS = {
  bg: '#F4F1EA',
  card: '#FFFFFF',
  primary: '#1F6F5C',
  primaryDark: '#164F42',
  text: '#222222',
  muted: '#7A7A7A',
  done: '#E3EFEA',
};

const initialCounts = () =>
  Object.fromEntries(ADHKAR.map((d) => [d.id, d.count]));

function DhikrCard({ item, remaining, onPress }) {
  const done = remaining === 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={done}
      style={({ pressed }) => [
        styles.card,
        done && styles.cardDone,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={[styles.dhikrText, done && styles.textDone]}>{item.text}</Text>
      <Text style={styles.source}>{item.source}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.repeat}>التكرار: {item.count}</Text>
        <View style={[styles.counter, done && styles.counterDone]}>
          <Text style={styles.counterText}>{done ? '✓' : remaining}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function App() {
  const [counts, setCounts] = useState(initialCounts);

  const completed = useMemo(
    () => ADHKAR.filter((d) => counts[d.id] === 0).length,
    [counts]
  );
  const progress = completed / ADHKAR.length;

  const decrement = (id) => {
    const next = Math.max(counts[id] - 1, 0);
    Vibration.vibrate(next === 0 ? 120 : 20);
    setCounts((prev) => ({ ...prev, [id]: Math.max(prev[id] - 1, 0) }));
  };

  const reset = () =>
    Alert.alert('إعادة البدء', 'هل تريد إعادة جميع العدادات؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'نعم', onPress: () => setCounts(initialCounts()) },
    ]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />

        <View style={styles.header}>
          <Text style={styles.title}>أذكار الصباح ☀️</Text>
          <Text style={styles.subtitle}>
            أنجزت {completed} من {ADHKAR.length}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <FlatList
          data={ADHKAR}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DhikrCard
              item={item}
              remaining={counts[item.id]}
              onPress={() => decrement(item.id)}
            />
          )}
          ListFooterComponent={
            <View>
              {completed === ADHKAR.length && (
                <Text style={styles.finished}>
                  تقبّل الله منك 🤲 أتممت أذكار الصباح
                </Text>
              )}
              <Pressable style={styles.resetButton} onPress={reset}>
                <Text style={styles.resetText}>إعادة البدء</Text>
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const rtl = { textAlign: 'right', writingDirection: 'rtl' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', ...rtl },
  subtitle: { color: '#D6EDE6', fontSize: 15, marginTop: 4, ...rtl },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
    marginTop: 12,
    overflow: 'hidden',
    transform: [{ scaleX: -1 }], // يمتلئ من اليمين إلى اليسار
  },
  progressFill: { height: '100%', backgroundColor: '#F2C94C' },
  list: { padding: 14, paddingBottom: 30, backgroundColor: COLORS.bg, flexGrow: 1 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDone: { backgroundColor: COLORS.done },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  dhikrText: { fontSize: 20, lineHeight: 38, color: COLORS.text, ...rtl },
  textDone: { color: COLORS.muted },
  source: { fontSize: 13, color: COLORS.muted, marginTop: 8, ...rtl },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  repeat: { fontSize: 14, color: COLORS.muted },
  counter: {
    minWidth: 56,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterDone: { backgroundColor: '#3BA37F' },
  counterText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  finished: {
    textAlign: 'center',
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  resetButton: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginTop: 6,
  },
  resetText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});
