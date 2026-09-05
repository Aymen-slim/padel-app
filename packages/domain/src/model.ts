import { clubs, coaches, events, openMatches, products, slots, levels } from './fixtures';

export type Scenario = 'normal' | 'payment-failure' | 'offline' | 'message-failure';
export type Booking = {
  id: string; clubId: string; date: string; time: string; mode: 'private' | 'open';
  total: number; shares: number[]; paid: number[]; expiresAt: number;
  status: 'held' | 'confirmed' | 'cancelled' | 'expired'; rental: boolean; refund: number;
};
export type Message = { id: string; author: string; text: string; mine: boolean };
export type WaitEntry = { id: string; clubId: string; date: string; time: string; status: 'waiting' | 'offered' | 'accepted' | 'expired'; expiresAt?: number };
export type State = {
  name: string; level: string; side: string; onboarded: boolean; scenario: Scenario;
  bookings: Booking[]; joined: string[]; connected: string[]; passed: string[]; blocked: string[];
  messages: Record<string, Message[]>; waitlist: WaitEntry[];
  cart: Record<string, number>; orders: { id: string; total: number; items: Record<string, number> }[];
  lessons: { id: string; coachId: string; kind: string; time: string; total: number }[];
  registrations: string[]; listings: { id: string; name: string; price: number; condition: string }[];
};
export type Action =
  | { type: 'hold'; clubId: string; date: string; time: string; mode: Booking['mode']; rental: boolean }
  | { type: 'pay'; id: string; payer: number }
  | { type: 'cancel' | 'expire'; id: string }
  | { type: 'waitlist'; clubId: string; date: string; time: string }
  | { type: 'acceptOffer' | 'releaseOffer'; id: string }
  | { type: 'join' | 'leave' | 'connect' | 'pass' | 'block'; id: string }
  | { type: 'message'; id: string; text: string; messageId: string }
  | { type: 'cart'; id: string; delta: number }
  | { type: 'checkout' }
  | { type: 'lesson'; coachId: string; kind: string; time: string }
  | { type: 'register'; id: string }
  | { type: 'listing'; name: string; price: number; condition: string }
  | { type: 'profile'; name: string; level: string; side: string }
  | { type: 'scenario'; scenario: Scenario }
  | { type: 'tick' | 'reset' };

export function initialState(): State {
  return { name: 'Alex', level: 'Intermediate', side: 'Right side', onboarded: false, scenario: 'normal', bookings: [], joined: [], connected: [], passed: [], blocked: [], messages: {}, waitlist: [], cart: {}, orders: [], lessons: [], registrations: [], listings: [] };
}

export function money(amount: number) {
  return `${(amount / 1000).toLocaleString('en-GB', { minimumFractionDigits: amount % 1000 ? 3 : 0, maximumFractionDigits: 3 })} TND`;
}

export function splitAmount(amount: number, count: number) {
  if (!Number.isSafeInteger(amount) || amount < 0 || !Number.isSafeInteger(count) || count < 1 || count > 100) throw new Error('Invalid amount or share count.');
  return Array.from({ length: count }, (_, i) => Math.floor(amount / count) + (i < amount % count ? 1 : 0));
}

export function quote(clubId: string, rental: boolean) {
  const club = clubs.find(c => c.id === clubId);
  if (!club) throw new Error('Club not found.');
  const shares = splitAmount(club.price, 4);
  if (rental) shares[0] = shares[0]! + 8000;
  return { court: club.price, rental: rental ? 8000 : 0, total: club.price + (rental ? 8000 : 0), shares };
}

function requireValue<T>(value: T | undefined, message = 'This item is no longer available.'): T {
  if (!value) throw new Error(message);
  return value;
}

function systemMessage(text: string): Message {
  return { id: 'welcome', author: 'Court Club', text, mine: false };
}

export function canChat(state: State, id: string) {
  return state.joined.includes(id) || state.bookings.some(b => b.id === id && b.status === 'confirmed');
}

function offerReleasedSlot(state: State, booking: Pick<Booking, 'clubId' | 'date' | 'time'>, now: number) {
  const waiting = state.waitlist.find(w => w.clubId === booking.clubId && w.date === booking.date && w.time === booking.time && w.status === 'waiting');
  if (waiting) { waiting.status = 'offered'; waiting.expiresAt = now + 5 * 60_000; }
}

