import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { clubs, openMatches } from '@domain/fixtures';
import { usePrototype } from '@/services/prototype';
import { Body, Button, Card, DemoNote, Grid, Heading, Icon, Label, Row, Screen, type IconName } from '@/components/ui';
import { CourtArt } from '@/components/art';
import { ClubCard, MatchCard } from '@/components/cards';
import { colors as c } from '@/theme/tokens';

export default function Home() {
  const router = useRouter();
  const { state } = usePrototype();
  const wide = useWindowDimensions().width >= 800;
  const upcoming = state.bookings.filter(b => ['held', 'confirmed'].includes(b.status)).length + state.joined.length;
  const routes: { label: string; description: string; icon: IconName; path: '/play' | '/community' | '/coaches' | '/events'; color: string }[] = [
    { label: 'Find a court', description: 'Make time to play', icon: 'grid', path: '/play', color: c.lime },
    { label: 'Find your people', description: 'Good games start here', icon: 'users', path: '/community', color: '#EBCDB9' },
    { label: 'Level up', description: 'Learn with a coach', icon: 'trending-up', path: '/coaches', color: '#DCE7EB' },
    { label: 'Join an event', description: 'A little friendly rivalry', icon: 'award', path: '/events', color: '#E4DFEF' },
  ];
  return <Screen>
    <Row style={{ justifyContent: 'space-between' }}><View style={{ gap: 6 }}><Label>YOUR DAILY DOSE OF PADEL</Label><Text style={{ fontSize: 28, fontWeight: '600', letterSpacing: -1, color: c.ink }}>Hey {state.name}, let’s play.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="View my bookings" onPress={() => router.push('/bookings')} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}><Icon name="calendar" /></Pressable></Row>
    <View style={{ backgroundColor: c.deep, borderRadius: 25, overflow: 'hidden' }}>
      <View style={{ flexDirection: wide ? 'row' : 'column' }}><View style={{ padding: wide ? 32 : 25, gap: 19, flex: 1 }}><Row><View style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: c.lime }} /><Label color={c.lime}>LESS SCROLLING. MORE RALLIES.</Label></Row><Text style={{ color: '#F6F7ED', fontSize: wide ? 42 : 36, lineHeight: wide ? 47 : 41, letterSpacing: -1.7, fontWeight: '600' }}>Your next game.{"\n"}Your kind of people.</Text><Body style={{ color: '#BDCEC1', maxWidth: 350 }}>Find your court, bring your crew, or meet a new one. There’s always room for one more game.</Body><Button title="Find your next court" icon="arrow-up-right" variant="secondary" compact onPress={() => router.push('/play')} /></View><View style={{ width: wide ? '46%' : '100%', justifyContent: 'center', padding: wide ? 15 : 0 }}><CourtArt height={wide ? 325 : 185} color="#295C4B" /></View></View>
      <Row style={{ backgroundColor: '#204638', paddingVertical: 13, paddingHorizontal: 24, justifyContent: 'space-between' }}><Label color="#C8D5C3">TUNIS, TUNISIA</Label><Row style={{ gap: 5 }}><Icon name="sun" size={13} color={c.lime} /><Text style={{ fontSize: 11, color: '#DDE4D4' }}>Good days start on court</Text></Row></Row>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{routes.map(item => <Pressable key={item.path} accessibilityRole="button" onPress={() => router.push(item.path)} style={({ pressed }) => ({ width: wide ? '23.8%' : '48%', flexGrow: 1, opacity: pressed ? 0.7 : 1 })}><Card style={{ padding: 17, gap: 11, height: '100%' }}><Row style={{ justifyContent: 'space-between' }}><View style={{ width: 40, height: 40, backgroundColor: item.color, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={19} /></View><Icon name="arrow-up-right" color={c.muted} size={15} /></Row><Text style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>{item.label}</Text><Text style={{ fontSize: 11, color: c.muted }}>{item.description}</Text></Card></Pressable>)}</View>
    {upcoming > 0 && <Card style={{ backgroundColor: c.lime, borderColor: c.lime }}><Row style={{ justifyContent: 'space-between' }}><View style={{ gap: 5 }}><Label color={c.green}>YOUR NEXT RALLY</Label><Text style={{ color: c.ink, fontSize: 18, fontWeight: '600' }}>{upcoming} {upcoming === 1 ? 'game' : 'games'} on your radar</Text></View><Button title="My bookings" compact onPress={() => router.push('/bookings')} /></Row></Card>}
    {!state.onboarded && <Row style={{ padding: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BCC6AF', borderRadius: 15 }}><Icon name="user-plus" size={19} /><Body style={{ flex: 1 }}>A better match starts with you.</Body><Button title="Set up profile" compact variant="ghost" onPress={() => router.push('/profile')} /></Row>}
    <View style={{ gap: 13 }}><Heading title="Your new favorite court" kicker="CLOSE TO HOME" action="Explore all" onPress={() => router.push('/play')} /><Grid>{clubs.slice(0, 2).map(club => <ClubCard key={club.id} club={club} />)}</Grid></View>
    <View style={{ gap: 13 }}><Heading title="One player short. You?" kicker="OPEN MATCHES" action="See games" onPress={() => router.push({ pathname: '/play', params: { view: 'matches' } })} /><Grid>{openMatches.slice(0, 2).map(match => <MatchCard key={match.id} match={match} />)}</Grid></View>
    <DemoNote />
  </Screen>;
}
