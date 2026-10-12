// Inline SVG art: zero image downloads. One visual language: poster-paper, danfo-stripe yellow, ink black, panic red.

export const SKINS = ['#C68642', '#A9714B', '#8D5524', '#6B3E26', '#4A2C1A'];
export const OUTFITS = [
  { name: 'Adire agbada', c: '#2B49A8', trim: '#F3E9D2' },
  { name: 'Senator suit', c: '#E8DABB', trim: '#8D6B3A' },
  { name: 'Blazer', c: '#2E2A27', trim: '#E4411B' },
  { name: 'Ankara shirt', c: '#FFC21A', trim: '#1F8A5B' },
];
export const STYLES = ['Low cut', 'Braids', 'Gele', 'Fila cap', 'Clean shave'];

export function avatar(look, size = 64, bg = '#33291F') {
  const skin = SKINS[look.skin] || SKINS[2], o = OUTFITS[look.outfit] || OUTFITS[0], hair = '#17120E';
  const hairSvg = [
    `<path d="M30 40c0-14 8-20 20-20s20 6 20 20c-4-7-10-9-20-9s-16 2-20 9z" fill="${hair}"/>`,
    `<path d="M30 42c0-16 8-22 20-22s20 6 20 22l-3 12-3-18H36l-3 18z" fill="${hair}"/><path d="M36 36v18M42 34v20M58 34v20M64 36v18" stroke="#000" stroke-width="1.2" opacity=".5"/>`,
    `<path d="M26 40c0-18 10-26 24-26s24 8 24 26c-6-6-12-8-24-8s-18 2-24 8z" fill="#E4411B"/><path d="M26 40c6-5 12-6 24-6s18 1 24 6" fill="none" stroke="#FFC21A" stroke-width="3"/><path d="M40 18l10 6 10-6" fill="none" stroke="#FFC21A" stroke-width="2"/>`,
    `<path d="M29 40c0-4 2-6 4-8l4-12h26l4 12c2 2 4 4 4 8z" fill="#8D1D2E"/><rect x="29" y="36" width="42" height="5" fill="#FFC21A"/>`,
    '',
  ][look.hair] || '';
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Character portrait"><rect width="100" height="100" fill="${bg}"/>` +
    `<path d="M6 100c2-26 16-34 44-36 28 2 42 10 44 36z" fill="${o.c}"/><path d="M38 66l12 14 12-14" fill="none" stroke="${o.trim}" stroke-width="3"/>` +
    `<rect x="43" y="52" width="14" height="14" rx="4" fill="${skin}"/>` +
    `<ellipse cx="50" cy="42" rx="19" ry="22" fill="${skin}"/><ellipse cx="31" cy="44" rx="3" ry="5" fill="${skin}"/><ellipse cx="69" cy="44" rx="3" ry="5" fill="${skin}"/>` +
    `<circle cx="43" cy="42" r="2" fill="#17120E"/><circle cx="57" cy="42" r="2" fill="#17120E"/><path d="M43 54q7 5 14 0" fill="none" stroke="#17120E" stroke-width="2" stroke-linecap="round"/>` +
    hairSvg + `</svg>`;
}

export const ICONS = {
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  road: '<path d="M8 3 4 21M16 3l4 18M12 4v3M12 11v3M12 18v3"/>',
  health: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/>',
  megaphone: '<path d="M3 10v4h4l8 5V5L7 10z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  money: '<circle cx="12" cy="12" r="9"/><path d="M8 7v10M16 7v10M7 10h10M7 14h10"/>',
  scales: '<path d="M12 3v18M7 21h10M4 7h16M4 8 1 15h6zM20 8l-3 7h6z"/>',
  fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3M6 8h6"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  wave: '<path d="M2 9c3-3 5 3 8 0s5 3 8 0 3 0 4 0M2 15c3-3 5 3 8 0s5 3 8 0 3 0 4 0"/>',
  water: '<path d="M12 3C8 9 6 12 6 15a6 6 0 0 0 12 0c0-3-2-6-6-12z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 2 5 6"/>',
  house: '<path d="M3 11 12 3l9 8M5 10v11h14V10M10 21v-6h4v6"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 3v16"/>',
  handshake: '<path d="M2 12l5-5 4 2 4-2 5 5-5 5-4-3-4 3z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  life: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>',
};
export const icon = (n, size = 24, cls = '') => `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.people}</svg>`;

