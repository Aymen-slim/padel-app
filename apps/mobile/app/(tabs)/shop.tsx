import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { products } from '@domain/fixtures';
import { money } from '@domain/model';
import { Avatar, Body, Button, Card, Chip, DemoNote, Empty, Field, Heading, Icon, Label, Row, Screen } from '@/components/ui';
import { GearArt } from '@/components/art';
import { usePrototype } from '@/services/prototype';
import { colors as c } from '@/theme/tokens';

const categories = ['All gear', 'Rackets', 'Essentials', 'Accessories'] as const;
const conditions = ['Like new', 'Good', 'Well played'] as const;
const sampleListings = [
  { id: 'sample-racket', name: 'Control racket · last season', price: 125000, condition: 'Good', seller: 'Ines B.', kind: 'racket', detail: 'A few frame scuffs, a fresh grip, and plenty of rallies left. Fictional listing; no seller contact or purchase is available.' },
  { id: 'sample-bag', name: 'Weekend court bag', price: 40000, condition: 'Like new', seller: 'Sami K.', kind: 'bag', detail: 'Room for two rackets and your match-day essentials. Fictional listing; no seller contact or purchase is available.' },
];

export default function ShopScreen() {
  const { state, act } = usePrototype();
  const [tab, setTab] = useState<'Gear' | 'Bag' | 'Used gear'>('Gear');
  const [category, setCategory] = useState<string>('All gear');
  const [review, setReview] = useState(false);
  const [showListing, setShowListing] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<(typeof conditions)[number]>('Good');
  const [error, setError] = useState('');
  const [listingError, setListingError] = useState('');
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const quantity = products.reduce((sum, product) => sum + (state.cart[product.id] ?? 0), 0);
  const total = products.reduce((sum, product) => sum + product.price * (state.cart[product.id] ?? 0), 0);
  const visibleProducts = products.filter(product => category === 'All gear' || product.category === category);

  const adjust = (id: string, delta: number) => {
    const result = act({ type: 'cart', id, delta });
    setError(result.ok ? '' : result.error);
    setReview(false);
  };
  const checkout = () => {
    const result = act({ type: 'checkout' }, 'Demo order created. No money was charged.');
    setError(result.ok ? '' : result.error);
    if (result.ok) setReview(false);
  };
  const publishListing = () => {
    const value = price.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,3})?$/.test(value)) {
      setListingError('Enter a price in TND with up to three decimal places.');
      return;
    }
    const [whole = '0', fraction = ''] = value.split('.');
    const amount = Number(whole) * 1000 + Number(fraction.padEnd(3, '0'));
    const result = act({ type: 'listing', name, price: amount, condition }, 'Demo listing published here only. No real sale is possible.');
    if (!result.ok) {
      setListingError(result.error);
      return;
    }
    setName('');
    setPrice('');
    setListingError('');
    setShowListing(false);
  };

  return <Screen title="The court shop" subtitle="Good gear. More good games.">
    <Card style={styles.hero}>
      <Row style={{ justifyContent: 'space-between' }}><Label color={c.lime}>THE EVERYDAY EDIT</Label><Icon name="shopping-bag" color={c.lime} /></Row>
      <Text style={styles.heroTitle}>A little less gear.{'\n'}A lot more game.</Text>
      <Body style={{ color: '#DBE6D8' }}>Thoughtful essentials for your next court day. Explore our fictional club collection.</Body>
      <Button title={`Your bag${quantity ? ` · ${quantity} items` : ''}`} variant="secondary" icon="arrow-right" onPress={() => setTab('Bag')} />
    </Card>
    <DemoNote>Fictional products and sellers. All payments, orders and pickup receipts are simulated. Nothing is bought, shipped or reserved.</DemoNote>
    <Row>{(['Gear', 'Bag', 'Used gear'] as const).map(item => <Chip key={item} title={item === 'Bag' ? `Bag (${quantity})` : item} selected={tab === item} onPress={() => { setTab(item); setError(''); }} />)}</Row>
    {!!error && <View accessibilityLiveRegion="polite"><Body style={{ color: c.danger }}>{error}</Body></View>}

    {tab === 'Gear' && <>
      <Heading title="Built for your routine" kicker="CLUB COLLECTION" />
      <Row>{categories.map(item => <Chip key={item} title={item} selected={category === item} onPress={() => setCategory(item)} />)}</Row>
      <View style={styles.products}>{visibleProducts.map(product => {
        const inBag = state.cart[product.id] ?? 0;
        const purchased = state.orders.reduce((sum, order) => sum + (order.items[product.id] ?? 0), 0);
        const remaining = product.stock - purchased - inBag;
        return <Card key={product.id} style={styles.product}>
          <GearArt kind={product.icon} color={product.color} height={155} />
          <Label>{product.category.toUpperCase()}</Label>
          <Heading title={product.name} />
          <Body muted>{product.subtitle}</Body>
          <Row style={{ justifyContent: 'space-between' }}><Body style={styles.price}>{money(product.price)}</Body><Body muted>{remaining} left in demo stock</Body></Row>
          <Button title={remaining === 0 ? 'Demo stock in your bag or ordered' : inBag ? `Add another · ${inBag} in bag` : 'Add to bag'} icon="plus" disabled={remaining === 0} onPress={() => { adjust(product.id, 1); }} />
        </Card>;
      })}</View>
    </>}

    {tab === 'Bag' && <>
      <Heading title="Your match-day bag" kicker="CLUB PICKUP · DEMO ONLY" />
      {quantity === 0 ? <Empty title="A fresh start" text="Your bag is empty. Find a little something for your next game." icon="shopping-bag" action="Explore gear" onPress={() => setTab('Gear')} /> : <Card>
        {products.filter(product => (state.cart[product.id] ?? 0) > 0).map(product => {
          const count = state.cart[product.id] ?? 0;
          const purchased = state.orders.reduce((sum, order) => sum + (order.items[product.id] ?? 0), 0);
          return <View key={product.id} style={styles.bagItem}>
            <Row style={{ justifyContent: 'space-between' }}><Body style={{ fontWeight: '700' }}>{product.name}</Body><Body>{money(product.price * count)}</Body></Row>
            <Body muted>{money(product.price)} each</Body>
            <Row><Button title={`Remove one ${product.name}`} icon="minus" variant="ghost" compact onPress={() => adjust(product.id, -1)} /><Body style={styles.price}>{count}</Body><Button title="Add one" icon="plus" compact variant="ghost" disabled={count + purchased >= product.stock} onPress={() => adjust(product.id, 1)} /></Row>
          </View>;
        })}
        <Row style={{ justifyContent: 'space-between' }}><Heading title="Total" /><Body style={styles.price}>{money(total)}</Body></Row>
        <Body muted>Demo pickup at Coast Padel Club · no delivery fee.</Body>
        {!review ? <Button title="Review demo checkout" icon="arrow-right" onPress={() => setReview(true)} /> : <View style={{ gap: 14 }}>
          <DemoNote>This button simulates a successful payment and creates a local receipt. No card details or real charge. Pickup is an example, not an actual collection.</DemoNote>
          <Button title={`Simulate payment · ${money(total)}`} icon="lock" onPress={checkout} />
          <Button title="Keep shopping" variant="ghost" onPress={() => { setReview(false); setTab('Gear'); }} />
        </View>}
      </Card>}
      <Heading title="Your order receipts" kicker="THIS DEMO SESSION" />
      {!state.orders.length && <Body muted>Your simulated orders will appear here. They reset when you reload.</Body>}
      {state.orders.map(order => <Card key={order.id}>
        <Row><View style={styles.receiptIcon}><Icon name="check" /></View><View style={{ flex: 1, gap: 5 }}><Label>SIMULATED PAYMENT</Label><Heading title={money(order.total)} /></View></Row>
        <Body muted>Receipt {order.id}</Body>
        {products.filter(product => (order.items[product.id] ?? 0) > 0).map(product => <Row key={product.id} style={{ justifyContent: 'space-between' }}><Body>{order.items[product.id]} × {product.name}</Body><Body>{money(product.price * (order.items[product.id] ?? 0))}</Body></Row>)}
        <View style={styles.pickup}><Label>PICKUP PREVIEW</Label><Body>Coast Padel Club · reception</Body><Body muted>Show this demo receipt in the prototype flow. No stock is reserved and there is nothing to collect in person.</Body></View>
      </Card>)}
    </>}

    {tab === 'Used gear' && <>
      <Heading title="More rallies left in it" kicker="THE SECOND-SERVE MARKET" />
      <Body muted>Give good gear another chapter. Sample listings are fictional; your own listing stays in this demo session.</Body>
      <Button title={showListing ? 'Close listing form' : 'List your used gear'} icon={showListing ? 'x' : 'plus'} variant="secondary" onPress={() => setShowListing(!showListing)} />
      {showListing && <Card>
        <Heading title="Give it a second serve" />
        <Field label="Listing title" placeholder="e.g. Control racket, lightly used" value={name} onChangeText={setName} maxLength={80} />
        <Field label="Asking price · TND" placeholder="e.g. 125" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Body muted>Title: 3–80 characters. Price: 1–10,000 TND, up to three decimal places.</Body>
        <Label>CONDITION</Label>
        <Row>{conditions.map(item => <Chip key={item} title={item} selected={condition === item} onPress={() => setCondition(item)} />)}</Row>
        {!!listingError && <Body style={{ color: c.danger }}>{listingError}</Body>}
        <DemoNote>No photos, seller messaging or real transactions in this prototype. Publishing only adds a local demo listing.</DemoNote>
        <Button title="Publish demo listing" icon="check" onPress={publishListing} />
      </Card>}
      {state.listings.map(listing => <Card key={listing.id}>
        <Label color={c.green}>YOUR DEMO LISTING · PUBLISHED LOCALLY</Label>
        <Heading title={listing.name} />
        <Row style={{ justifyContent: 'space-between' }}><Chip title={listing.condition} /><Body style={styles.price}>{money(listing.price)}</Body></Row>
        <Body muted>No real buyers can see this. It disappears when the demo reloads.</Body>
      </Card>)}
      {sampleListings.map(listing => <Card key={listing.id}>
        <GearArt kind={listing.kind} color={c.soft} height={145} />
        <Label>SAMPLE LISTING</Label><Heading title={listing.name} />
        <Row style={{ justifyContent: 'space-between' }}><Chip title={listing.condition} /><Body style={styles.price}>{money(listing.price)}</Body></Row>
        <Row><Avatar name={listing.seller} size={34} /><Body muted>{listing.seller} · fictional seller</Body></Row>
        <Button title={expandedListing === listing.id ? 'Hide sample details' : 'View sample details'} variant="ghost" onPress={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)} />
        {expandedListing === listing.id && <Body muted>{listing.detail}</Body>}
      </Card>)}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: c.deep, borderColor: c.deep, padding: 25, gap: 18 },
  heroTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 36, letterSpacing: -1, fontWeight: '600' },
  products: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  product: { flexGrow: 1, flexBasis: 290, minWidth: 0 },
  price: { fontSize: 19, fontWeight: '700', color: c.green },
  bagItem: { gap: 10, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: c.line },
  receiptIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' },
  pickup: { backgroundColor: c.soft, borderRadius: 13, padding: 15, gap: 6 },
});