export function transition(previous: State, action: Action, now = Date.now()): State {
  if (action.type === 'reset') return initialState();
  const localActions = ['scenario', 'profile', 'tick', 'reset', 'pass', 'block'];
  if (previous.scenario === 'offline' && !localActions.includes(action.type)) throw new Error('You’re offline in this demo. Turn off Offline in Profile to continue.');
  const state: State = JSON.parse(JSON.stringify(previous));
  for (const booking of state.bookings) {
    if (booking.status === 'held' && booking.expiresAt <= now) {
      booking.status = 'expired';
      booking.refund = booking.paid.reduce((a, b) => a + b, 0);
      offerReleasedSlot(state, booking, now);
    }
  }
  for (const offer of state.waitlist) {
    if (offer.status === 'offered' && (offer.expiresAt ?? 0) <= now) offer.status = 'expired';
  }
  const failPayment = () => {
    if (state.scenario === 'payment-failure') throw new Error('Demo payment declined. No payment was recorded. Change the scenario in Profile and retry.');
  };
  switch (action.type) {
    case 'hold': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(action.date) || !slots.includes(action.time)) throw new Error('Choose a valid date and time.');
      const occupied = state.bookings.some(b => b.clubId === action.clubId && b.date === action.date && b.time === action.time && ['held', 'confirmed'].includes(b.status));
      if (occupied) throw new Error('This court is no longer available. Choose another time.');
      if (state.waitlist.some(w => w.clubId === action.clubId && w.date === action.date && w.time === action.time && w.status === 'offered')) throw new Error('This time is reserved for a waitlist offer. Accept it from your bookings.');
      const pricing = quote(action.clubId, action.rental);
      state.bookings.unshift({ id: `booking-${now}-${state.bookings.length}`, clubId: action.clubId, date: action.date, time: action.time, mode: action.mode, total: pricing.total, shares: pricing.shares, paid: [0, 0, 0, 0], expiresAt: now + 10 * 60_000, status: 'held', rental: action.rental, refund: 0 });
      break;
    }
    case 'pay': {
      const booking = requireValue(state.bookings.find(b => b.id === action.id));
      if (booking.status !== 'held') throw new Error('This hold is no longer awaiting payment.');
      if (!Number.isInteger(action.payer) || action.payer < 0 || action.payer > 3) throw new Error('Invalid participant.');
      if (booking.paid[action.payer]) throw new Error('This share is already paid.');
      if (booking.mode === 'open' && action.payer !== 0) throw new Error('The organizer must explicitly fund this open match.');
      failPayment();
      if (booking.mode === 'open') booking.paid = [...booking.shares];
      else booking.paid[action.payer] = booking.shares[action.payer]!;
      if (booking.paid.every((paid, index) => paid === booking.shares[index])) {
        booking.status = 'confirmed';
        state.messages[booking.id] = [systemMessage('Your demo court is confirmed. Coordinate your arrival here. No real reservation was made.')];
      }
      break;
    }
    case 'cancel':
    case 'expire': {
      const booking = requireValue(state.bookings.find(b => b.id === action.id));
      if (!['held', 'confirmed'].includes(booking.status)) throw new Error('This booking has already ended.');
      if (action.type === 'expire' && booking.status !== 'held') throw new Error('Only an unpaid hold can expire.');
      booking.status = action.type === 'cancel' ? 'cancelled' : 'expired';
      booking.refund = booking.paid.reduce((a, b) => a + b, 0);
      offerReleasedSlot(state, booking, now);
      break;
    }
    case 'waitlist': {
      requireValue(clubs.find(c => c.id === action.clubId));
      if (!slots.includes(action.time)) throw new Error('Choose a valid time.');
      if (state.waitlist.some(w => w.clubId === action.clubId && w.date === action.date && w.time === action.time && ['waiting', 'offered'].includes(w.status))) throw new Error('You’re already on this waitlist.');
      state.waitlist.push({ id: `wait-${now}-${state.waitlist.length}`, clubId: action.clubId, date: action.date, time: action.time, status: 'waiting' });
      break;
    }
    case 'releaseOffer': {
      const entry = requireValue(state.waitlist.find(w => w.id === action.id));
      if (entry.status !== 'waiting') throw new Error('This entry is not waiting.');
      if (state.bookings.some(b => b.clubId === entry.clubId && b.date === entry.date && b.time === entry.time && ['held', 'confirmed'].includes(b.status))) throw new Error('Cancel the active booking first to release its court.');
      entry.status = 'offered'; entry.expiresAt = now + 5 * 60_000;
      break;
    }
    case 'acceptOffer': {
      const entry = requireValue(state.waitlist.find(w => w.id === action.id));
      if (entry.status !== 'offered') throw new Error('This offer has expired or was already accepted.');
      entry.status = 'accepted';
      return transition(state, { type: 'hold', clubId: entry.clubId, date: entry.date, time: entry.time, mode: 'private', rental: false }, now);
    }
    case 'join': {
      const match = requireValue(openMatches.find(m => m.id === action.id));
      if (state.joined.includes(action.id)) throw new Error('You already have a seat in this match.');
      if (match.level !== state.level) throw new Error(`This match is for ${match.level.toLowerCase()} players. Choose a matching game or update your demo profile.`);
      failPayment();
      state.joined.push(action.id);
      state.messages[action.id] = [systemMessage('Your demo share is paid and your seat is confirmed.'), { id: 'hello', author: match.players[0], text: 'Hey! Let’s meet ten minutes early. I’ll bring the balls.', mine: false }];
      break;
    }
    case 'leave': {
      if (!state.joined.includes(action.id)) throw new Error('You are not in this match.');
      state.joined = state.joined.filter(id => id !== action.id);
      break;
    }
    case 'connect':
      if (state.blocked.includes(action.id)) throw new Error('This player is blocked.');
      if (!state.connected.includes(action.id)) state.connected.push(action.id);
      break;
    case 'pass':
      if (!state.passed.includes(action.id)) state.passed.push(action.id);
      break;
    case 'block':
      if (!state.blocked.includes(action.id)) state.blocked.push(action.id);
      state.connected = state.connected.filter(id => id !== action.id);
      break;
    case 'message': {
      if (!canChat(state, action.id)) throw new Error('Chat is only available to confirmed match participants.');
      if (state.scenario === 'message-failure') throw new Error('Demo message delivery failed. Your draft is preserved; change scenario and retry.');
      const text = action.text.trim();
      if (!text || text.length > 1000) throw new Error('Write a message between 1 and 1,000 characters.');
      const messages = state.messages[action.id] ?? [];
      if (!messages.some(m => m.id === action.messageId)) messages.push({ id: action.messageId, author: state.name, text, mine: true });
      state.messages[action.id] = messages;
      break;
    }
    case 'cart': {
      const product = requireValue(products.find(p => p.id === action.id));
      if (!Number.isInteger(action.delta)) throw new Error('Invalid quantity.');
      const quantity = (state.cart[action.id] ?? 0) + action.delta;
      const purchased = state.orders.reduce((sum, o) => sum + (o.items[action.id] ?? 0), 0);
      if (quantity < 0 || quantity + purchased > product.stock) throw new Error('No more demo stock is available.');
      state.cart[action.id] = quantity;
      break;
    }
    case 'checkout': {
      const total = products.reduce((sum, p) => sum + p.price * (state.cart[p.id] ?? 0), 0);
      if (!total) throw new Error('Add something to your bag first.');
      failPayment();
      state.orders.unshift({ id: `order-${now}`, total, items: { ...state.cart } });
      state.cart = {};
      break;
    }
    case 'lesson': {
      const coach = requireValue(coaches.find(c => c.id === action.coachId));
      if (!['Private', 'Semi-private', 'Clinic'].includes(action.kind) || !['Tomorrow · 10:00', 'Tomorrow · 14:00', 'Saturday · 09:00'].includes(action.time)) throw new Error('Choose a valid session and time.');
      if (state.lessons.some(l => l.coachId === action.coachId && l.time === action.time)) throw new Error('This demo training block is already reserved.');
      failPayment();
      const multiplier = action.kind === 'Private' ? 1 : action.kind === 'Semi-private' ? 0.65 : 0.4;
      state.lessons.push({ id: `lesson-${now}`, coachId: action.coachId, kind: action.kind, time: action.time, total: Math.round(coach.price * multiplier) });
      break;
    }
    case 'register': {
      requireValue(events.find(e => e.id === action.id));
      if (state.registrations.includes(action.id)) throw new Error('You’re already registered.');
      failPayment(); state.registrations.push(action.id);
      break;
    }
    case 'listing': {
      const name = action.name.trim();
      if (name.length < 3 || name.length > 80 || !Number.isSafeInteger(action.price) || action.price < 1000 || action.price > 10000000) throw new Error('Enter a title (3–80 characters) and a price from 1 to 10,000 TND.');
      if (!['Like new', 'Good', 'Well played'].includes(action.condition)) throw new Error('Choose the condition.');
      state.listings.unshift({ id: `listing-${now}`, name, price: action.price, condition: action.condition });
      break;
    }
    case 'profile': {
      const name = action.name.trim();
      if (name.length < 2 || name.length > 40 || !levels.some(l => l === action.level) || !['Left side', 'Right side', 'Either side'].includes(action.side)) throw new Error('Add a name (2–40 characters), skill level and preferred side.');
      state.name = name; state.level = action.level; state.side = action.side; state.onboarded = true;
      break;
    }
    case 'scenario': state.scenario = action.scenario; break;
    case 'tick': break;
  }
  return state;
}
