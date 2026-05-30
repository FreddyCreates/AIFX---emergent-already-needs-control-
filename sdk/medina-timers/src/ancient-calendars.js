/**
 * @medina/medina-timers - Ancient Calendars
 * 
 * Mathematical timer implementations based on ancient calendar systems.
 * Each timer uses phi-weighted cycles derived from the original calendar's
 * astronomical observations.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873; // 873ms organism heartbeat

// ═══════════════════════════════════════════════════════════════════════════
// MAYAN CALENDAR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mayan Tzolkin timer (260-day sacred calendar)
 * 13 × 20 = 260 days, phi-scaled to milliseconds
 */
export function createMayanTzolkinTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const tzolkinCycle = 260;
  const phiScaled = tzolkinCycle * PHI_INV;
  const interval = baseMs * phiScaled;
  
  let dayCount = 0;
  const trecena = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat', 'Muluc', 'Oc', 
                   'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau'];
  
  return setInterval(() => {
    dayCount = (dayCount + 1) % tzolkinCycle;
    const dayNumber = (dayCount % 13) + 1;
    const daySign = trecena[dayCount % 20];
    callback({
      timer: 'mayan-tzolkin',
      dayCount,
      dayNumber,
      daySign,
      timestamp: Date.now(),
      phiPhase: (dayCount * PHI) % 1,
    });
  }, interval);
}

/**
 * Mayan Haab timer (365-day civil calendar)
 * 18 months × 20 days + 5 Wayeb days
 */
export function createMayanHaabTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const haabCycle = 365;
  const phiScaled = haabCycle * PHI_INV;
  const interval = baseMs * phiScaled;
  
  const months = ['Pop', 'Wo', 'Sip', 'Sotz', 'Sek', 'Xul', 'Yaxkin', 'Mol', 'Chen', 'Yax',
                  'Sak', 'Keh', 'Mak', 'Kankin', 'Muwan', 'Pax', 'Kayab', 'Kumku', 'Wayeb'];
  
  let dayOfYear = 0;
  
  return setInterval(() => {
    dayOfYear = (dayOfYear + 1) % haabCycle;
    const monthIndex = Math.floor(dayOfYear / 20);
    const dayOfMonth = dayOfYear % 20;
    const month = months[Math.min(monthIndex, 18)];
    
    callback({
      timer: 'mayan-haab',
      dayOfYear,
      month,
      dayOfMonth,
      isWayeb: monthIndex >= 18,
      timestamp: Date.now(),
      phiPhase: (dayOfYear * PHI) % 1,
    });
  }, interval);
}

/**
 * Mayan Long Count timer (grand cycle tracking)
 */
