import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { clubs, dateAfter, dateLabel, events } from '@domain/fixtures';
import { money } from '@domain/model';
import { Avatar, Body, Button, Card, Chip, DemoNote, Empty, Heading, Icon, Label, Row, Screen } from '@/components/ui';
import { CourtArt } from '@/components/art';
import { usePrototype } from '@/services/prototype';
import { colors as c } from '@/theme/tokens';

type Event = (typeof events)[number];
const formats = ['All events', 'Americano', 'Round-robin', 'Knockout'] as const;
const formatInfo = {
  Americano: { title: 'New round. New partner.', description: 'Players rotate partners between rounds and collect individual points. A sociable way to meet more of the club.', entry: 'One individual demo entry. Partner rotation is illustrated below, not generated.' },
  'Round-robin': { title: 'Every pairing has a story.', description: 'Teams meet the other teams in their group. A standings table makes it easy to follow an example group stage.', entry: 'One demo entry. Team formation and partner invitations are outside this prototype.' },
  Knockout: { title: 'One round at a time.', description: 'Winning teams progress through a draw toward the final. Every match brings a little more anticipation.', entry: 'One demo entry. A real event would require a partner; this prototype does not register or charge another player.' },
};

function FormatPreview({ format }: { format: Event['format'] }) {
  return <Card style={{ backgroundColor: c.soft }}>
    <Row><Icon name="git-branch" /><Label>PREVIEW · {format.toUpperCase()}</Label></Row>
    <Heading title={format === 'Knockout' ? 'A little tournament feeling' : 'How the day could unfold'} />
    <Body muted>Static, fictional examples only. Not live results, an actual participant list or a working scheduling algorithm. Registering does not change these examples.</Body>
    {format === 'Americano' && <>
      <Label>PREVIEW / INDIVIDUAL STANDINGS</Label>
      <Body muted>Four sample players after three example rounds. Points are illustrative.</Body>
      {[{ name: 'Ines', points: 58 }, { name: 'Sami', points: 52 }, { name: 'Nour', points: 46 }, { name: 'Adam', points: 36 }].map((player, index) => <Row key={player.name} style={styles.tableRow}>
        <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text><Avatar name={player.name} size={32} /><Body style={{ flex: 1, fontWeight: '600' }}>{player.name}</Body><Body>{player.points} pts</Body>
      </Row>)}
      <View style={styles.previewTile}><Label>PREVIEW / PARTNER ROTATION EXCERPT</Label><Body style={{ fontWeight: '600' }}>Round 1 · Court A</Body><Body>Ines + Sami vs Nour + Adam</Body><Body style={{ fontWeight: '600' }}>Round 2 · Court A</Body><Body>Ines + Nour vs Sami + Adam</Body><Body muted>Two example pairings only, not the full 16-player schedule.</Body></View>
    </>}
    {format === 'Round-robin' && <>
      <Label>PREVIEW / GROUP A STANDINGS</Label>
      <Body muted>Illustrative scoring: 3 points per win. A three-team group excerpt, not the full event.</Body>
      {[{ name: 'Olive Pair', record: '2 played · 2 wins', points: 6 }, { name: 'Coast Duo', record: '2 played · 1 win', points: 3 }, { name: 'Yard Partners', record: '2 played · 0 wins', points: 0 }].map((team, index) => <Row key={team.name} style={styles.tableRow}>
        <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text><View style={{ flex: 1 }}><Body style={{ fontWeight: '600' }}>{team.name}</Body><Body muted>{team.record}</Body></View><Body>{team.points} pts</Body>
      </Row>)}
      <View style={styles.previewTile}><Label>PREVIEW / EXAMPLE MATCHES</Label><Body>Olive Pair 6–3 Coast Duo</Body><Body>Coast Duo 6–4 Yard Partners</Body><Body>Olive Pair 6–2 Yard Partners</Body><Body muted>Prewritten scores to explain the format. No games have been played in this demo.</Body></View>
    </>}
    {format === 'Knockout' && <>
      <Label>PREVIEW / DRAW EXCERPT</Label>
      <Body muted>A four-team semifinal illustration, not the full event draw. No winners have been recorded.</Body>
      <View style={styles.previewTile}><Label>SEMIFINAL A · EXAMPLE</Label><Body style={{ fontWeight: '600' }}>Coast Duo</Body><Body muted>vs</Body><Body style={{ fontWeight: '600' }}>Olive Pair</Body></View>
      <View style={styles.previewTile}><Label>SEMIFINAL B · EXAMPLE</Label><Body style={{ fontWeight: '600' }}>Yard Partners</Body><Body muted>vs</Body><Body style={{ fontWeight: '600' }}>Palm Pair</Body></View>
      <Row style={{ justifyContent: 'center' }}><Icon name="arrow-down" color={c.muted} /></Row>
      <View style={[styles.previewTile, { backgroundColor: c.lime }]}><Label>FINAL · PREVIEW</Label><Body style={{ fontWeight: '700' }}>Winner of A vs Winner of B</Body><Body muted>Placeholder only · progression is not automated.</Body></View>
    </>}
  </Card>;
}

