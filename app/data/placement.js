/* First-run placement test. Questions ramp from kana -> vocab -> grammar -> kanji
   -> intermediate/business. Score maps to a starting level. No API needed. */
window.JOMON_PLACEMENT = {
  questions: [
    { band: 'kana', q: 'Which hiragana is “a”?', choices: ['い', 'あ', 'う', 'お'], a: 1 },
    { band: 'kana', q: 'How do you read「か」?', choices: ['sa', 'ta', 'ka', 'na'], a: 2 },
    { band: 'vocab', q: '「みず」 means…', choices: ['fire', 'water', 'hand', 'tree'], a: 1 },
    { band: 'greeting', q: '「こんにちは」 is used to say…', choices: ['good night', 'thank you', 'hello / good afternoon', 'goodbye'], a: 2 },
    { band: 'grammar', q: 'わたし ___ がくせいです。 (I am a student.)', choices: ['を', 'は', 'に', 'へ'], a: 1 },
    { band: 'kanji', q: 'What does the kanji「火」 mean?', choices: ['water', 'moon', 'fire', 'mountain'], a: 2 },
    { band: 'grammar', q: 'The te-form of たべる (to eat) is…', choices: ['たべて', 'たべって', 'たべりて', 'たべいて'], a: 0 },
    { band: 'intermediate', q: '「たべたいです」 means…', choices: ['I ate', 'please eat', 'I want to eat', 'let’s eat'], a: 2 },
    { band: 'keigo', q: '「おなまえは何(なん)ですか。」 is asking for your…', choices: ['age', 'name', 'address', 'job'], a: 1 },
    { band: 'business', q: '「会議(かいぎ)は3時(じ)からです。」 means the meeting…', choices: ['ended at 3:00', 'is from 3:00', 'is every 3 hours', 'has 3 people'], a: 1 }
  ],
  // score (0..10) -> level
  levels: [
    { min: 0, key: 1, label: 'Near-beginner', note: 'We’ll start from kana and survival phrases.' },
    { min: 3, key: 2, label: 'Advanced beginner', note: 'Solid kana — we’ll build core grammar and kanji.' },
    { min: 6, key: 3, label: 'Lower intermediate', note: 'Good base — we’ll push toward keigo and business.' },
    { min: 8, key: 4, label: 'Intermediate', note: 'Strong — expect a brisk pace and early boss tests.' }
  ],
  levelFor: function (score) {
    var L = this.levels, out = L[0];
    for (var i = 0; i < L.length; i++) if (score >= L[i].min) out = L[i];
    return out;
  }
};
