import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { levels } from '@domain/fixtures';
import { money, type Scenario } from '@domain/model';
import { usePrototype } from '@/services/prototype';
import { Avatar, Body, Button, Card, Chip, DemoNote, Field, Grid, Heading, Icon, Label, Row, Screen } from '@/components/ui';
import { colors as c } from '@/theme/tokens';

const scenarios: { id: Scenario; title: string; description: string }[] = [
  { id: 'normal', title: 'Normal', description: 'Explore the happy path. Payments, bookings and eligible match messages are simulated locally; nothing is sent or charged.' },
  { id: 'payment-failure', title: 'Payment failure', description: 'Demo payments fail for court shares, match joins, shop checkout, coaching and event registration. No payment is recorded. Switch to Normal to retry.' },
  { id: 'offline', title: 'Offline', description: 'Simulate an unavailable connection. Booking, connect, checkout and message actions are blocked. Profile editing, passing and blocking still work. This does not change your device network.' },
  { id: 'message-failure', title: 'Message failure', description: 'Sending in an eligible demo match chat fails. Other actions still work. Switch to Normal and retry your message; no real messages are ever sent.' },
];

function LocalSetting({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return <Row style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}><View style={{ flex: 1, gap: 4 }}><Body style={{ fontWeight: '600' }}>{title}</Body><Body muted style={{ fontSize: 12 }}>{description}</Body></View><Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ false: c.line, true: c.green }} thumbColor={value ? c.lime : c.surface} /></Row>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { state, act } = usePrototype();
  const [name, setName] = useState(state.name);
  const [level, setLevel] = useState(state.level);
  const [side, setSide] = useState(state.side);
  const [feedback, setFeedback] = useState('');
  const [discoverable, setDiscoverable] = useState(false);
  const [sampleLocation, setSampleLocation] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showExport, setShowExport] = useState(false);
  useEffect(() => { setName(state.name); setLevel(state.level); setSide(state.side); }, [state.name, state.level, state.side]);
  const activeBookings = state.bookings.filter(booking => booking.status === 'held' || booking.status === 'confirmed');
  const confirmedBookings = state.bookings.filter(booking => booking.status === 'confirmed');
  const orderTotal = state.orders.reduce((sum, order) => sum + order.total, 0);
  const messageCount = Object.values(state.messages).reduce((sum, messages) => sum + messages.filter(message => message.mine).length, 0);
  const summary = [
    'COURT CLUB — LOCAL DEMO SUMMARY',
    'In-memory prototype only. Reload resets all demo data.',
    'No real bookings, payments, messages or account records.',
    'Personal names, message text and listing titles are omitted.',
    '',
    `Profile setup: ${state.onboarded ? 'saved' : 'not completed'}`,
    `Self-selected skill: ${state.level}; preferred side: ${state.side}`,
    `Scenario: ${state.scenario}`,
    `Booking records: ${state.bookings.length}; active: ${activeBookings.length}; confirmed: ${confirmedBookings.length}`,
    `Open matches joined: ${state.joined.length}; waitlist entries: ${state.waitlist.length}`,
    `Coaching sessions: ${state.lessons.length}; event registrations: ${state.registrations.length}`,
    `Demo orders: ${state.orders.length}; simulated order total: ${money(orderTotal)}`,
    `Items in bag: ${Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0)}; resale listings: ${state.listings.length}`,
    `Local connection requests, not sent: ${state.connected.length}; passed: ${state.passed.length}; blocked: ${state.blocked.length}`,
    `Your simulated messages: ${messageCount}`,
    `Local discoverability preference: ${discoverable ? 'on' : 'off'}; sample location preference: ${sampleLocation ? 'on' : 'off'}`,
    'Career stats, badges and coaching assessment are illustrative samples, not earned results.',
  ].join('\n');
  const save = () => {
    const result = act({ type: 'profile', name, level, side });
    setFeedback(result.ok ? 'Demo profile saved for this session. Your self-selected level is used by match filters, not a competitive rating. Reload resets it.' : result.error);
  };
  const reset = () => {
    const result = act({ type: 'reset' });
    if (!result.ok) { setFeedback(result.error); return; }
    setName(result.state.name); setLevel(result.state.level); setSide(result.state.side);
    setDiscoverable(false); setSampleLocation(false); setShowExport(false); setConfirmReset(false);
    setFeedback('Demo data reset. You are back to Alex, Intermediate, Right side, in the Normal scenario. No real account or files were deleted.');
  };

  return <Screen title="Your court, your story." subtitle="A little about you. A lot more games ahead.">
    <Card style={{ backgroundColor: c.green, borderColor: c.green, padding: 25 }}>
      <Row style={{ gap: 20 }}><Avatar name={state.name} size={82} color={c.lime} /><View style={{ flex: 1, minWidth: 150, gap: 7 }}><Label color={c.lime}>YOUR DEMO PLAYER PROFILE</Label><Body style={{ color: c.background, fontSize: 30, lineHeight: 38, fontWeight: '700' }}>{state.name}</Body><Body style={{ color: c.background }}>{state.level} · {state.side}</Body></View><Icon name="sun" size={32} color={c.lime} /></Row>
      <Body style={{ color: c.background, fontSize: 12 }}>Self-selected skill · no verified competitive rating</Body>
    </Card>
    <DemoNote>This is an in-memory prototype, not a real account. All changes reset on reload. Use a fictional name; no real location permissions, payments or messages are requested.</DemoNote>
    {feedback !== '' && <View accessibilityLiveRegion="polite"><DemoNote>{feedback}</DemoNote></View>}
    <Grid>
      <Card><Heading title={state.onboarded ? 'Make it yours' : 'Let’s set up your game'} kicker={state.onboarded ? 'EDIT DEMO PROFILE' : 'QUICK DEMO ONBOARDING'} /><Body muted>A name, your comfort level and your favorite side. That’s all you need for this demo.</Body><Field label="Demo display name" value={name} onChangeText={setName} maxLength={40} autoCapitalize="words" autoCorrect={false} placeholder="Alex" /><Label>SELF-SELECTED SKILL</Label><Row>{levels.map(value => <Chip key={value} title={value} selected={level === value} onPress={() => setLevel(value)} />)}</Row><Label>PREFERRED SIDE</Label><Row>{['Left side', 'Right side', 'Either side'].map(value => <Chip key={value} title={value} selected={side === value} onPress={() => setSide(value)} />)}</Row><Body muted style={{ fontSize: 12 }}>Use 2–40 characters for your name. Skill is self-reported and helps match you to demo games; it is not a ranking or coaching assessment.</Body><Button title="Save demo profile" icon="check" onPress={save} /></Card>
      <View style={{ gap: 16 }}>
        <Card><Heading title="Your game, at a glance" kicker="SAMPLE CAREER · NOT LIVE DATA" /><Row style={{ justifyContent: 'space-between', gap: 20 }}>{[{ value: '24', label: 'MATCHES' }, { value: '16', label: 'WINS' }, { value: '8', label: 'CLUB VISITS' }].map(stat => <View key={stat.label} style={{ gap: 5 }}><Body style={{ fontSize: 32, lineHeight: 40, fontWeight: '700' }}>{stat.value}</Body><Label>{stat.label}</Label></View>)}</Row><Body muted>Illustrative numbers only. These are not your results and do not change when you book.</Body><Row><Chip title="SAMPLE · Rally regular" icon="award" /><Chip title="SAMPLE · Good sport" icon="heart" /></Row><Body muted style={{ fontSize: 12 }}>Badge examples, not earned achievements.</Body></Card>
        <Card style={{ backgroundColor: c.soft }}><Heading title="Small steps. Better rallies." kicker="SAMPLE COACHING ASSESSMENT" /><Body>Example focus: steady your backhand return and recover to the net together. Try ten minutes of controlled volleys before your next game.</Body><Body muted>No coach has assessed you. This sample feedback is separate from your self-selected skill and any competitive rating. Competitive rating: not available in this prototype.</Body><Button title="Explore coaching" icon="arrow-up-right" variant="ghost" onPress={() => router.push('/coaches')} /></Card>
      </View>
    </Grid>
    <Heading title="Your demo activity" kicker="LIVE COUNTS · THIS SESSION ONLY" />
    <Grid><Card><Row><Icon name="calendar" /><Label>COURT TIME</Label></Row><Heading title={`${activeBookings.length} active demo bookings`} /><Body muted>{confirmedBookings.length} confirmed · {activeBookings.length - confirmedBookings.length} held · {state.bookings.length} total booking records</Body><Body muted>{state.joined.length} open matches joined · {state.waitlist.length} waitlist entries</Body><Button title="View bookings" variant="ghost" onPress={() => router.push('/bookings')} /></Card><Card><Row><Icon name="shopping-bag" /><Label>OFF THE COURT</Label></Row><Heading title={`${state.orders.length} demo orders`} /><Body muted>{money(orderTotal)} simulated order total · no real charge</Body><Body muted>{state.lessons.length} coaching sessions · {state.registrations.length} event registrations · {state.listings.length} resale listings</Body><Button title="Explore events" variant="ghost" onPress={() => router.push('/events')} /></Card></Grid>
    <Card><Row style={{ justifyContent: 'space-between' }}><View style={{ flex: 1, gap: 6 }}><Heading title="Stay in the loop" /><Body muted>{state.connected.length} local connection requests, not sent. Demo chat is only for eligible match participants, never direct messaging to discovered players.</Body></View><Button title="Open inbox" icon="message-circle" compact onPress={() => router.push('/inbox')} /></Row></Card>
    <Grid>
      <Card><Heading title="Privacy, on your terms" kicker="LOCAL PREFERENCES ONLY" /><LocalSetting title="Demo discoverability preference" description="Stores a preference on this screen only. Your profile is never published and nobody can discover you." value={discoverable} onChange={setDiscoverable} /><LocalSetting title="Use sample nearby area" description="Preview preference for La Marsa. Discovery always uses fictional areas; no GPS, tracking or device permission is requested." value={sampleLocation} onChange={setSampleLocation} /><DemoNote>These switches do not control a real privacy service or device setting. They stay in memory and reset with demo data or reload.</DemoNote></Card>
      <Card><Heading title="Try another path" kicker="PROTOTYPE SCENARIOS" /><Body muted>Choose a scenario to exercise the shared demo state across the app. Return to Normal to recover.</Body><Row>{scenarios.map(scenario => <Chip key={scenario.id} title={scenario.title} selected={state.scenario === scenario.id} onPress={() => { const result = act({ type: 'scenario', scenario: scenario.id }); setFeedback(result.ok ? `${scenario.title} scenario is now active across the demo.` : result.error); }} />)}</Row>{scenarios.map(scenario => <View key={scenario.id} style={{ gap: 5, padding: 12, borderRadius: 12, backgroundColor: state.scenario === scenario.id ? c.soft : c.surface }}><Body style={{ fontWeight: '700' }}>{state.scenario === scenario.id ? 'Active · ' : ''}{scenario.title}</Body><Body muted style={{ fontSize: 12 }}>{scenario.description}</Body></View>)}</Card>
    </Grid>
    <Card><Heading title="Your demo data" kicker="NOT A REAL ACCOUNT" /><Body muted>Preview a readable export summary or start again. No files are persisted, and there is no real account to delete.</Body><Row><Button title={showExport ? 'Hide export summary' : 'Show export summary'} icon="file-text" variant="ghost" compact onPress={() => setShowExport(value => !value)} /><Button title="Reset demo data" icon="refresh-ccw" variant="danger" compact onPress={() => setConfirmReset(true)} /></Row>
      {showExport && <View style={{ gap: 12, padding: 16, borderRadius: 12, backgroundColor: c.soft }}><Label>READABLE LOCAL EXPORT</Label><Body muted>Select and copy the text below if you want to keep a summary. Nothing is uploaded, downloaded or written to a file automatically. Names and free-text content are excluded.</Body><Text selectable accessibilityLabel="Local demo data summary" style={{ color: c.ink, fontSize: 13, lineHeight: 23 }}>{summary}</Text></View>}
      {confirmReset && <View style={{ borderWidth: 1, borderColor: c.danger, borderRadius: 14, padding: 16, gap: 12 }}><Heading title="Reset this demo session?" /><Body>This clears your demo profile, bookings, match joins, messages, connection requests, blocks, bag, orders, coaching, registrations, listings and local preferences. It returns the scenario to Normal. This cannot be undone; no real account is deleted.</Body><Row><Button title="Yes, reset all demo data" variant="danger" compact onPress={reset} /><Button title="Keep my demo data" variant="ghost" compact onPress={() => setConfirmReset(false)} /></Row></View>}
    </Card>
  </Screen>;
}