export default function EventsScreen() {
  const { state, act } = usePrototype();
  const [filter, setFilter] = useState<(typeof formats)[number]>('All events');
  const [selectedId, setSelectedId] = useState<Event['id']>('social');
  const [review, setReview] = useState(false);
  const [error, setError] = useState('');
  const event = events.find(item => item.id === selectedId)!;
  const club = clubs.find(item => item.id === event.clubId)!;
  const registered = state.registrations.includes(event.id);
  const remaining = event.capacity - event.registered - (registered ? 1 : 0);
  const info = formatInfo[event.format];
  const choose = (id: Event['id']) => {
    setSelectedId(id);
    setReview(false);
    setError('');
  };
  const changeFilter = (value: (typeof formats)[number]) => {
    setFilter(value);
    if (value !== 'All events') {
      const match = events.find(item => item.format === value);
      if (match) choose(match.id);
    }
  };
  const register = () => {
    const result = act({ type: 'register', id: event.id }, 'You’re on the demo list. Payment simulated; no real event entry.');
    setError(result.ok ? '' : result.error);
    if (result.ok) setReview(false);
  };

  return <Screen back title="More than a match" subtitle="Good people. A little competition. A day to remember.">
    <Card style={styles.hero}>
      <Row style={{ justifyContent: 'space-between' }}><Label color={c.lime}>THE CLUB CALENDAR</Label><Icon name="sun" color={c.lime} size={25} /></Row>
      <Text style={styles.heroTitle}>Show up for the game.{'\n'}Stay for the people.</Text>
      <Body style={{ color: '#DBE6D8' }}>From your first social to a friendly cup. Find your kind of court day.</Body>
      <Row><Chip title="3 demo events" /><Chip title="All good company" /></Row>
    </Card>
    <DemoNote>All events, people and clubs are fictional. Fees are simulated, dates are illustrative, and registration does not create a real event entry. Draws and standings are static previews.</DemoNote>
    <Heading title="Find your next court day" kicker="UPCOMING IN THE DEMO" />
    <Row>{formats.map(format => <Chip key={format} title={format} selected={filter === format} onPress={() => changeFilter(format)} />)}</Row>
    {events.filter(item => filter === 'All events' || item.format === filter).map(item => {
      const venue = clubs.find(value => value.id === item.clubId)!;
      const joined = state.registrations.includes(item.id);
      const spaces = item.capacity - item.registered - (joined ? 1 : 0);
      return <Card key={item.id} style={selectedId === item.id ? styles.selected : undefined}>
        <Row style={{ justifyContent: 'space-between' }}><View style={[styles.formatTag, { backgroundColor: item.color }]}><Label color={c.ink}>{item.format.toUpperCase()}</Label></View>{joined && <Icon name="check-circle" color={c.green} />}</Row>
        <Heading title={item.name} /><Body muted>{item.subtitle}</Body>
        <Row><Icon name="calendar" size={16} /><Body>{dateLabel(dateAfter(item.day))} · {item.time}</Body></Row>
        <Row><Icon name="map-pin" size={16} /><Body muted>{venue.name}</Body></Row>
        <Row style={{ justifyContent: 'space-between' }}><Text style={styles.price}>{money(item.fee)}<Text style={styles.priceSuffix}> / demo entry</Text></Text><Body muted>{spaces} demo places left</Body></Row>
        <Button title={selectedId === item.id ? 'Selected event · details below' : 'Explore event'} icon={selectedId === item.id ? 'check' : 'arrow-right'} variant={selectedId === item.id ? 'secondary' : 'ghost'} disabled={selectedId === item.id} onPress={() => choose(item.id)} />
      </Card>;
    })}

    <Card>
      <CourtArt height={160} color={club.color} />
      <Heading title={event.name} kicker="YOUR SELECTED EVENT" />
      <Row><Chip title={event.format} /><Chip title={registered ? 'Demo entry confirmed' : `${remaining} demo places left`} icon={registered ? 'check' : 'users'} /></Row>
      <Body style={{ fontSize: 19, fontWeight: '600' }}>{info.title}</Body>
      <Body muted>{info.description}</Body>
      <View style={styles.inset}>
        <Row><Icon name="calendar" size={17} /><View style={{ flex: 1 }}><Body>{dateLabel(dateAfter(event.day))} · {event.time}</Body><Body muted>Illustrative demo schedule</Body></View></Row>
        <Row><Icon name="map-pin" size={17} /><View style={{ flex: 1 }}><Body>{club.name}</Body><Body muted>{club.area} · fictional venue</Body></View></Row>
        <Row><Icon name="users" size={17} /><Body>{event.registered + (registered ? 1 : 0)} / {event.capacity} demo places</Body></Row>
      </View>
      <Body muted>{info.entry}</Body>
      {registered ? <View style={styles.inset}>
        <Row><Icon name="check-circle" color={c.green} /><Label color={c.green}>YOU’RE ON THE DEMO LIST</Label></Row>
        <Body>Your simulated {money(event.fee)} entry is recorded. Your receipt is below; no real payment or registration was made.</Body>
      </View> : <>
        <Row style={{ justifyContent: 'space-between' }}><Body style={{ fontWeight: '600' }}>Your demo entry fee</Body><Text style={styles.price}>{money(event.fee)}</Text></Row>
        {!review ? <Button title="Review demo entry" icon="arrow-right" onPress={() => setReview(true)} /> : <View style={{ gap: 13 }}>
          <Heading title="One place, all the good energy" />
          <Body>{state.name} · {event.name} · {money(event.fee)}</Body>
          <DemoNote>Confirming simulates this entry fee, with no real charge or card details. It adds one local demo registration, not a full team. No confirmation email is sent.</DemoNote>
          <Button title={`Simulate payment & register · ${money(event.fee)}`} icon="lock" onPress={register} />
          <Button title="Not just yet" variant="ghost" onPress={() => { setReview(false); setError(''); }} />
        </View>}
      </>}
      {!!error && <View accessibilityLiveRegion="polite"><Body style={{ color: c.danger }}>{error}</Body></View>}
    </Card>
    <FormatPreview format={event.format} />

    <Heading title="Your place in the day" kicker="DEMO REGISTRATION RECEIPTS" />
    {!state.registrations.length ? <Empty title="A good day is waiting" text="Register for a demo event to see your entry receipt here. No real payment is needed." icon="sun" /> : events.filter(item => state.registrations.includes(item.id)).map(item => <Card key={item.id}>
      <Row><Icon name="check-circle" color={c.green} /><Label color={c.green}>SIMULATED PAYMENT · REGISTERED</Label></Row>
      <Heading title={item.name} />
      <Body>{state.name} · one demo entry</Body>
      <Body muted>{dateLabel(dateAfter(item.day))} · {item.time} · {item.format}</Body>
      <Row style={{ justifyContent: 'space-between' }}><Body>Demo amount paid</Body><Text style={styles.price}>{money(item.fee)}</Text></Row>
      <Body muted>Local reference: DEMO-{item.id.toUpperCase()}</Body>
      <Body muted>No real ticket or charge. Your entry resets on reload and does not change the preview draw or standings.</Body>
      {selectedId !== item.id && <Button title="View event & format preview" variant="ghost" icon="arrow-right" onPress={() => { setFilter('All events'); choose(item.id); }} />}
    </Card>)}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: c.deep, borderColor: c.deep, padding: 25, gap: 18 },
  heroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 37, fontWeight: '600', letterSpacing: -1 },
  selected: { borderColor: c.green, borderWidth: 2 },
  formatTag: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9 },
  price: { fontSize: 22, fontWeight: '700', color: c.green, letterSpacing: -0.5 },
  priceSuffix: { fontSize: 12, fontWeight: '400', letterSpacing: 0, color: c.muted },
  inset: { backgroundColor: c.soft, padding: 16, borderRadius: 14, gap: 13 },
  tableRow: { borderBottomWidth: 1, borderBottomColor: c.line, paddingVertical: 12, flexWrap: 'nowrap' },
  rank: { fontSize: 12, fontWeight: '700', color: c.muted, width: 23 },
  previewTile: { padding: 16, borderRadius: 13, backgroundColor: c.surface, gap: 8 },
});
