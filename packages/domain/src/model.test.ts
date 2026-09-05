import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, transition, splitAmount, quote, type Action } from './model';

const hold: Action = { type: 'hold', clubId: 'coast', date: '2026-09-12', time: '18:30', mode: 'private', rental: false };
const start = () => transition(initialState(), hold, 1000);

test('millime shares reconcile exactly and reject invalid amounts', () => {
  assert.deepEqual(splitAmount(100001, 4), [25001, 25000, 25000, 25000]);
  assert.throws(() => splitAmount(-1, 4));
  assert.throws(() => splitAmount(100, 0));
  assert.throws(() => splitAmount(1.5, 4));
});
test('quotes include personal rental without dividing it among others', () => {
  assert.equal(quote('coast', true).total, quote('coast', false).total + 8000);
});
test('same slot cannot be held twice; adjacent slots remain available', () => {
  assert.throws(() => transition(start(), hold, 2000), /no longer available/);
  assert.equal(transition(start(), { ...hold, time: '20:00' }, 2000).bookings.length, 2);
});
test('private booking confirms only after all shares are paid', () => {
  let state = start();
  const id = state.bookings[0]!.id;
  state = transition(state, { type: 'pay', id, payer: 0 }, 2000);
  assert.equal(state.bookings[0]!.status, 'held');
  for (const payer of [1, 2, 3]) state = transition(state, { type: 'pay', id, payer }, 3000);
  assert.equal(state.bookings[0]!.status, 'confirmed');
  assert.ok(state.messages[id]);
  assert.throws(() => transition(state, { type: 'pay', id, payer: 0 }, 4000));
});
test('expired partial payments enter refunds and cannot be revived', () => {
  let state = start();
  const id = state.bookings[0]!.id;
  state = transition(state, { type: 'pay', id, payer: 0 }, 2000);
  state = transition(state, { type: 'tick' }, 602000);
  assert.equal(state.bookings[0]!.status, 'expired');
  assert.equal(state.bookings[0]!.refund, 24000);
  assert.throws(() => transition(state, { type: 'pay', id, payer: 1 }, 603000));
  assert.equal(transition(state, hold, 603000).bookings[0]!.status, 'held');
});
test('open booking requires full explicit organizer funding', () => {
  let state = transition(initialState(), { ...hold, mode: 'open' }, 1000);
  const id = state.bookings[0]!.id;
  assert.throws(() => transition(state, { type: 'pay', id, payer: 1 }, 2000));
  state = transition(state, { type: 'pay', id, payer: 0 }, 2000);
  assert.equal(state.bookings[0]!.status, 'confirmed');
  assert.equal(state.bookings[0]!.paid.reduce((a, b) => a + b, 0), 96000);
});
test('cancellation creates a single exclusive waitlist offer', () => {
  let state = start();
  const id = state.bookings[0]!.id;
  state = transition(state, { type: 'waitlist', clubId: 'coast', date: '2026-09-12', time: '18:30' }, 2000);
  state = transition(state, { type: 'cancel', id }, 3000);
  assert.equal(state.waitlist[0]!.status, 'offered');
  assert.throws(() => transition(state, hold, 4000), /offer/);
  state = transition(state, { type: 'acceptOffer', id: state.waitlist[0]!.id }, 5000);
  assert.equal(state.waitlist[0]!.status, 'accepted');
  assert.throws(() => transition(state, { type: 'acceptOffer', id: state.waitlist[0]!.id }, 6000));
});
test('payment failures and offline actions leave original state unchanged', () => {
  const state = { ...start(), scenario: 'payment-failure' as const };
  assert.throws(() => transition(state, { type: 'pay', id: state.bookings[0]!.id, payer: 0 }, 2000), /declined/);
  assert.deepEqual(state.bookings[0]!.paid, [0, 0, 0, 0]);
  assert.throws(() => transition({ ...state, scenario: 'offline' }, hold, 3000), /offline/);
});
test('last open-match seat is not sold twice and chat retries deduplicate', () => {
  let state = transition(initialState(), { type: 'join', id: 'sunset' }, 1000);
  assert.throws(() => transition(state, { type: 'join', id: 'sunset' }, 2000));
  const action: Action = { type: 'message', id: 'sunset', text: 'See you there', messageId: 'm1' };
  state = transition(state, action, 2000);
  state = transition(state, action, 3000);
  assert.equal(state.messages.sunset!.filter(m => m.id === 'm1').length, 1);
});
test('cancelling a match revokes chat access', () => {
  let state = start();
  const id = state.bookings[0]!.id;
  for (const payer of [0, 1, 2, 3]) state = transition(state, { type: 'pay', id, payer }, 2000);
  state = transition(state, { type: 'cancel', id }, 3000);
  assert.throws(() => transition(state, { type: 'message', id, text: 'hello', messageId: 'm' }, 4000), /confirmed/);
});
