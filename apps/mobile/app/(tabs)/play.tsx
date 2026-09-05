import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { clubs, openMatches } from '@domain/fixtures';
import { Body, Button, Chip, DemoNote, Empty, Heading, Icon, Row, Screen, s } from '@/components/ui';
import { ClubCard, MatchCard } from '@/components/cards';
import { colors as c } from '@/theme/tokens';

export default function Play() {
  const params = useLocalSearchParams<{ view?: string }>();
  const [view, setView] = useState(params.view === 'matches' ? 'matches' : 'courts');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const router = useRouter();
  useEffect(() => { if (params.view === 'matches') setView('matches'); }, [params.view]);
  const filtered = clubs.filter(club => `${club.name} ${club.area}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || club.type === filter));
  const matches = openMatches.filter(match => `${match.title} ${clubs.find(c => c.id === match.clubId)?.name}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || match.level === filter));
  const switchView = (next: string) => { setView(next); setFilter('All'); setSearch(''); };
  return <Screen title="Make room for a game." subtitle="Your court, your crew, your next favorite ritual.">
    <Row><Chip title="Book a court" selected={view === 'courts'} onPress={() => switchView('courts')} icon="grid" /><Chip title="Open matches" selected={view === 'matches'} onPress={() => switchView('matches')} icon="users" /><Button title="My bookings" compact variant="ghost" onPress={() => router.push('/bookings')} /></Row>
    <Row style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingHorizontal: 14 }}><Icon name="search" color={c.muted} /><TextInput accessibilityLabel="Search clubs or matches" placeholder={view === 'courts' ? 'Search a club or neighborhood' : 'Search games or clubs'} placeholderTextColor={c.muted} value={search} onChangeText={setSearch} style={[s.input, { borderWidth: 0, flex: 1, minWidth: 100 }]} /></Row>
    <Row>{(view === 'courts' ? ['All', 'Outdoor', 'Indoor'] : ['All', 'Beginner', 'Intermediate', 'Advanced']).map(item => <Chip title={item} key={item} selected={filter === item} onPress={() => setFilter(item)} />)}</Row>
    <Heading title={view === 'courts' ? `${filtered.length} places to play` : `${matches.length} games to join`} kicker="TUNIS & NEARBY · DEMO LOCATIONS" />
    {view === 'courts' ? filtered.length ? <View style={{ gap: 18 }}>{filtered.map(club => <ClubCard key={club.id} club={club} />)}</View> : <Empty title="No courts found" text="Try another neighborhood or clear your filters." action="Clear filters" onPress={() => { setFilter('All'); setSearch(''); }} /> : matches.length ? <View style={{ gap: 14 }}>{matches.map(match => <MatchCard key={match.id} match={match} />)}</View> : <Empty title="No games found" text="Try another skill filter, or book a court and start an open game." action="Find a court" onPress={() => switchView('courts')} />}
    <Body muted>All court prices cover 90 minutes. Split equally between four players, or explicitly fund an open match.</Body><DemoNote>Availability is simulated on this device. No actual location permission or live club inventory is used.</DemoNote>
  </Screen>;
}
