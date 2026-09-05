import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PrototypeProvider, usePrototype } from '@/services/prototype';
import { Icon, Row } from '@/components/ui';
import { colors as c } from '@/theme/tokens';

function Shell() {
  const router = useRouter();
  const { state, notice, dismiss } = usePrototype();
  const offers = state.waitlist.filter(w => w.status === 'offered').length;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.background }}>
    <StatusBar style="dark" />
    <View style={styles.header}><Row style={styles.headerContent}>
      <Pressable accessibilityRole="button" accessibilityLabel="Court Club home" onPress={() => router.replace('/')} style={styles.brand}>
        <View style={styles.mark}><Icon name="grid" color={c.lime} size={22} /></View><View><Text style={styles.wordmark}>court club<Text style={{ color: c.orange }}>.</Text></Text><Text style={styles.prototype}>PADEL, TOGETHER · PROTOTYPE</Text></View>
      </Pressable>
      <Row style={{ gap: 5 }}><Pressable accessibilityRole="button" accessibilityLabel="Demo location: Tunis. Edit profile" onPress={() => router.push('/profile')} style={styles.location}><Icon name="map-pin" size={13} /><Text style={{ color: c.ink, fontSize: 12, fontWeight: '600' }}>Tunis</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Inbox, ${offers} waitlist offers`} onPress={() => router.push('/inbox')} style={styles.bell}><Icon name="bell" size={20} />{offers > 0 && <View style={styles.dot} />}</Pressable></Row>
    </Row></View>
    {state.scenario !== 'normal' && <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={styles.scenario}><Text style={{ color: c.danger, textAlign: 'center', fontSize: 12 }}>Demo scenario: {state.scenario.replaceAll('-', ' ')} · Manage in Profile</Text></Pressable>}
    {notice ? <Pressable accessibilityRole="button" accessibilityLabel={`${notice}. Dismiss notification`} onPress={dismiss} style={styles.notice}><Text accessibilityLiveRegion="polite" role="status" style={{ color: '#FFF', flex: 1, fontSize: 13, lineHeight: 20 }}>{notice}</Text><Icon name="x" size={18} color="#FFF" /></Pressable> : null}
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />
  </SafeAreaView>;
}

export default function RootLayout() {
  return <SafeAreaProvider><PrototypeProvider><Shell /></PrototypeProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.line },
  headerContent: { paddingHorizontal: 22, height: 77, maxWidth: 1040, width: '100%', alignSelf: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { backgroundColor: c.deep, width: 37, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: -1.2, color: c.ink },
  prototype: { color: c.muted, fontSize: 7, fontWeight: '700', letterSpacing: 1.2, marginTop: 3 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 5, backgroundColor: c.orange },
  scenario: { padding: 9, backgroundColor: '#F8E9E5' },
  notice: { paddingHorizontal: 22, paddingVertical: 14, backgroundColor: c.green, flexDirection: 'row', alignItems: 'center', gap: 14 },
});
