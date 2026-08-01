/** LAN IP / hostname entry points boot without Supabase auth. */
export function isLanOrigin(hostname = location.hostname): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;
  return false;
}

export function durationToMinutes(duration: string): number {
  if (duration.includes('m')) return Number(duration.replace('m', '')) || 0;
  if (duration.includes('h')) return 60 * (Number(duration.replace('h', '')) || 0);
  if (duration === 'X') return 0;
  return 0;
}

export function groupSwitches(items: import('./models').SwitchItem[]): import('./models').SwitchGroup[] {
  const order: Record<string, number> = {
    Brama: 1,
    Roleta: 2,
    Pompa: 3,
    Podłogówka: 4,
    Lampa: 5,
  };
  const byGroup = new Map<string, import('./models').SwitchItem[]>();
  for (const item of items) {
    const parts = item.name.split(' ');
    const group = parts[0] || 'Other';
    const shortName = parts.slice(1).join(' ');
    const copy = {
      ...item,
      name: shortName ? shortName.charAt(0).toUpperCase() + shortName.slice(1) : item.name,
    };
    const list = byGroup.get(group) || [];
    list.push(copy);
    byGroup.set(group, list);
  }
  return [...byGroup.entries()]
    .map(([name, switches]) => ({ name, switches }))
    .sort((a, b) => (order[a.name] ?? 99) - (order[b.name] ?? 99));
}