const SCENE_BG = { bolt: '#2B49A8', water: '#1F6F8B', road: '#5B4E3E', megaphone: '#B52C14', fuel: '#8A5A00', health: '#1F8A5B', scales: '#33291F', wave: '#1F6F8B', phone: '#6A3FA0', briefcase: '#33291F', people: '#8A5A00', house: '#1F8A5B', handshake: '#6A3FA0', book: '#2B49A8', money: '#1F8A5B' };
// Event banner: ankara-style tile pattern + one big symbol
export function scene(key) {
  const bg = SCENE_BG[key] || '#33291F', id = 'p' + key;
  return `<svg class="scene" viewBox="0 0 360 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Scene illustration" focusable="false">
<defs><pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="${bg}"/><circle cx="18" cy="18" r="9" fill="none" stroke="#FFC21A" stroke-opacity=".28" stroke-width="3"/><circle cx="18" cy="18" r="3" fill="#F3E9D2" fill-opacity=".25"/><path d="M0 0l8 8M36 0l-8 8M0 36l8-8M36 36l-8-8" stroke="#F3E9D2" stroke-opacity=".2" stroke-width="2"/></pattern></defs>
<rect width="360" height="110" fill="url(#${id})"/><rect y="94" width="360" height="16" fill="#15110E" opacity=".35"/>
<circle cx="180" cy="55" r="40" fill="#15110E"/><circle cx="180" cy="55" r="40" fill="none" stroke="#FFC21A" stroke-width="4"/>
<g transform="translate(150 25) scale(2.5)" fill="none" stroke="#F3E9D2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ICONS.people}</g></svg>`;
}

// Title-screen poster: a lone candidate, a roaring crowd, torn posters, a sun that looks like a ballot stamp
export function hero() {
  const crowd = Array.from({ length: 13 }, (_, i) => {
    const x = 12 + i * 28 + (i % 2) * 6, y = 206 + (i % 3) * 8, c = ['#241D18', '#33291F', '#1B1612'][i % 3], arm = i % 4 === 0;
    return `<g><circle cx="${x}" cy="${y}" r="9" fill="${c}"/><rect x="${x - 12}" y="${y + 8}" width="24" height="40" rx="10" fill="${c}"/>${arm ? `<path d="M${x + 8} ${y + 14}l8-22" stroke="${c}" stroke-width="6" stroke-linecap="round"/>` : ''}</g>`;
  }).join('');
  const rays = Array.from({ length: 18 }, (_, i) => `<path d="M180 150L${180 + 400 * Math.cos(i * Math.PI / 9)} ${150 + 400 * Math.sin(i * Math.PI / 9)}L${180 + 400 * Math.cos((i + .5) * Math.PI / 9)} ${150 + 400 * Math.sin((i + .5) * Math.PI / 9)}Z" fill="${i % 2 ? '#E4411B' : '#FFC21A'}" opacity=".16"/>`).join('');
  return `<svg class="hero-art" viewBox="0 0 360 260" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A candidate at a podium facing a crowd under campaign posters" focusable="false">
<rect width="360" height="260" fill="#241D18"/>${rays}
<g transform="rotate(-6 60 70)"><rect x="22" y="38" width="76" height="56" fill="#F3E9D2"/><text x="60" y="64" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-weight="900" font-size="16" fill="#15110E">VOTE</text><text x="60" y="84" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-weight="900" font-size="15" fill="#E4411B">NEW DAY</text></g>
<g transform="rotate(5 300 80)"><rect x="262" y="44" width="72" height="60" fill="#FFC21A"/><text x="298" y="70" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-weight="900" font-size="14" fill="#15110E">LIGHT</text><text x="298" y="90" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-weight="900" font-size="14" fill="#15110E">FOR ALL</text></g>
<g transform="rotate(-3 180 40)"><rect x="140" y="14" width="80" height="34" fill="#1F8A5B"/><text x="180" y="37" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-weight="900" font-size="15" fill="#F3E9D2">JOBS NOW</text></g>
<circle cx="180" cy="178" r="84" fill="#E4411B" stroke="#15110E" stroke-width="5"/>
<g stroke="#15110E" stroke-width="3" stroke-linejoin="round"><path d="M150 206l6-52q24-18 48 0l6 52z" fill="#2B49A8"/><path d="M172 156l8 16 8-16z" fill="#F3E9D2"/><circle cx="180" cy="128" r="19" fill="#6B3E26"/><path d="M162 124q2-22 18-22t18 22q-18-8-36 0z" fill="#17120E"/><rect x="146" y="186" width="68" height="46" rx="5" fill="#F3E9D2"/><path d="M180 186v-20" /><circle cx="180" cy="163" r="4" fill="#15110E"/></g>
${crowd}<rect y="250" width="360" height="10" fill="#15110E"/></svg>`;
}

export const logoMark = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="14" fill="#15110E"/><circle cx="32" cy="32" r="22" fill="#E4411B"/><path d="M26 18h8a8 8 0 0 1 0 16h-8z" fill="#FFC21A"/><rect x="24" y="16" width="5" height="32" fill="#FFC21A"/><circle cx="31" cy="50" r="3" fill="#FFC21A"/></svg>`;
