import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';
import { players, levels } from '@domain/fixtures';
import { usePrototype } from '@/services/prototype';
import { Avatar, Body, Button, Card, Chip, DemoNote, Empty, Grid, Heading, Icon, Label, Row, Screen } from '@/components/ui';
import { colors as c } from '@/theme/tokens';

type Player = (typeof players)[number];
type Decision = 'connect' | 'pass' | 'block';

function DiscoveryCard({ player, decide, report }: { player: Player; decide: (type: Decision, player: Player) => void; report: (player: Player) => void }) {
  const x = useRef(new Animated.Value(0)).current;
  const vertical = useRef(false);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => { vertical.current = false; return false; },
    onMoveShouldSetPanResponder: (_, gesture) => {
      if (Math.abs(gesture.dy) > 10 && Math.abs(gesture.dy) >= Math.abs(gesture.dx)) vertical.current = true;
      return !vertical.current && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2;
    },
    onPanResponderMove: (_, gesture) => x.setValue(Math.max(-120, Math.min(120, gesture.dx))),
    onPanResponderRelease: (_, gesture) => {
      x.setValue(0);
      if (Math.abs(gesture.dx) > 80 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2) decide(gesture.dx > 0 ? 'connect' : 'pass', player);
    },
    onPanResponderTerminate: () => x.setValue(0),
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => false,
  }), [decide, player, x]);

  return <Card style={{ padding: 12, overflow: 'hidden' }}>
    <Animated.View {...responder.panHandlers} style={{ transform: [{ translateX: x }, { rotate: x.interpolate({ inputRange: [-120, 120], outputRange: ['-5deg', '5deg'] }) }] }}>
      <View style={{ minHeight: 245, backgroundColor: c.green, borderRadius: 15, padding: 22, justifyContent: 'space-between', gap: 24 }}>
        <Row style={{ justifyContent: 'space-between' }}><Label color={c.lime}>YOUR NEXT DOUBLES PARTNER?</Label><Icon name="sun" color={c.lime} size={25} /></Row>
        <View style={{ alignItems: 'center', gap: 12 }}><Avatar name={player.initials.split('').join(' ')} size={110} color={player.color} /><Body style={{ color: c.background, fontSize: 27, fontWeight: '700', lineHeight: 34 }}>{player.name}</Body></View>
        <Row style={{ justifyContent: 'space-between' }}><Body style={{ color: c.background }}>{player.area} · sample area</Body><Label color={c.lime}>FICTIONAL PLAYER</Label></Row>
      </View>
    </Animated.View>
    <View style={{ padding: 8, gap: 16 }}>
      <Row><Chip title={player.level} /><Chip title={player.side} /><Chip title={player.time} icon="clock" /></Row>
      <Body>{player.bio}</Body>
      <Body muted>{player.matches} sample matches · self-described level, not a verified rating.</Body>
      <Row><View style={{ flex: 1 }}><Button title={`Pass on ${player.name}`} variant="ghost" icon="x" onPress={() => decide('pass', player)} /></View><View style={{ flex: 1 }}><Button title={`Connect with ${player.name}`} variant="secondary" icon="user-plus" onPress={() => decide('connect', player)} /></View></Row>
      <Body muted style={{ fontSize: 12 }}>Swipe the portrait left to pass, right to connect. You can also use the buttons. Scroll vertically as usual.</Body>
      <Row><Button title={`Block ${player.name}`} variant="ghost" compact icon="slash" onPress={() => decide('block', player)} /><Button title={`Report ${player.name}`} variant="ghost" compact icon="flag" onPress={() => report(player)} /></Row>
    </View>
  </Card>;
}

