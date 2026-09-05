import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { clubs, coaches } from '@domain/fixtures';
import { money } from '@domain/model';
import { Avatar, Body, Button, Card, Chip, DemoNote, Empty, Heading, Icon, Label, Row, Screen } from '@/components/ui';
import { CourtArt } from '@/components/art';
import { usePrototype } from '@/services/prototype';
import { colors as c } from '@/theme/tokens';

const sessionKinds = [
  { name: 'Private', multiplier: 1, detail: 'One-to-one attention, built around your game.' },
  { name: 'Semi-private', multiplier: 0.65, detail: 'A shared session for two. The fee shown is your demo place only.' },
  { name: 'Clinic', multiplier: 0.4, detail: 'Learn together in a group. The fee shown is your demo place only.' },
] as const;
const times = ['Tomorrow · 10:00', 'Tomorrow · 14:00', 'Saturday · 09:00'] as const;
const samples = {
  nour: [
    { title: 'Find your ready position', text: '3 × 60 seconds of split-step practice. Land softly and reset before the next feed.' },
    { title: 'Let the glass help', text: '10 gentle feeds off the back glass. Give yourself space, let the ball come to you.' },
    { title: 'A note to take away', text: 'Build the habit before adding pace. A calm preparation gives you more choices.' },
  ],
  karim: [
    { title: 'Own the middle together', text: '3 × 8 controlled volleys. Move with your partner and recover as a pair.' },
    { title: 'Place the bandeja', text: '12 easy overhead feeds. Aim deep, keep the rhythm, recover to your position.' },
    { title: 'A note to take away', text: 'Win space before trying to win the point. Placement is a better starting point than power.' },
  ],
};