export function createMayanLongCountTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * PHI * 20; // Phi-scaled kin cycle
  
  // Long Count units
  let kin = 0;      // 1 day
  let winal = 0;    // 20 kin
  let tun = 0;      // 360 kin
  let katun = 0;    // 7,200 kin
  let baktun = 0;   // 144,000 kin
  
  return setInterval(() => {
    kin++;
    if (kin >= 20) { kin = 0; winal++; }
    if (winal >= 18) { winal = 0; tun++; }
    if (tun >= 20) { tun = 0; katun++; }
    if (katun >= 20) { katun = 0; baktun++; }
    
    callback({
      timer: 'mayan-long-count',
      baktun, katun, tun, winal, kin,
      longCount: `${baktun}.${katun}.${tun}.${winal}.${kin}`,
      totalKin: baktun * 144000 + katun * 7200 + tun * 360 + winal * 20 + kin,
      timestamp: Date.now(),
      phiPhase: ((kin + winal * PHI + tun * PHI * PHI) % 1),
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMERIAN CALENDAR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sumerian sexagesimal timer (base-60 system)
 * The Sumerians invented the 60-second minute, 60-minute hour
 */
export function createSumerianSexagesimalTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 60 * PHI_INV; // Phi-scaled sexagesimal
  
  let ges = 0;    // 1 (unit)
  let us = 0;     // 60 ges
  let sar = 0;    // 60 us = 3600
  
  return setInterval(() => {
    ges++;
    if (ges >= 60) { ges = 0; us++; }
    if (us >= 60) { us = 0; sar++; }
    
    callback({
      timer: 'sumerian-sexagesimal',
      ges, us, sar,
      totalGes: sar * 3600 + us * 60 + ges,
      timestamp: Date.now(),
      phiPhase: (ges / 60 * PHI) % 1,
    });
  }, interval);
}

/**
 * Sumerian lunar month timer (29.5 days)
 */
export function createSumerianLunarTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const lunarMonth = 29.5;
  const interval = baseMs * lunarMonth * PHI_INV;
  
  const months = ['Nisannu', 'Aiaru', 'Simanu', 'Dumuzi', 'Abu', 'Ululu',
                  'Tashritu', 'Arahsamnu', 'Kislimu', 'Tebetu', 'Shabatu', 'Addaru'];
  
  let dayOfMonth = 0;
  let monthIndex = 0;
  
  return setInterval(() => {
    dayOfMonth++;
    if (dayOfMonth > 29) {
      dayOfMonth = 1;
      monthIndex = (monthIndex + 1) % 12;
    }
    
    callback({
      timer: 'sumerian-lunar',
      month: months[monthIndex],
      monthIndex,
      dayOfMonth,
      moonPhase: dayOfMonth / 29.5,
      timestamp: Date.now(),
      phiPhase: (dayOfMonth * PHI / 29.5) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// VEDIC CALENDAR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vedic Panchanga timer (5-limbed calendar)
 * Tithi, Nakshatra, Yoga, Karana, Vara
 */
export function createVedicPanchangaTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 27 * PHI_INV; // 27 Nakshatras
  
  const tithis = ['Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 
                  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
                  'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];
  
  const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
                      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
                      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
                      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
                      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  
  const varas = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];
  
  let tithiIndex = 0;
  let nakshatraIndex = 0;
  let varaIndex = 0;
  
  return setInterval(() => {
    tithiIndex = (tithiIndex + 1) % 15;
    nakshatraIndex = (nakshatraIndex + 1) % 27;
    varaIndex = (varaIndex + 1) % 7;
    
    callback({
      timer: 'vedic-panchanga',
      tithi: tithis[tithiIndex],
      tithiIndex,
      nakshatra: nakshatras[nakshatraIndex],
      nakshatraIndex,
      vara: varas[varaIndex],
      varaIndex,
      timestamp: Date.now(),
      phiPhase: (tithiIndex * PHI + nakshatraIndex * PHI_INV) % 1,
    });
  }, interval);
}

/**
 * Vedic Yuga timer (cosmic ages)
 * Satya, Treta, Dvapara, Kali Yugas
 */
export function createVedicYugaTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 432 * PHI_INV; // 432,000 years scaled
  
  const yugas = [
    { name: 'Satya Yuga', years: 1728000, virtue: 1.0 },
    { name: 'Treta Yuga', years: 1296000, virtue: 0.75 },
    { name: 'Dvapara Yuga', years: 864000, virtue: 0.5 },
    { name: 'Kali Yuga', years: 432000, virtue: 0.25 },
  ];
  
  let yugaIndex = 3; // Currently in Kali Yuga
  let yearInYuga = 0;
  
  return setInterval(() => {
    yearInYuga++;
    const currentYuga = yugas[yugaIndex];
    
    if (yearInYuga >= currentYuga.years / 1000) { // Scaled down
      yearInYuga = 0;
      yugaIndex = (yugaIndex + 1) % 4;
    }
    
    callback({
      timer: 'vedic-yuga',
      yuga: currentYuga.name,
      yugaIndex,
      yearInYuga,
      virtue: currentYuga.virtue,
      progress: yearInYuga / (currentYuga.years / 1000),
      timestamp: Date.now(),
      phiPhase: (yearInYuga * PHI / 432) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// EGYPTIAN CALENDAR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Egyptian Decans timer (36 star groups, 10 days each)
 */
export function createEgyptianDecanTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 36 * PHI_INV; // 36 decans
  
  const decans = [
    'Kenmet', 'Chet', 'Chery Khet', 'Khau', 'Art', 'Remrem Hathor',
    'Weshati', 'Ipy Dja', 'Sbshsn', 'Kenemu', 'Hery Ib', 'Shesmu',
    'Kenmet', 'Tepy-a Khnet', 'Khery Khnet', 'Themes', 'Uret',
    'Knm', 'Seqa', 'Ipds', 'Hau', 'Sak', 'Serk', 'Sah',
    'Tepy Sopdet', 'Khau', 'Art', 'Sba', 'Sba Imy', 'Sba Nedj',
    'Akhu', 'Abut', 'Shaty', 'Sat', 'Sepdet', 'Hau'
  ];
  
  let decanIndex = 0;
  let dayInDecan = 0;
  
  return setInterval(() => {
    dayInDecan++;
    if (dayInDecan >= 10) {
      dayInDecan = 0;
      decanIndex = (decanIndex + 1) % 36;
    }
    
    callback({
      timer: 'egyptian-decan',
      decan: decans[decanIndex],
      decanIndex,
      dayInDecan,
      season: decanIndex < 12 ? 'Akhet' : decanIndex < 24 ? 'Peret' : 'Shemu',
      timestamp: Date.now(),
      phiPhase: (decanIndex * PHI / 36) % 1,
    });
  }, interval);
}

/**
 * Egyptian Season timer (3 seasons: Akhet, Peret, Shemu)
 */
export function createEgyptianSeasonTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 120 * PHI_INV; // ~4 months per season
  
  const seasons = [
    { name: 'Akhet', meaning: 'Inundation', months: ['Thoth', 'Paopi', 'Hathor', 'Koiak'] },
    { name: 'Peret', meaning: 'Emergence', months: ['Tobi', 'Meshir', 'Paremhat', 'Parmouti'] },
    { name: 'Shemu', meaning: 'Harvest', months: ['Pashons', 'Paoni', 'Epip', 'Mesori'] },
  ];
  
  let seasonIndex = 0;
  let dayInSeason = 0;
  
  return setInterval(() => {
    dayInSeason++;
    if (dayInSeason >= 120) {
      dayInSeason = 0;
      seasonIndex = (seasonIndex + 1) % 3;
    }
    
    const season = seasons[seasonIndex];
    const monthIndex = Math.floor(dayInSeason / 30);
    
    callback({
      timer: 'egyptian-season',
      season: season.name,
      meaning: season.meaning,
      month: season.months[monthIndex],
      dayInSeason,
      dayInMonth: dayInSeason % 30,
      timestamp: Date.now(),
      phiPhase: (dayInSeason * PHI / 120) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// CHINESE CALENDAR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chinese Sexagenary Cycle timer (60-year cycle)
 * 10 Heavenly Stems × 12 Earthly Branches
 */
export function createChineseSexagenaryCycleTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 60 * PHI_INV;
  
  const heavenlyStems = ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'];
  const earthlyBranches = ['Zǐ', 'Chǒu', 'Yín', 'Mǎo', 'Chén', 'Sì', 'Wǔ', 'Wèi', 'Shēn', 'Yǒu', 'Xū', 'Hài'];
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const elements = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  
  let cycleYear = 0;
  
  return setInterval(() => {
    cycleYear = (cycleYear + 1) % 60;
    const stemIndex = cycleYear % 10;
    const branchIndex = cycleYear % 12;
    
    callback({
      timer: 'chinese-sexagenary',
      cycleYear,
      stem: heavenlyStems[stemIndex],
      branch: earthlyBranches[branchIndex],
      animal: animals[branchIndex],
      element: elements[stemIndex],
      yinYang: stemIndex % 2 === 0 ? 'Yang' : 'Yin',
      timestamp: Date.now(),
      phiPhase: (cycleYear * PHI / 60) % 1,
    });
  }, interval);
}

/**
 * Chinese 24 Solar Terms timer (二十四节气)
 */
export function createChineseSolarTermsTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * 24 * PHI_INV;
  
  const solarTerms = [
    { name: 'Lìchūn', meaning: 'Start of Spring' },
    { name: 'Yǔshuǐ', meaning: 'Rain Water' },
    { name: 'Jīngzhé', meaning: 'Awakening of Insects' },
    { name: 'Chūnfēn', meaning: 'Spring Equinox' },
    { name: 'Qīngmíng', meaning: 'Pure Brightness' },
    { name: 'Gǔyǔ', meaning: 'Grain Rain' },
    { name: 'Lìxià', meaning: 'Start of Summer' },
    { name: 'Xiǎomǎn', meaning: 'Grain Buds' },
    { name: 'Mángzhǒng', meaning: 'Grain in Ear' },
    { name: 'Xiàzhì', meaning: 'Summer Solstice' },
    { name: 'Xiǎoshǔ', meaning: 'Minor Heat' },
    { name: 'Dàshǔ', meaning: 'Major Heat' },
    { name: 'Lìqiū', meaning: 'Start of Autumn' },
    { name: 'Chǔshǔ', meaning: 'End of Heat' },
    { name: 'Báilù', meaning: 'White Dew' },
    { name: 'Qiūfēn', meaning: 'Autumn Equinox' },
    { name: 'Hánlù', meaning: 'Cold Dew' },
    { name: 'Shuāngjiàng', meaning: 'Frost Descent' },
    { name: 'Lìdōng', meaning: 'Start of Winter' },
    { name: 'Xiǎoxuě', meaning: 'Minor Snow' },
    { name: 'Dàxuě', meaning: 'Major Snow' },
    { name: 'Dōngzhì', meaning: 'Winter Solstice' },
    { name: 'Xiǎohán', meaning: 'Minor Cold' },
    { name: 'Dàhán', meaning: 'Major Cold' },
  ];
  
  let termIndex = 0;
  let dayInTerm = 0;
  
  return setInterval(() => {
    dayInTerm++;
    if (dayInTerm >= 15) { // ~15 days per term
      dayInTerm = 0;
      termIndex = (termIndex + 1) % 24;
    }
    
    const term = solarTerms[termIndex];
    const season = termIndex < 6 ? 'Spring' : termIndex < 12 ? 'Summer' : termIndex < 18 ? 'Autumn' : 'Winter';
    
    callback({
      timer: 'chinese-solar-terms',
      term: term.name,
      meaning: term.meaning,
      termIndex,
      dayInTerm,
      season,
      timestamp: Date.now(),
      phiPhase: (termIndex * PHI / 24) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Mayan
  createMayanTzolkinTimer,
  createMayanHaabTimer,
  createMayanLongCountTimer,
  // Sumerian
  createSumerianSexagesimalTimer,
  createSumerianLunarTimer,
  // Vedic
  createVedicPanchangaTimer,
  createVedicYugaTimer,
  // Egyptian
  createEgyptianDecanTimer,
  createEgyptianSeasonTimer,
  // Chinese
  createChineseSexagenaryCycleTimer,
  createChineseSolarTermsTimer,
};