export default function CommunityScreen() {
  const { state, act } = usePrototype();
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [level, setLevel] = useState('All levels');
  const [side, setSide] = useState('Any side');
  const [schedule, setSchedule] = useState('Any time');
  const [notice, setNotice] = useState('');
  const [reportTarget, setReportTarget] = useState<Player | null>(null);
  const [reason, setReason] = useState('Inappropriate behavior');
  const candidates = players.filter(player => !state.connected.includes(player.id) && !state.passed.includes(player.id) && !state.blocked.includes(player.id)
    && (level === 'All levels' || player.level === level) && (side === 'Any side' || player.side === side) && (schedule === 'Any time' || player.time === schedule));
  const connections = players.filter(player => state.connected.includes(player.id) && !state.blocked.includes(player.id));
  const blocked = players.filter(player => state.blocked.includes(player.id));
  const decide = (type: Decision, player: Player) => {
    const result = act({ type, id: player.id });
    setNotice(result.ok ? type === 'connect' ? `${player.name} added to your local connection requests. Nothing was sent or accepted; this does not unlock messaging.` : type === 'block' ? `${player.name} is hidden from discovery and removed from local connection requests. This demo block lasts until reset or reload.` : `${player.name} passed for this demo session.` : result.error);
  };
  const clearFilters = () => { setLevel('All levels'); setSide('Any side'); setSchedule('Any time'); };
  const first = candidates[0];

  return <Screen title="Find your people." subtitle="A shared love of the game is a good place to start.">
    <Row style={{ justifyContent: 'space-between' }}><Chip title="La Marsa & nearby · sample areas" icon="map-pin" /><Row><Chip title="Cards" icon="layers" selected={view === 'cards'} onPress={() => setView('cards')} /><Chip title="List" icon="list" selected={view === 'list'} onPress={() => setView('list')} /></Row></Row>
    <DemoNote>All players are fictional. Nearby areas are sample data, not your location. Connections stay in memory: no request is sent, no acceptance is simulated, and no real messaging is available.</DemoNote>
    <Card><Heading title="Your kind of game" kicker="DISCOVERY FILTERS" /><Label>LEVEL</Label><Row>{['All levels', ...levels].map(value => <Chip key={value} title={value} selected={level === value} onPress={() => setLevel(value)} />)}</Row><Label>PREFERRED SIDE</Label><Row>{['Any side', 'Left side', 'Right side', 'Either side'].map(value => <Chip key={value} title={value} selected={side === value} onPress={() => setSide(value)} />)}</Row><Label>WHEN YOU PLAY</Label><Row>{['Any time', 'Weekday evenings', 'Weekends'].map(value => <Chip key={value} title={value} selected={schedule === value} onPress={() => setSchedule(value)} />)}</Row><Button title="Clear filters" onPress={clearFilters} variant="ghost" compact /></Card>
    {notice !== '' && <View accessibilityLiveRegion="polite"><DemoNote>{notice}</DemoNote></View>}
    {reportTarget && <Card style={{ borderColor: c.orange }}><Heading title={`Report ${reportTarget.name}`} kicker="LOCAL DEMO ONLY" /><Body>No report will be submitted or reviewed. Please do not enter personal information.</Body><Row>{['Inappropriate behavior', 'Spam', 'Safety concern'].map(value => <Chip key={value} title={value} selected={reason === value} onPress={() => setReason(value)} />)}</Row><Row><Button title="Preview local report" icon="flag" compact onPress={() => { setNotice(`Local demo report preview: ${reportTarget.name} — ${reason}. Not submitted, stored on a server, or sent to a moderator. Use Block to hide this fictional player.`); setReportTarget(null); }} /><Button title="Cancel report" variant="ghost" compact onPress={() => setReportTarget(null)} /></Row></Card>}
    <Grid>
      <View style={{ gap: 16 }}><Heading title="Meet your next crew" kicker={`${candidates.length} FICTIONAL PLAYERS TO DISCOVER`} />
        {!first ? <Empty title="You're all caught up" text="Try different filters. Passed and blocked players stay hidden for this session; reset demo data in Profile or reload to start fresh." action="Clear filters" onPress={clearFilters} icon="users" />
          : view === 'cards' ? <DiscoveryCard key={first.id} player={first} decide={decide} report={setReportTarget} />
            : candidates.map(player => <Card key={player.id}><Row><Avatar name={player.initials.split('').join(' ')} size={58} color={player.color} /><View style={{ flex: 1 }}><Heading title={player.name} /><Body muted>{player.area} · fictional player</Body></View></Row><Row><Chip title={player.level} /><Chip title={player.side} /><Chip title={player.time} /></Row><Body>{player.bio}</Body><Row><Button title={`Pass on ${player.name}`} variant="ghost" compact onPress={() => decide('pass', player)} /><Button title={`Connect with ${player.name}`} variant="secondary" compact onPress={() => decide('connect', player)} /></Row><Row><Button title={`Block ${player.name}`} variant="ghost" compact onPress={() => decide('block', player)} /><Button title={`Report ${player.name}`} variant="ghost" compact onPress={() => setReportTarget(player)} /></Row></Card>)}
      </View>
      <View style={{ gap: 16 }}><Heading title="Your connections" kicker={`${connections.length} LOCAL REQUESTS`} /><Body muted>Saved interest, not an accepted connection. No direct messages are created.</Body>
        {connections.length === 0 ? <Empty title="Good games start here" text="Connect with a fictional player to keep a local request here. Nobody is contacted." icon="user-plus" /> : connections.map(player => <Card key={player.id}><Row><Avatar name={player.initials.split('').join(' ')} color={player.color} /><View style={{ flex: 1 }}><Heading title={player.name} /><Body muted>{player.level} · {player.area}</Body></View></Row><Chip title="Local request · not sent" icon="clock" /><Row><Button title={`Block ${player.name}`} variant="ghost" compact onPress={() => decide('block', player)} /><Button title={`Report ${player.name}`} variant="ghost" compact onPress={() => setReportTarget(player)} /></Row></Card>)}
        <Card style={{ backgroundColor: c.soft }}><Row><Icon name="shield" /><Heading title="Keep your circle comfortable" /></Row><Body muted>Block hides a player and removes their local connection request. Reports are previews only, not a real safety service.</Body><Body>{blocked.length} blocked · {state.passed.length} passed this session</Body>{blocked.length > 0 && <Body muted>Hidden: {blocked.map(player => player.name).join(', ')}. Reset in Profile or reload to clear blocks.</Body>}</Card>
      </View>
    </Grid>
  </Screen>;
}
