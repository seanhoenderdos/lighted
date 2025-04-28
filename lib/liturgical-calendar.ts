/**
 * Liturgical calendar service for Christian church calendar awareness
 * Provides information about liturgical seasons, holy days, and lectionary readings
 */

interface LiturgicalDate {
  season: string;
  name: string;
  color: string;
  description: string;
  readings?: {
    gospel?: string;
    epistle?: string;
    oldTestament?: string;
    psalm?: string;
  };
  themes?: string[];
}

// Common liturgical seasons
type LiturgicalSeason = 'Advent' | 'Christmas' | 'Epiphany' | 'Lent' | 'HolyWeek' | 'Easter' | 'Pentecost' | 'Ordinary' | 'Kingdomtide';

/**
 * Calculate date of Easter for a given year (Butcher's Algorithm)
 * @param year Full year (e.g., 2025)
 * @returns Date object for Easter Sunday
 */
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Get the current liturgical date information
 * @param date Optional date to check (defaults to current date)
 * @returns Information about the liturgical date
 */
export function getLiturgicalDate(date = new Date()): LiturgicalDate {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Calculate key liturgical dates
  const easter = calculateEaster(year);
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46); // 40 days + 6 Sundays before Easter
  
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49); // 7 weeks after Easter
  
  const christmasDay = new Date(year, 11, 25); // December 25
  
  const advent1 = new Date(year, 11, 25); // Start with Christmas
  // First Sunday of Advent is 4 Sundays before Christmas
  advent1.setDate(25 - ((advent1.getDay() + 7 - 0) % 7)); // Find the Sunday on/before Dec 25
  advent1.setDate(advent1.getDate() - 21); // Go back 3 more Sundays
  
  // Format as YYYY-MM-DD for easy comparison
  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const currentDate = formatDate(date);
  const easterDate = formatDate(easter);
  const ashWednesdayDate = formatDate(ashWednesday);
  const pentecostDate = formatDate(pentecost);
  const christmasDate = formatDate(christmasDay);
  const _advent1Date = formatDate(advent1);
  
  // Helper to calculate days between dates
  const _daysBetween = (d1: Date, d2: Date) => {
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // Check for special days and seasons
  if (currentDate === christmasDate) {
    return {
      season: 'Christmas',
      name: 'Christmas Day',
      color: 'white',
      description: 'Celebration of the Nativity of Jesus Christ',
      readings: {
        gospel: 'John 1:1-14',
        epistle: 'Titus 2:11-14',
        oldTestament: 'Isaiah 9:2-7',
        psalm: 'Psalm 96'
      },
      themes: ['incarnation', 'nativity', 'light', 'joy']
    };
  } else if (currentDate === easterDate) {
    return {
      season: 'Easter',
      name: 'Easter Sunday',
      color: 'white',
      description: 'Celebration of the Resurrection of Jesus Christ',
      readings: {
        gospel: 'John 20:1-18',
        epistle: '1 Corinthians 15:1-11',
        oldTestament: 'Isaiah 25:6-9',
        psalm: 'Psalm 118:1-2, 14-24'
      },
      themes: ['resurrection', 'victory', 'new life', 'hope']
    };
  } else if (currentDate === pentecostDate) {
    return {
      season: 'Pentecost',
      name: 'Pentecost Sunday',
      color: 'red',
      description: 'Celebration of the descent of the Holy Spirit',
      readings: {
        gospel: 'John 15:26-27, 16:4b-15',
        epistle: 'Acts 2:1-21',
        oldTestament: 'Ezekiel 37:1-14',
        psalm: 'Psalm 104:24-34, 35b'
      },
      themes: ['holy spirit', 'church', 'mission', 'power']
    };
  } else if (currentDate === ashWednesdayDate) {
    return {
      season: 'Lent',
      name: 'Ash Wednesday',
      color: 'purple',
      description: 'Beginning of Lent, a 40-day season of repentance and reflection',
      readings: {
        gospel: 'Matthew 6:1-6, 16-21',
        epistle: '2 Corinthians 5:20b-6:10',
        oldTestament: 'Joel 2:1-2, 12-17',
        psalm: 'Psalm 51:1-17'
      },
      themes: ['repentance', 'mortality', 'humility', 'self-examination']
    };
  }
  
  // Check for seasons
  // Advent: 4 Sundays before Christmas
  const advent4 = new Date(advent1);
  advent4.setDate(advent1.getDate() + 21);
  if (date >= advent1 && date <= advent4) {
    return {
      season: 'Advent',
      name: 'Advent',
      color: 'purple',
      description: 'Season of expectation and preparation for the coming of Christ',
      themes: ['hope', 'peace', 'joy', 'love', 'expectation', 'preparation']
    };
  }
  
  // Christmas Season: Dec 25 - Jan 5 (Twelve Days of Christmas)
  const _christmasEnd = new Date(year, 0, 5); // January 5
  if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) {
    return {
      season: 'Christmas',
      name: 'Christmas Season',
      color: 'white',
      description: 'Celebration of the Incarnation of Christ',
      themes: ['incarnation', 'light', 'joy', 'gift']
    };
  }
  
  // Epiphany Season: Jan 6 - Ash Wednesday
  const epiphany = new Date(year, 0, 6); // January 6
  if ((date >= epiphany && date < ashWednesday)) {
    return {
      season: 'Epiphany',
      name: 'Epiphany Season',
      color: 'green',
      description: 'Season of manifestation of Christ to the world',
      themes: ['mission', 'revelation', 'light', 'discipleship']
    };
  }
  
  // Lent: Ash Wednesday - Easter Sunday
  const palmSunday = new Date(easter);
  palmSunday.setDate(easter.getDate() - 7);
  
  if (date >= ashWednesday && date < palmSunday) {
    return {
      season: 'Lent',
      name: 'Lent',
      color: 'purple',
      description: 'Season of penitence and preparation',
      themes: ['repentance', 'prayer', 'fasting', 'self-denial', 'spiritual discipline']
    };
  }
  
  // Holy Week: Palm Sunday - Easter Saturday
  const maundyThursday = new Date(easter);
  maundyThursday.setDate(easter.getDate() - 3);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const holySaturday = new Date(easter);
  holySaturday.setDate(easter.getDate() - 1);
  
  if (date >= palmSunday && date < easter) {
    if (formatDate(date) === formatDate(palmSunday)) {
      return {
        season: 'HolyWeek',
        name: 'Palm Sunday',
        color: 'red',
        description: 'Commemoration of Jesus\'s triumphal entry into Jerusalem',
        readings: {
          gospel: 'Mark 11:1-11',
          epistle: 'Philippians 2:5-11',
          oldTestament: 'Isaiah 50:4-9a',
          psalm: 'Psalm 31:9-16'
        },
        themes: ['kingship', 'humility', 'paradox', 'worship']
      };
    } else if (formatDate(date) === formatDate(maundyThursday)) {
      return {
        season: 'HolyWeek',
        name: 'Maundy Thursday',
        color: 'purple',
        description: 'Commemoration of the Last Supper and Jesus\'s commandment to love one another',
        readings: {
          gospel: 'John 13:1-17, 31b-35',
          epistle: '1 Corinthians 11:23-26',
          oldTestament: 'Exodus 12:1-14',
          psalm: 'Psalm 116:1-2, 12-19'
        },
        themes: ['communion', 'service', 'love', 'commandment']
      };
    } else if (formatDate(date) === formatDate(goodFriday)) {
      return {
        season: 'HolyWeek',
        name: 'Good Friday',
        color: 'black',
        description: 'Commemoration of the crucifixion and death of Jesus',
        readings: {
          gospel: 'John 18:1-19:42',
          epistle: 'Hebrews 10:16-25',
          oldTestament: 'Isaiah 52:13-53:12',
          psalm: 'Psalm 22'
        },
        themes: ['crucifixion', 'sacrifice', 'suffering', 'atonement']
      };
    } else if (formatDate(date) === formatDate(holySaturday)) {
      return {
        season: 'HolyWeek',
        name: 'Holy Saturday',
        color: 'black',
        description: 'Commemoration of Jesus\'s burial and descent to the dead',
        readings: {
          gospel: 'Matthew 27:57-66',
          epistle: '1 Peter 4:1-8',
          oldTestament: 'Job 14:1-14',
          psalm: 'Psalm 31:1-4, 15-16'
        },
        themes: ['waiting', 'silence', 'burial', 'liminality']
      };
    } else {
      return {
        season: 'HolyWeek',
        name: 'Holy Week',
        color: 'purple',
        description: 'Final week of Lent commemorating Jesus\'s passion',
        themes: ['suffering', 'sacrifice', 'obedience', 'preparation']
      };
    }
  }
  
  // Easter Season: Easter Sunday - Pentecost
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39); // 40 days after Easter
  
  if (date > easter && date <= pentecost) {
    if (formatDate(date) === formatDate(ascension)) {
      return {
        season: 'Easter',
        name: 'Ascension Day',
        color: 'white',
        description: 'Commemoration of Jesus\'s ascension to heaven',
        readings: {
          gospel: 'Luke 24:44-53',
          epistle: 'Acts 1:1-11',
          oldTestament: '2 Kings 2:1-15',
          psalm: 'Psalm 47'
        },
        themes: ['ascension', 'kingship', 'commission', 'promise']
      };
    }
    
    return {
      season: 'Easter',
      name: 'Easter Season',
      color: 'white',
      description: 'Season celebrating the resurrection and appearances of the risen Christ',
      themes: ['resurrection', 'life', 'victory', 'witness', 'mission']
    };
  }
  
  // Pentecost Season / Ordinary Time / Kingdomtide: After Pentecost until Advent
  if (date > pentecost && date < advent1) {
    return {
      season: 'Ordinary',
      name: 'Ordinary Time',
      color: 'green',
      description: 'Season of growth and discipleship',
      themes: ['growth', 'discipleship', 'ministry', 'mission', 'kingdom']
    };
  }
  
  // Default to Ordinary Time
  return {
    season: 'Ordinary',
    name: 'Ordinary Time',
    color: 'green',
    description: 'Season of growth and discipleship',
    themes: ['growth', 'discipleship', 'ministry', 'mission', 'kingdom']
  };
}

