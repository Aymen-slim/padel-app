import React, { useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { clubs, slots, dateAfter, dateLabel } from '@domain/fixtures';
import { money, quote, type Booking } from '@domain/model';
import { usePrototype } from '@/services/prototype';
import { Body, Button, Card, Chip, DemoNote, Empty, Heading, Icon, Label, Row, Screen, s } from '@/components/ui';
import { CourtArt } from '@/components/art';
import { colors as c } from '@/theme/tokens';

export default function BookingScreen() {
  const params = useLocalSearchParams<{ club?: string }>();
  const club = clubs.find(c => c.id === params.club);
  const [date, setDate] = useState(dateAfter(1));
  const [time, setTime] = useState('18:30');
  const [mode, setMode] = useState<Booking['mode']>('private');
  const [rental, setRental] = useState(false);
  const { state, act, notify } = usePrototype();
  const router = useRouter();
  if (!club) return <Screen back><Empty title="Court not found" text="Choose one of our fictional clubs to start a demo booking." action="Explore courts" onPress={() => router.replace('/play')} /></Screen>;
  const pricing = quote(club.id, rental);
  const isTaken = (slot: string) => slot === '11:00' || state.bookings.some(b => b.clubId === club.id && b.date === date && b.time === slot && ['held', 'confirmed'].includes(b.status)) || state.waitlist.some(w => w.clubId === club.id && w.date === date && w.time === slot && w.status === 'offered');
  const selectedUnavailable = isTaken(time);
  const reserve = () => {
    const result = act({ type: 'hold', clubId: club.id, date, time, mode, rental });
    if (result.ok) router.push({ pathname: '/reservation', params: { id: result.state.bookings[0]!.id } });
  };
  const joinWaitlist = () => {
    const result = act({ type: 'waitlist', clubId: club.id, date, time }, 'You’re on the demo court waitlist. See My bookings for the offer simulation.');
    if (result.ok) router.push('/bookings');
  };
  return <Screen back>
    <CourtArt color={club.color} height={220} />
    <View style={{ gap: 10 }}><Row style={{ justifyContent: 'space-between' }}><Label>{club.tag}</Label><Chip title={`${club.rating} · Demo rating`} icon="star" /></Row><Text style={s.title}>{club.name}</Text><Row><Icon name="map-pin" size={14} /><Body muted>{club.area} · {club.distance} from demo location</Body></Row><Body>{club.description}</Body><Row><Chip title={club.type} icon="sun" /><Chip title={`${club.courts} courts`} icon="grid" /><Chip title="Equipment rental" icon="briefcase" /></Row></View>
    <Card><Heading title="Pick your moment" kicker="01 / COURT & TIME" /><DemoNote>This prototype books Court 1 only. Other courts are not modeled. The 11:00 slot is a fictional occupied slot for waitlist testing.</DemoNote><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{Array.from({ length: 7 }, (_, i) => dateAfter(i + 1)).map(day => <Pressable key={day} accessibilityRole="button" accessibilityLabel={dateLabel(day)} accessibilityState={{ selected: date === day }} onPress={() => setDate(day)} style={{ minWidth: 67, padding: 13, borderRadius: 13, alignItems: 'center', gap: 7, backgroundColor: date === day ? c.green : c.soft }}><Text style={{ fontSize: 11, color: date === day ? '#D1DDCC' : c.muted }}>{new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })}</Text><Text style={{ fontSize: 20, fontWeight: '600', color: date === day ? '#FFF' : c.ink }}>{Number(day.slice(-2))}</Text></Pressable>)}</ScrollView><Row style={{ gap: 8 }}>{slots.map(slot => <Pressable key={slot} accessibilityRole="button" accessibilityLabel={`${slot}, ${isTaken(slot) ? 'unavailable, join waitlist' : 'available'}`} accessibilityState={{ selected: time === slot }} onPress={() => setTime(slot)} style={{ width: '30%', flexGrow: 1, padding: 13, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: time === slot ? c.green : c.line, backgroundColor: time === slot ? c.lime : isTaken(slot) ? c.soft : c.surface, gap: 5 }}><Text style={{ fontSize: 15, fontWeight: '600', color: c.ink }}>{slot}</Text><Text style={{ fontSize: 10, color: c.muted }}>{isTaken(slot) ? 'Waitlist' : '90 minutes'}</Text></Pressable>)}</Row><Body muted>Venue time: Africa/Tunis. All sessions are 90 minutes.</Body></Card>
    <Card><Heading title="Who’s playing?" kicker="02 / MAKE IT YOUR GAME" /><Row><Chip title="Private match" selected={mode === 'private'} onPress={() => setMode('private')} icon="lock" /><Chip title="Open match" selected={mode === 'open'} onPress={() => setMode('open')} icon="users" /></Row><Body muted>{mode === 'private' ? 'Invite three players. Everyone pays their share within a 10-minute hold. The court confirms only when all four shares are paid.' : 'No full crew? Fund the whole court yourself, then leave three places open. Paid replacement and organizer reimbursement are preview-only, pending provider verification.'}</Body></Card>
    <Card><Heading title="Ready to rally" kicker="03 / THE LITTLE EXTRAS" /><Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><View style={{ flex: 1, gap: 4 }}><Body>Rent a racket</Body><Body muted>{money(8000)} · your personal add-on</Body></View><Switch accessibilityLabel="Add a racket rental for 8 TND" value={rental} onValueChange={setRental} trackColor={{ true: c.green, false: c.line }} thumbColor="#FFF" /></Row></Card>
    <Card style={{ backgroundColor: c.deep, borderColor: c.deep }}><Label color={c.lime}>YOUR GAME, ALL CLEAR</Label><Row style={{ justifyContent: 'space-between' }}><Body style={{ color: '#D0DCCE' }}>Court 1 · 90 minutes</Body><Body style={{ color: '#FFF' }}>{money(pricing.court)}</Body></Row>{rental && <Row style={{ justifyContent: 'space-between' }}><Body style={{ color: '#D0DCCE' }}>Your racket rental</Body><Body style={{ color: '#FFF' }}>{money(pricing.rental)}</Body></Row>}<Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#466456', paddingTop: 15 }}><Text style={{ fontSize: 20, color: '#FFF', fontWeight: '600' }}>Total</Text><Text style={{ fontSize: 26, color: c.lime, fontWeight: '600' }}>{money(pricing.total)}</Text></Row><Body style={{ color: '#BBD0BE' }}>{mode === 'private' ? `Your share: ${money(pricing.shares[0]!)}. Other players: ${money(pricing.shares[1]!)} each.` : `Organizer funds ${money(pricing.total)}. No automatic charges to anyone else.`}</Body><Button title={selectedUnavailable ? 'Join court waitlist' : 'Hold court · continue'} variant="secondary" icon={selectedUnavailable ? 'bell' : 'arrow-right'} onPress={selectedUnavailable ? joinWaitlist : reserve} /><Pressable accessibilityRole="button" onPress={() => notify('Demo policy: all cancellations receive a full simulated refund. Real clubs will set their own versioned cancellation deadlines and penalties.')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ fontSize: 12, color: '#D0DCCE', textAlign: 'center', textDecorationLine: 'underline' }}>View demo cancellation policy</Text></Pressable></Card>
    <DemoNote>Prices include all simulated charges. No real taxes, payment fees or court locks are applied. Payment is a local demonstration only.</DemoNote>
  </Screen>;
}
