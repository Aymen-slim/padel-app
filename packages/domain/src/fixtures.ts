export const clubs = [
  { id: 'coast', name: 'Coast Padel Club', area: 'La Marsa', distance: '2.4 km', rating: '4.9', courts: 4, type: 'Outdoor', price: 96000, color: '#286259', tag: 'COMMUNITY FAVORITE', description: 'Sea air, good rallies, better company. Four open-air courts and a little terrace for the post-match ritual.' },
  { id: 'olive', name: 'Olive Grove Courts', area: 'Gammarth', distance: '5.1 km', rating: '4.8', courts: 6, type: 'Indoor', price: 120000, color: '#8B7653', tag: 'PLAY ALL SEASONS', description: 'A calm, light-filled home for your next game. Six indoor courts, a pro shop and space to slow down after you play.' },
  { id: 'urban', name: 'The Padel Yard', area: 'Les Berges du Lac', distance: '8.2 km', rating: '4.7', courts: 3, type: 'Outdoor', price: 80000, color: '#425B78', tag: 'AFTER-WORK ENERGY', description: 'Your city escape. Floodlit courts, friendly weekly games and a welcoming crew at every level.' },
] as const;

export const players = [
  { id: 'ines', name: 'Ines', initials: 'IB', area: 'La Marsa', level: 'Intermediate', side: 'Right side', time: 'Weekday evenings', bio: 'Here for the long rallies and the coffee after. Looking for a regular doubles crew.', color: '#D5DDD0', matches: 38 },
  { id: 'youssef', name: 'Youssef', initials: 'YM', area: 'Gammarth', level: 'Advanced', side: 'Left side', time: 'Weekends', bio: 'Competitive on court, easygoing off it. Always up for a Saturday morning game.', color: '#EACAAE', matches: 76 },
  { id: 'sarah', name: 'Sarah', initials: 'SK', area: 'La Marsa', level: 'Intermediate', side: 'Either side', time: 'Weekday evenings', bio: 'A little less power, a little more placement. Let’s get a good game going.', color: '#C7D9E2', matches: 24 },
] as const;

export const openMatches = [
  { id: 'sunset', title: 'The sunset session', clubId: 'coast', day: 1, time: '18:30', level: 'Intermediate', players: ['Ines', 'Sami', 'Nour'], capacity: 4, share: 24000, label: '1 SPOT LEFT' },
  { id: 'weekend', title: 'Easy Sunday rallies', clubId: 'olive', day: 2, time: '09:30', level: 'Beginner', players: ['Amine', 'Lina'], capacity: 4, share: 30000, label: 'ALL GOOD VIBES' },
  { id: 'afterwork', title: 'After-work doubles', clubId: 'urban', day: 3, time: '20:00', level: 'Advanced', players: ['Youssef', 'Aziz', 'Meriem'], capacity: 4, share: 20000, label: '1 SPOT LEFT' },
] as const;

export const coaches = [
  { id: 'nour', name: 'Nour Ben Ali', initials: 'NB', specialty: 'Build your foundations', level: 'Beginner · Intermediate', price: 70000, color: '#D5DDD0', clubId: 'coast', bio: 'Make every shot feel a little more natural. Focused sessions on footwork, positioning and enjoying the game.', experience: '6 years coaching', credential: 'Demo coaching credential' },
  { id: 'karim', name: 'Karim Mansour', initials: 'KM', specialty: 'Take control of the net', level: 'Intermediate · Advanced', price: 90000, color: '#EACAAE', clubId: 'olive', bio: 'Find your next level with purposeful drills, doubles tactics and a more confident attacking game.', experience: '9 years coaching', credential: 'Demo coaching credential' },
] as const;

export const products = [
  { id: 'racket', name: 'Everyday Control', category: 'Rackets', subtitle: 'A forgiving sweet spot. A confident first swing.', price: 280000, stock: 3, color: '#DDE8C7', icon: 'racket' },
  { id: 'balls', name: 'Match Day Balls', category: 'Essentials', subtitle: 'Three fresh reasons for one more set.', price: 22000, stock: 8, color: '#EEF1D8', icon: 'balls' },
  { id: 'grips', name: 'Stay Dry Grips', category: 'Essentials', subtitle: 'A fresh feel, from warm-up to match point.', price: 15000, stock: 6, color: '#F1DCD0', icon: 'grips' },
  { id: 'bag', name: 'Court Tote', category: 'Accessories', subtitle: 'Everything you need. Nothing you don’t.', price: 85000, stock: 4, color: '#D9E5EA', icon: 'bag' },
] as const;

export const events = [
  { id: 'social', name: 'Sunday Social', format: 'Americano', subtitle: 'New partners. Good rallies. One great morning.', day: 7, time: '09:00', clubId: 'coast', fee: 35000, capacity: 16, registered: 12, color: '#D7EE9C' },
  { id: 'ladder', name: 'The Club Series', format: 'Round-robin', subtitle: 'Your next friendly rivalry starts here.', day: 14, time: '10:00', clubId: 'olive', fee: 50000, capacity: 12, registered: 8, color: '#EBC8B1' },
  { id: 'cup', name: 'September Cup', format: 'Knockout', subtitle: 'Bring your partner. Bring your best game.', day: 21, time: '09:30', clubId: 'urban', fee: 45000, capacity: 16, registered: 10, color: '#C7DCE7' },
] as const;

export const slots = ['08:00', '09:30', '11:00', '17:00', '18:30', '20:00'];
export const levels = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'] as const;

export function dateAfter(days: number, base = new Date()) {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