/**
 * Get sermon theme suggestions based on the current liturgical season
 * @param count Number of suggestions to return
 * @returns Array of sermon theme suggestions
 */
export function getSeasonalSermonThemes(count = 3): string[] {
  const liturgicalDate = getLiturgicalDate();
  const season = liturgicalDate.season;
  const themes = liturgicalDate.themes || [];
  
  const seasonalSuggestions: Record<LiturgicalSeason, string[]> = {
    Advent: [
      'Preparing our hearts for Christ\'s coming',
      'Finding hope in times of darkness',
      'The promise of the Messiah in prophecy',
      'Mary\'s response to God\'s call',
      'Waiting with expectancy and patience',
      'The light that overcomes the darkness'
    ],
    Christmas: [
      'The Word became flesh: Incarnation theology',
      'God\'s gift of love to humanity',
      'The significance of Immanuel - God with us',
      'The humility of the manger',
      'God\'s plan of salvation through Jesus',
      'Christmas beyond the holidays: Living the incarnation'
    ],
    Epiphany: [
      'Christ revealed to all nations',
      'Following the light of Christ',
      'God\'s revelation in unexpected places',
      'The journey of the Magi: Seeking Christ',
      'Transformation through encountering Christ',
      'Manifesting Christ in our daily lives'
    ],
    Lent: [
      'The wilderness journey with Christ',
      'Repentance and renewal of faith',
      'Spiritual disciplines that transform',
      'Facing our mortality and finding hope',
      'The cost of discipleship',
      'Preparing for Holy Week: The road to Jerusalem'
    ],
    HolyWeek: [
      'The passion narrative: Following Jesus to the cross',
      'Servant leadership: Washing the disciples\' feet',
      'The seven last words of Christ',
      'The paradox of the cross: Victory through surrender',
      'The empty tomb: Preparing for resurrection hope',
      'Standing at the foot of the cross: Faithful presence'
    ],
    Easter: [
      'Living as resurrection people',
      'From doubt to faith: Thomas\'s journey',
      'The road to Emmaus: Recognizing the risen Christ',
      'New creation through resurrection',
      'The Great Commission and our calling',
      'Witnesses of the resurrection in today\'s world'
    ],
    Pentecost: [
      'The coming of the Holy Spirit',
      'Spiritual gifts for building the church',
      'The birth of the church and our community',
      'Speaking God\'s truth in many languages',
      'The power of God for witness and service',
      'Unity in diversity through the Spirit'
    ],
    Ordinary: [
      'Growing in discipleship',
      'The parables of the kingdom',
      'Faith that works: Practical Christianity',
      'Building community in Christ',
      'Spiritual formation for everyday life',
      'The fruit of the Spirit in our relationships'
    ],
    Kingdomtide: [
      'The reign of Christ in our lives',
      'Kingdom values in a changing world',
      'Justice and righteousness in God\'s kingdom',
      'Christ the King: Ultimate authority',
      'Living between two kingdoms',
      'The coming kingdom: Hope for the future'
    ]
  };
  
  // Get suggestions for the current season
  const seasonalOptions = seasonalSuggestions[season as LiturgicalSeason] || seasonalSuggestions.Ordinary;
  
  // Create some specific suggestions based on the date
  const specificSuggestions = [
    `"${liturgicalDate.name}" - A sermon for ${liturgicalDate.description}`,
    `The meaning of ${themes[0] || season} in today's church`,
    `Lessons from ${liturgicalDate.name}: ${themes[1] || 'Living faithfully'}`
  ];
  
  // Combine seasonal options with specific suggestions
  const allSuggestions = [...specificSuggestions, ...seasonalOptions];
  
  // Shuffle and return requested number
  return shuffleArray(allSuggestions).slice(0, count);
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Get the liturgical readings for the current date or a specific date
 */
export function getLiturgicalReadings(date = new Date()): {
  reference: string;
  type: 'gospel' | 'epistle' | 'oldTestament' | 'psalm';
}[] {
  const liturgicalDate = getLiturgicalDate(date);
  const readings = liturgicalDate.readings || {};
  
  const result = [];
  
  if (readings.gospel) {
    result.push({ reference: readings.gospel, type: 'gospel' as const });
  }
  
  if (readings.epistle) {
    result.push({ reference: readings.epistle, type: 'epistle' as const });
  }
  
  if (readings.oldTestament) {
    result.push({ reference: readings.oldTestament, type: 'oldTestament' as const });
  }
  
  if (readings.psalm) {
    result.push({ reference: readings.psalm, type: 'psalm' as const });
  }
  
  return result;
}