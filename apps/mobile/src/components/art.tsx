import React from 'react';
import Svg, { Rect, Path, Circle, Line, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { View } from 'react-native';

export function CourtArt({ color = '#286259', height = 180 }: { color?: string; height?: number }) {
  return <View accessible accessibilityLabel="Illustration of a padel court" style={{ height, overflow: 'hidden', borderRadius: 16, backgroundColor: color }}><Svg width="100%" height="100%" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice">
    <Defs><LinearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={color} /><Stop offset="1" stopColor="#163D34" /></LinearGradient></Defs>
    <Rect width="500" height="280" fill="url(#sky)" />
    <Circle cx="435" cy="33" r="95" fill="#D9EF97" opacity="0.08" /><Circle cx="45" cy="260" r="125" fill="#E6E9C9" opacity="0.06" />
    <G transform="translate(40, -8) rotate(-16, 235, 145)">
      <Rect x="77" y="40" width="315" height="235" rx="2" fill="#102C25" opacity="0.3" />
      <Rect x="60" y="22" width="315" height="235" fill="#87A88C" />
      <Rect x="77" y="37" width="282" height="205" fill="#3E7965" stroke="#DAE5CD" strokeWidth="2" />
      <Rect x="77" y="85" width="282" height="109" fill="none" stroke="#DAE5CD" strokeWidth="2" />
      <Line x1="218" y1="37" x2="218" y2="242" stroke="#DAE5CD" strokeWidth="2" />
      <Line x1="77" y1="140" x2="359" y2="140" stroke="#EAF1D5" strokeWidth="3" />
      <Path d="M77 128H359V140H77Z" fill="#0C332B" opacity="0.8" />
      {Array.from({ length: 27 }, (_, i) => <Line key={i} x1={80 + i * 10.5} y1="128" x2={80 + i * 10.5} y2="139" stroke="#CDDFCD" strokeWidth="0.5" />)}
      <Line x1="77" y1="132" x2="359" y2="132" stroke="#CDDFCD" strokeWidth="0.5" />
      <Circle cx="160" cy="94" r="8" fill="#F2CAA7" /><Ellipse cx="160" cy="97" rx="6" ry="10" fill="#F1EFDE" /><Circle cx="279" cy="200" r="8" fill="#F2CAA7" /><Ellipse cx="279" cy="203" rx="6" ry="10" fill="#D9EF97" />
      <Circle cx="247" cy="84" r="7" fill="#EBB285" /><Ellipse cx="247" cy="88" rx="6" ry="9" fill="#CBDDE5" /><Circle cx="142" cy="211" r="7" fill="#EBB285" /><Ellipse cx="142" cy="215" rx="6" ry="9" fill="#DA9674" />
      <Circle cx="252" cy="167" r="3" fill="#DEF09A" />
      <Path d="M55 17H382V251M55 17V251" fill="none" stroke="#E1EBDA" strokeWidth="1" opacity="0.6" />
      {[55, 137, 218, 300, 382].map(x => <Line key={x} x1={x} y1="17" x2={x} y2="0" stroke="#D7E2D1" opacity="0.6" />)}
    </G>
    <Path d="M442 210L448 128M448 150Q420 119 407 141M448 146Q480 114 497 135M447 154Q470 138 490 160M447 150Q425 134 416 154" stroke="#C2D09A" strokeWidth="5" fill="none" opacity="0.7" />
  </Svg></View>;
}

export function GearArt({ kind = 'racket', color = '#DDE8C7', height = 170 }: { kind?: string; color?: string; height?: number }) {
  return <View accessible accessibilityLabel={`${kind} illustration`} style={{ height, backgroundColor: color, borderRadius: 16, overflow: 'hidden' }}><Svg width="100%" height="100%" viewBox="0 0 280 200">
    <Circle cx="140" cy="100" r="78" fill="#FFFFFF" opacity="0.24" />
    {kind === 'racket' ? <G transform="rotate(25 140 100)"><Rect x="134" y="111" width="16" height="69" rx="6" fill="#27493D" /><Ellipse cx="142" cy="75" rx="42" ry="53" fill="#254C40" /><Ellipse cx="142" cy="74" rx="35" ry="44" fill="#58765B" stroke="#D9EF97" strokeWidth="2" />{Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => <Circle key={`${row}-${col}`} cx={122 + col * 10} cy={52 + row * 11} r="2.5" fill="#DDE8C7" />))}<Path d="M134 142H150M134 150H150M134 158H150M134 166H150" stroke="#D9EF97" strokeWidth="2" /></G>
    : kind === 'balls' ? <G>{[105, 169].map((x, i) => <G key={x}><Circle cx={x} cy={100 + i * 22} r="35" fill="#BBCF54" /><Path d={`M${x - 25} ${76 + i * 22}Q${x + 5} ${100 + i * 22} ${x - 25} ${124 + i * 22}`} stroke="#F8F9D8" strokeWidth="3" fill="none" /><Path d={`M${x + 25} ${76 + i * 22}Q${x - 5} ${100 + i * 22} ${x + 25} ${124 + i * 22}`} stroke="#F8F9D8" strokeWidth="3" fill="none" /></G>)}</G>
    : kind === 'bag' ? <G><Path d="M87 75H195L207 160H75Z" fill="#597360" /><Path d="M114 80V56Q140 24 166 56V80" stroke="#254C40" strokeWidth="8" fill="none" /><Path d="M100 110H180M100 117H180" stroke="#DDE8C7" strokeWidth="2" /><Circle cx="140" cy="139" r="10" fill="#D9EF97" /></G>
    : <G>{[100, 140, 180].map((x, i) => <G key={x} transform={`rotate(-20 ${x} 100)`}><Rect x={x - 13} y="50" width="26" height="105" rx="8" fill={i === 1 ? '#D9EF97' : '#4F6B55'} />{[70, 85, 100, 115, 130].map(y => <Line key={y} x1={x - 13} x2={x + 13} y1={y} y2={y + 10} stroke="#FFFFFF" opacity="0.4" />)}</G>)}</G>}
  </Svg></View>;
}