export default function CoachesScreen() {
  const { state, act } = usePrototype();
  const [coachId, setCoachId] = useState<(typeof coaches)[number]['id']>('nour');
  const [kind, setKind] = useState<(typeof sessionKinds)[number]['name']>('Private');
  const [time, setTime] = useState<(typeof times)[number] | null>(null);
  const [reelOpen, setReelOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [error, setError] = useState('');
  const coach = coaches.find(item => item.id === coachId)!;
  const club = clubs.find(item => item.id === coach.clubId)!;
  const session = sessionKinds.find(item => item.name === kind)!;
  const fee = Math.round(coach.price * session.multiplier);
  const reserved = state.lessons.some(lesson => lesson.coachId === coachId && lesson.time === time);
  const selectCoach = (id: (typeof coaches)[number]['id']) => {
    setCoachId(id);
    setTime(null);
    setReelOpen(false);
    setSampleOpen(false);
    setError('');
  };
  const book = () => {
    if (!time) return;
    const result = act({ type: 'lesson', coachId, kind, time }, 'Demo coaching session booked. No real payment or reservation.');
    setError(result.ok ? '' : result.error);
  };

  return <Screen back title="Find your next level" subtitle="A little guidance. A more confident game.">
    <Card style={styles.hero}>
      <Label color={c.lime}>GOOD HABITS START HERE</Label>
      <Text style={styles.heroTitle}>Your game,{'\n'}with a little guidance.</Text>
      <Body style={{ color: '#DBE6D8' }}>Meet the people who make learning feel like playing.</Body>
      <Row><Avatar name="Nour Ben Ali" color="#D5DDD0" /><Avatar name="Karim Mansour" color="#EACAAE" /><Body style={{ color: c.lime, flex: 1 }}>Two fictional coaches. Plenty to explore.</Body></Row>
    </Card>
    <DemoNote>Fictional coaches, credentials and availability. Booking and payments are simulated. No real session is reserved and no coach is contacted.</DemoNote>
    <Heading title="Find your fit" kicker="THE COACHING CORNER" />
    {coaches.map(item => <Card key={item.id} style={coachId === item.id ? styles.selected : undefined}>
      <Row style={{ alignItems: 'flex-start' }}><Avatar name={item.name} size={65} color={item.color} /><View style={{ flex: 1, gap: 7 }}><Label>{item.experience.toUpperCase()} · SAMPLE</Label><Heading title={item.name} /><Body muted>{item.specialty}</Body></View></Row>
      <Row><Chip title={item.level} /><Body muted>{money(item.price)} private</Body></Row>
      <Button title={coachId === item.id ? 'Selected coach · details below' : `Explore ${item.name.split(' ')[0]}'s sessions`} variant={coachId === item.id ? 'secondary' : 'ghost'} icon={coachId === item.id ? 'check' : 'arrow-right'} disabled={coachId === item.id} onPress={() => selectCoach(item.id)} />
    </Card>)}

    <Card>
      <CourtArt height={145} color={club.color} />
      <Heading title={`Meet ${coach.name.split(' ')[0]}`} kicker="YOUR SELECTED COACH" />
      <Body>{coach.bio}</Body>
      <Row><Icon name="map-pin" size={16} /><Body muted>{club.name} · {club.area}</Body></Row>
      <Row><Icon name="award" size={16} /><Body muted>{coach.credential} · not verified</Body></Row>
      <View style={styles.inset}>
        <Row><Icon name="film" /><Label>INTRO REEL · STORYBOARD ONLY</Label></Row>
        <Body muted>A peek at the intended introduction. No video is hosted in this prototype.</Body>
        <Button title={reelOpen ? 'Hide intro storyboard' : 'Read intro storyboard'} variant="ghost" icon="file-text" onPress={() => setReelOpen(!reelOpen)} />
        {reelOpen && <View style={{ gap: 8 }}>
          <Body style={{ fontWeight: '600' }}>Sample 45-second reel</Body>
          <Body muted>00–10s · {coach.name.split(' ')[0]} introduces their coaching approach at the club.</Body>
          <Body muted>10–30s · A close-up drill on {coachId === 'nour' ? 'footwork and using the back glass' : 'volleys and doubles positioning'}.</Body>
          <Body muted>30–45s · A recap: {coach.specialty.toLowerCase()}. This is a written mock-up, not playable media.</Body>
        </View>}
      </View>
    </Card>

    <Card>
      <Heading title="Make space to improve" kicker="BOOK A DEMO SESSION" />
      <Label>01 / YOUR SESSION</Label>
      <Row>{sessionKinds.map(item => <Chip key={item.name} title={item.name} selected={kind === item.name} onPress={() => { setKind(item.name); setError(''); }} />)}</Row>
      <Body muted>{session.detail}</Body>
      <Label>02 / A TIME THAT FITS</Label>
      <Body muted>Illustrative availability, not a live calendar. Times are relative demo labels.</Body>
      <View style={{ gap: 9 }}>{times.map(item => {
        const taken = state.lessons.some(lesson => lesson.coachId === coachId && lesson.time === item);
        return <Button key={item} title={`${item}${taken ? ' · booked in demo' : ''}`} icon={time === item ? 'check-circle' : 'clock'} variant={time === item ? 'secondary' : 'ghost'} disabled={taken} onPress={() => { setTime(item); setError(''); }} />;
      })}</View>
      <View style={styles.inset}>
        <Label>03 / YOUR DEMO SUMMARY</Label>
        <Body style={{ fontWeight: '600' }}>{coach.name} · {kind}</Body>
        <Body muted>{time ?? 'Choose an available time above'}</Body>
        <Row style={{ justifyContent: 'space-between' }}><Body>Your session fee</Body><Text style={styles.price}>{money(fee)}</Text></Row>
        <Body muted>{kind === 'Private' ? 'Full private-session fee.' : `${kind === 'Semi-private' ? '65%' : '40%'} of the private-session fee for your place.`} No additional demo charges.</Body>
      </View>
      <DemoNote>Confirming simulates a payment of {money(fee)}. No card details, real charge or coach notification. The receipt is saved only until reload.</DemoNote>
      {!!error && <View accessibilityLiveRegion="polite"><Body style={{ color: c.danger }}>{error}</Body></View>}
      <Button title={reserved ? 'Session booked in this demo' : `Simulate payment & book · ${money(fee)}`} icon={reserved ? 'check' : 'lock'} disabled={!time || reserved} onPress={book} />
      {reserved && <Body style={{ color: c.green }}>Your receipt is below. Choose another available time to try a new booking.</Body>}
    </Card>

    <Heading title="Your coaching sessions" kicker="DEMO BOOKING HISTORY" />
    {!state.lessons.length ? <Empty title="Your next chapter" text="Book a demo session to see your receipt here. No sessions have been completed." icon="calendar" /> : [...state.lessons].reverse().map(lesson => {
      const bookedCoach = coaches.find(item => item.id === lesson.coachId);
      return <Card key={lesson.id}>
        <Row><Icon name="check-circle" color={c.green} /><Label color={c.green}>BOOKED · SIMULATED PAYMENT</Label></Row>
        <Heading title={bookedCoach?.name ?? 'Demo coach'} />
        <Body>{lesson.kind} · {lesson.time}</Body>
        <Row style={{ justifyContent: 'space-between' }}><Body muted>Demo amount paid</Body><Text style={styles.price}>{money(lesson.total)}</Text></Row>
        <Body muted>Receipt {lesson.id}</Body>
        <Body muted>No real appointment was made. This session is not marked as completed, and no feedback has been generated for it.</Body>
      </Card>;
    })}

    <Card style={{ backgroundColor: c.soft }}>
      <Label>SAMPLE ONLY · NOT YOUR SESSION FEEDBACK</Label>
      <Heading title="The learning continues" />
      <Body muted>A preview of what a post-session notebook could look like for {coach.name.split(' ')[0]}'s coaching style. These prewritten drills and notes are unrelated to any booking you make.</Body>
      <Button title={sampleOpen ? 'Close sample notebook' : 'Explore sample drills & notes'} icon="book-open" variant="ghost" onPress={() => setSampleOpen(!sampleOpen)} />
      {sampleOpen && samples[coachId].map((sample, index) => <View key={sample.title} style={styles.drill}>
        <Label>SAMPLE {index === 2 ? 'COACH NOTE' : `DRILL 0${index + 1}`}</Label>
        <Body style={{ fontWeight: '700' }}>{sample.title}</Body>
        <Body muted>{sample.text}</Body>
      </View>)}
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: c.deep, borderColor: c.deep, padding: 25, gap: 18 },
  heroTitle: { fontSize: 31, lineHeight: 37, color: '#FFFFFF', fontWeight: '600', letterSpacing: -1 },
  selected: { borderColor: c.green, borderWidth: 2 },
  inset: { backgroundColor: c.soft, padding: 16, borderRadius: 14, gap: 12 },
  price: { fontSize: 21, color: c.green, fontWeight: '700', letterSpacing: -0.6 },
  drill: { paddingTop: 15, borderTopWidth: 1, borderTopColor: c.line, gap: 7 },
});
