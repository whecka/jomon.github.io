/* Bundled curriculum (works offline; live Claude generation arrives in Session 5).
   Units run in order. type: lesson | mob | boss. quiz answers use index `a`.
   jp strings may use kanji(reading) notation for furigana. */
window.JOMON_CURRICULUM = {
  mileposts: [
    { week: 1, title: 'Survival conversation', detail: 'Greetings, self-intro, directions, restaurant, numbers, te-form.' },
    { week: 2, title: 'Everyday grammar', detail: 'Past tense, desire, ability — ends with a boss test.' },
    { week: 3, title: 'In-law & social keigo', detail: 'Polite/humble forms, family terms, soft requests.' },
    { week: 4, title: 'Business onramp', detail: 'Meetings, email openers, phone — ends with a boss test.' }
  ],
  units: [
    {
      id: 'l1', type: 'lesson', week: 1, title: 'Greetings & introductions', jp: 'あいさつ',
      goal: 'Greet someone and introduce yourself.',
      teach: [
        { jp: 'おはようございます', en: 'Good morning (polite)' },
        { jp: 'こんにちは', en: 'Hello / good afternoon' },
        { jp: 'はじめまして', en: 'Nice to meet you (first time)' },
        { jp: 'わたしは___です', en: 'I am ___.' },
        { jp: 'よろしくおねがいします', en: 'Please treat me well / thanks in advance' }
      ],
      quiz: [
        { q: 'You meet your wife’s mother for the first time. You say…', choices: ['おやすみ', 'はじめまして', 'ただいま', 'いただきます'], a: 1 },
        { q: '「おはようございます」 is for…', choices: ['the morning', 'the evening', 'leaving', 'eating'], a: 0 },
        { q: 'How do you say “I am Shane.”?', choices: ['シェーンです', 'シェーンください', 'シェーンですか', 'シェーンました'], a: 0 },
        { q: '「よろしくおねがいします」 roughly means…', choices: ['goodbye forever', 'please treat me well', 'I’m hungry', 'see you tomorrow'], a: 1 }
      ]
    },
    {
      id: 'l2', type: 'lesson', week: 1, title: 'Asking directions', jp: '道(みち)をたずねる',
      goal: 'Ask where something is and understand the answer.',
      teach: [
        { jp: '駅(えき)', en: 'station' },
        { jp: '___はどこですか', en: 'Where is ___?' },
        { jp: '右(みぎ)', en: 'right' },
        { jp: '左(ひだり)', en: 'left' },
        { jp: 'まっすぐ', en: 'straight ahead' }
      ],
      quiz: [
        { q: '“Where is the station?” is…', choices: ['駅はどこですか', '駅をください', '駅です', '駅がすきです'], a: 0 },
        { q: '「右」 means…', choices: ['left', 'right', 'straight', 'behind'], a: 1 },
        { q: 'They say 「まっすぐです」. You should go…', choices: ['left', 'right', 'straight ahead', 'back'], a: 2 },
        { q: '「ひだり」 means…', choices: ['right', 'up', 'left', 'near'], a: 2 }
      ]
    },
    {
      id: 'l3', type: 'lesson', week: 1, title: 'At a restaurant', jp: 'レストランで',
      goal: 'Order food and ask for the bill.',
      teach: [
        { jp: 'メニュー', en: 'menu' },
        { jp: 'これをください', en: 'This one, please.' },
        { jp: '水(みず)', en: 'water' },
        { jp: 'おいしい', en: 'delicious' },
        { jp: 'おかんじょう おねがいします', en: 'The bill, please.' }
      ],
      quiz: [
        { q: 'To order, pointing at the menu, you say…', choices: ['これをください', 'これはなんですか', 'おいしいです', 'みずです'], a: 0 },
        { q: '「水」 means…', choices: ['tea', 'rice', 'water', 'fish'], a: 2 },
        { q: 'The food is tasty. You say…', choices: ['たかいです', 'おいしいです', 'さむいです', 'はやいです'], a: 1 },
        { q: 'To ask for the bill…', choices: ['メニューおねがいします', 'おかんじょうおねがいします', 'みずください', 'いきましょう'], a: 1 }
      ]
    },
    {
      id: 'l4', type: 'lesson', week: 1, title: 'Numbers & time', jp: '数字(すうじ)と時間(じかん)',
      goal: 'Count and tell the time.',
      teach: [
        { jp: '一(いち)、二(に)、三(さん)', en: 'one, two, three' },
        { jp: '何時(なんじ)ですか', en: 'What time is it?' },
        { jp: '___時(じ)', en: '___ o’clock' },
        { jp: '午前(ごぜん)', en: 'a.m.' },
        { jp: '午後(ごご)', en: 'p.m.' }
      ],
      quiz: [
        { q: '「三」 is the number…', choices: ['one', 'two', 'three', 'five'], a: 2 },
        { q: '“What time is it?” is…', choices: ['なんですか', '何時ですか', 'いくらですか', 'どこですか'], a: 1 },
        { q: '「午後」 means…', choices: ['a.m.', 'noon', 'p.m.', 'midnight'], a: 2 },
        { q: '“It’s 3 o’clock.”', choices: ['三時です', '三です', '三時間です', '三つです'], a: 0 }
      ]
    },
    {
      id: 'l5', type: 'lesson', week: 1, title: 'Polite requests (te-form)', jp: '〜てください',
      goal: 'Ask someone to do something politely.',
      teach: [
        { jp: '見(み)てください', en: 'Please look.' },
        { jp: '待(ま)ってください', en: 'Please wait.' },
        { jp: 'もう一度(いちど)', en: 'one more time' },
        { jp: 'ゆっくり', en: 'slowly' },
        { jp: 'ゆっくり話(はな)してください', en: 'Please speak slowly.' }
      ],
      quiz: [
        { q: '“Please wait.” is…', choices: ['見てください', '待ってください', '行ってください', '食べてください'], a: 1 },
        { q: '「もう一度」 means…', choices: ['not yet', 'one more time', 'over there', 'a little'], a: 1 },
        { q: 'Ask someone to speak slowly:', choices: ['はやく話してください', 'ゆっくり話してください', 'ゆっくりください', '話します'], a: 1 },
        { q: 'The te-form request pattern is…', choices: ['〜ました', '〜たいです', '〜てください', '〜です'], a: 2 }
      ]
    },
    {
      id: 'l6', type: 'lesson', week: 1, title: 'Past tense & wanting', jp: '〜ました／〜たいです',
      goal: 'Say what you did and what you want to do.',
      teach: [
        { jp: '食(た)べました', en: 'ate (past, polite)' },
        { jp: '行(い)きました', en: 'went' },
        { jp: '食(た)べたいです', en: 'I want to eat.' },
        { jp: '飲(の)みたいです', en: 'I want to drink.' },
        { jp: '昨日(きのう)', en: 'yesterday' }
      ],
      quiz: [
        { q: '「行きました」 means…', choices: ['I will go', 'I went', 'I want to go', 'please go'], a: 1 },
        { q: '“I want to eat sushi.”', choices: ['すしを食べました', 'すしを食べたいです', 'すしを食べてください', 'すしです'], a: 1 },
        { q: '「昨日」 means…', choices: ['tomorrow', 'today', 'yesterday', 'now'], a: 2 },
        { q: 'Which ending shows desire (“want to”)?', choices: ['〜ました', '〜たいです', '〜てください', '〜ません'], a: 1 }
      ]
    },
    {
      id: 'mob1', type: 'mob', week: 1, title: 'Week 1 mob test', jp: 'まとめテスト', yen: 60, pass: 0.6,
      goal: 'A mixed check on everything from week 1.',
      quiz: [
        { q: 'First-time greeting:', choices: ['おやすみ', 'はじめまして', 'おかえり', 'いただきます'], a: 1 },
        { q: '“Where is the station?”', choices: ['駅です', '駅はどこですか', '駅をください', '駅がいいです'], a: 1 },
        { q: '「右」 ＝', choices: ['left', 'right', 'straight', 'up'], a: 1 },
        { q: 'Order “this one”:', choices: ['これをください', 'これですか', 'これはいい', 'これます'], a: 0 },
        { q: '「午前」 ＝', choices: ['p.m.', 'a.m.', 'evening', 'night'], a: 1 },
        { q: '“Please wait.”', choices: ['待ってください', '見てください', '行きました', '食べたい'], a: 0 },
        { q: '“I went.”', choices: ['行きます', '行きたい', '行きました', '行ってください'], a: 2 },
        { q: '“I want to drink water.”', choices: ['水を飲みました', '水を飲みたいです', '水をください', '水です'], a: 1 }
      ]
    },
    {
      id: 'boss1', type: 'boss', week: 2, title: 'Boss test — first weeks', jp: 'ボス戦(せん)', yenMin: 300, yenMax: 400, pass: 0.8,
      goal: 'Genuinely hard. Pass ≥ 80% to claim the prize.',
      quiz: [
        { q: 'Most polite way to ask someone’s name:', choices: ['なまえは？', 'おなまえは何ですか', 'だれ？', 'なまえをください'], a: 1 },
        { q: 'Choose the correct te-form: 待つ →', choices: ['待て', '待って', '待ちて', '待つて'], a: 1 },
        { q: '「会議は午後3時からです。」 The meeting…', choices: ['ended at 3 p.m.', 'is from 3 p.m.', 'is 3 hours long', 'is at 3 a.m.'], a: 1 },
        { q: 'Politely ask someone to speak slowly:', choices: ['はやく話して', 'ゆっくり話してください', 'ゆっくりです', '話しました'], a: 1 },
        { q: '“I ate breakfast yesterday.”', choices: ['昨日 朝ごはんを食べます', '昨日 朝ごはんを食べました', '昨日 朝ごはんを食べたい', '朝ごはんです'], a: 1 },
        { q: 'Which means “want to go”?', choices: ['行きました', '行きたいです', '行ってください', '行きません'], a: 1 },
        { q: '「左」 ＝', choices: ['right', 'left', 'front', 'behind'], a: 1 },
        { q: 'Ask for the bill politely:', choices: ['メニューください', 'おかんじょうおねがいします', 'みずです', 'おいしい'], a: 1 },
        { q: '“This is delicious!”', choices: ['これはたかいです', 'これはおいしいです', 'これはさむいです', 'これです'], a: 1 },
        { q: 'Counter reading: 「三時」 ＝', choices: ['さんじ', 'みっつ', 'さんかい', 'みつじ'], a: 0 }
      ]
    }
  ]
};
