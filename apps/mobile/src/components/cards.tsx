import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { clubs, openMatches, dateAfter, dateLabel } from '@domain/fixtures';
import { money } from '@domain/model';
import { usePrototype } from '@/services/prototype';
import { Avatar, Body, Button, Card, Chip, Icon, Label, Row, s } from './ui';
import { CourtArt } from './art';
import { colors as c } from '@/theme/tokens';

export function ClubCard({ club }: { club: typeof clubs[number] }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Book ${club.name}, ${club.area}, ${money(club.price)} for 90 minutes`} onPress={() => router.push({ pathname: '/booking', params: { club: club.id } })} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
    <Card style={{ padding: 12 }}><View><CourtArt color={club.color} height={175} /><View style={{ position: 'absolute', left: 12, top: 12, backgroundColor: '#F6F7F1', borderRadius: 8, padding: 7 }}><Row style={{ gap: 4 }}><Icon name="star" size={12} /><Text style={{ fontSize: 11, fontWeight: '700', color: c.ink }}>{club.rating}</Text></Row></View></View>
      <View style={{ padding: 5, gap: 10 }}><Label>{club.tag}</Label><Text style={s.heading}>{club.name}</Text><Row><Icon name="map-pin" size={13} color={c.muted} /><Body muted>{club.area} · {club.distance}</Body></Row><Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: c.line, paddingTop: 11 }}><Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{money(club.price)}<Text style={{ color: c.muted, fontSize: 11, fontWeight: '400' }}> / 90 min</Text></Text><Row style={{ gap: 5 }}><Text style={{ fontSize: 11, color: c.green }}>{club.type}</Text><Icon name="arrow-up-right" size={17} /></Row></Row></View>
    </Card>
  </Pressable>;
}

export function MatchCard({ match }: { match: typeof openMatches[number] }) {
  const router = useRouter();
  const { state } = usePrototype();
  const club = clubs.find(c => c.id === match.clubId)!;
  const joined = state.joined.includes(match.id);
  return <Card><Row style={{ justifyContent: 'space-between' }}><Chip title={match.level} /><Label color={joined ? c.green : c.orange}>{joined ? 'YOU’RE IN' : `${match.capacity - match.players.length} OPEN ${match.capacity - match.players.length === 1 ? 'SPOT' : 'SPOTS'}`}</Label></Row><Text style={s.heading}>{match.title}</Text><Body muted>{club.name} · {dateLabel(dateAfter(match.day))}</Body><Row style={{ justifyContent: 'space-between' }}><Row><Icon name="clock" size={14} /><Body>{match.time} · 90 min</Body></Row><Text style={{ fontWeight: '700', color: c.ink }}>{money(match.share)}<Text style={{ fontSize: 11, fontWeight: '400' }}> / player</Text></Text></Row><Row style={{ justifyContent: 'space-between' }}><Row style={{ gap: 0 }}>{match.players.map((p, i) => <View key={p} style={{ marginLeft: i ? -10 : 0 }}><Avatar name={p} size={35} color={['#D5DDD0', '#EACAAE', '#C7D9E2'][i]} /></View>)}<Text style={{ color: c.muted, fontSize: 11, marginLeft: 8 }}>{match.players.length + (joined ? 1 : 0)}/4 players</Text></Row><Button title={joined ? 'Match details' : 'Join the game'} icon="arrow-up-right" variant="ghost" compact onPress={() => router.push({ pathname: '/match', params: { id: match.id } })} /></Row></Card>;
}
