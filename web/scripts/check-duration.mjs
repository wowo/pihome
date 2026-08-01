// Smoke check for duration parsing. Run: node scripts/check-duration.mjs
function durationToMinutes(duration) {
  if (duration.includes('m')) return Number(duration.replace('m', '')) || 0;
  if (duration.includes('h')) return 60 * (Number(duration.replace('h', '')) || 0);
  if (duration === 'X') return 0;
  return 0;
}

const cases = [
  ['15m', 15],
  ['30m', 30],
  ['1h', 60],
  ['3h', 180],
  ['X', 0],
];
for (const [input, expected] of cases) {
  const got = durationToMinutes(input);
  if (got !== expected) {
    console.error(`FAIL ${input}: got ${got}, expected ${expected}`);
    process.exit(1);
  }
}
console.log('duration check ok');
