import type { VersusQuestion } from '../types/game';

/**
 * Bank 115 Soal Acak Bahasa Inggris SMP untuk Gedung Arena Versus 1v1 (PvP & Bot).
 * Seluruh soal di sini 100% BERBEDA dari 50 soal di Gedung Bab 1–5.
 */
export const VERSUS_BANK: VersusQuestion[] = [
  // --- 1-20: Tenses & Auxiliaries ---
  {
    id: 'v1',
    category: 'Tenses',
    prompt: 'She usually _____ breakfast at 6:30 a.m. before going to school.',
    options: ['eat', 'eats', 'eating', 'eaten'],
    correctIndex: 1,
    explanation: 'Simple Present dengan subjek tunggal "She" menambahkan akhiran -s menjadi "eats".'
  },
  {
    id: 'v2',
    category: 'Tenses',
    prompt: 'Look! The students _____ the flag ceremony in the schoolyard right now.',
    options: ['attend', 'attends', 'are attending', 'attended'],
    correctIndex: 2,
    explanation: 'Kata "Look!" dan "right now" menandakan Present Continuous Tense ("are attending").'
  },
  {
    id: 'v3',
    category: 'Tenses',
    prompt: 'Yesterday afternoon, my mother _____ a delicious chocolate cake for my sister.',
    options: ['bake', 'bakes', 'baked', 'baking'],
    correctIndex: 2,
    explanation: 'Keterangan waktu lampau "Yesterday afternoon" memakai Verb 2 ("baked").'
  },
  {
    id: 'v4',
    category: 'Tenses',
    prompt: 'While I was reading a novel, my brother _____ video games in his room.',
    options: ['was playing', 'plays', 'is playing', 'has played'],
    correctIndex: 0,
    explanation: 'Dua kejadian sedang berlangsung bersamaan di masa lampau memakai Past Continuous ("was playing").'
  },
  {
    id: 'v5',
    category: 'Tenses',
    prompt: 'We _____ in Bandung since 2019 and we really love this city.',
    options: ['live', 'lived', 'have lived', 'are living'],
    correctIndex: 2,
    explanation: 'Kata "since 2019" menunjukkan Present Perfect Tense ("have lived").'
  },
  {
    id: 'v6',
    category: 'Tenses',
    prompt: 'Next week, our class _____ the National Museum in Jakarta.',
    options: ['visited', 'will visit', 'visits', 'was visiting'],
    correctIndex: 1,
    explanation: '"Next week" menandakan masa depan (Simple Future Tense: "will visit").'
  },
  {
    id: 'v7',
    category: 'Tenses',
    prompt: 'Did you _____ the science homework last night?',
    options: ['finish', 'finished', 'finishes', 'finishing'],
    correctIndex: 0,
    explanation: 'Setelah kata tanya "Did" di kalimat lampau, kata kerja kembali ke Verb 1 ("finish").'
  },
  {
    id: 'v8',
    category: 'Tenses',
    prompt: 'Water _____ at 100 degrees Celsius under normal atmospheric pressure.',
    options: ['boil', 'boils', 'boiled', 'is boiling'],
    correctIndex: 1,
    explanation: 'Fakta ilmiah umum selalu memakai Simple Present Tense ("boils").'
  },
  {
    id: 'v9',
    category: 'Tenses',
    prompt: 'By the time the teacher arrived, the students _____ cleaning the classroom.',
    options: ['finish', 'have finished', 'had finished', 'will finish'],
    correctIndex: 2,
    explanation: 'Kejadian yang sudah selesai sebelum kejadian lampau lainnya memakai Past Perfect ("had finished").'
  },
  {
    id: 'v10',
    category: 'Tenses',
    prompt: 'She has already _____ three English storybooks this month.',
    options: ['read', 'reads', 'reading', 'to read'],
    correctIndex: 0,
    explanation: 'Setelah "has already", diperlukan Verb 3 dari "read" (ditulis sama: "read", dibaca /red/).'
  },
  {
    id: 'v11',
    category: 'Tenses',
    prompt: 'They _____ not come to the basketball practice because it was raining heavily.',
    options: ['do', 'does', 'did', 'are'],
    correctIndex: 2,
    explanation: 'Klausa kedua berbentuk lampau ("was raining"), sehingga klausa pertama memakai "did".'
  },
  {
    id: 'v12',
    category: 'Tenses',
    prompt: 'Listen! Someone _____ at the front door.',
    options: ['knocks', 'knocked', 'is knocking', 'was knocking'],
    correctIndex: 2,
    explanation: '"Listen!" menandakan aksi sedang terjadi saat ini -> "is knocking".'
  },
  {
    id: 'v13',
    category: 'Tenses',
    prompt: 'How long _____ you known your best friend?',
    options: ['do', 'have', 'are', 'did'],
    correctIndex: 1,
    explanation: 'Pertanyaan durasi hingga sekarang ("How long... known") memakai Present Perfect: "have".'
  },
  {
    id: 'v14',
    category: 'Tenses',
    prompt: 'My father _____ to his office by train every weekday.',
    options: ['commute', 'commutes', 'commuted', 'commuting'],
    correctIndex: 1,
    explanation: 'Kebiasaan rutin ("every weekday") dengan subjek tunggal "My father" memakai "commutes".'
  },
  {
    id: 'v15',
    category: 'Tenses',
    prompt: 'I _____ my keys somewhere in the garden two days ago.',
    options: ['lose', 'lost', 'losed', 'losing'],
    correctIndex: 1,
    explanation: 'Verb 2 dari "lose" adalah irregular verb "lost".'
  },
  {
    id: 'v16',
    category: 'Tenses',
    prompt: 'Tomorrow morning at 9 a.m., we _____ our final English presentation.',
    options: ['will be presenting', 'presented', 'present', 'have presented'],
    correctIndex: 0,
    explanation: 'Aksi yang sedang berlangsung pada waktu spesifik di masa depan memakai Future Continuous ("will be presenting").'
  },
  {
    id: 'v17',
    category: 'Tenses',
    prompt: 'Nadia _____ never seen snow before she visited Japan.',
    options: ['has', 'had', 'was', 'did'],
    correctIndex: 1,
    explanation: 'Sebelum kejadian lampau ("visited Japan") memakai Past Perfect ("had never seen").'
  },
  {
    id: 'v18',
    category: 'Tenses',
    prompt: 'Does your uncle _____ in a hospital near here?',
    options: ['work', 'works', 'worked', 'working'],
    correctIndex: 0,
    explanation: 'Setelah auxiliary "Does", gunakan kata kerja dasar Verb 1 ("work").'
  },
  {
    id: 'v19',
    category: 'Tenses',
    prompt: 'The sun _____ in the east and sets in the west.',
    options: ['rise', 'rises', 'rose', 'rising'],
    correctIndex: 1,
    explanation: 'Kebenaran umum memakai Simple Present Tense ("rises").'
  },
  {
    id: 'v20',
    category: 'Tenses',
    prompt: 'We _____ a lot of photos during our school trip to Yogyakarta last year.',
    options: ['take', 'took', 'taken', 'taking'],
    correctIndex: 1,
    explanation: 'Verb 2 dari "take" untuk waktu lampau "last year" adalah "took".'
  },

  // --- 21-35: Passive Voice & Modals ---
  {
    id: 'v21',
    category: 'Passive Voice',
    prompt: 'Indonesian Independence Day _____ every August 17th.',
    options: ['celebrates', 'is celebrated', 'was celebrated', 'celebrating'],
    correctIndex: 1,
    explanation: 'Fakta rutin dalam bentuk pasif Simple Present menggunakan "is celebrated".'
  },
  {
    id: 'v22',
    category: 'Passive Voice',
    prompt: 'Borobudur Temple _____ by the Syailendra Dynasty in the 8th century.',
    options: ['built', 'is built', 'was built', 'were built'],
    correctIndex: 2,
    explanation: 'Kejadian lampau dalam bentuk pasif tunggal memakai "was built".'
  },
  {
    id: 'v23',
    category: 'Passive Voice',
    prompt: 'These delicious rendang dishes _____ by Chef Renata this morning.',
    options: ['was cooked', 'were cooked', 'cooked', 'are cooking'],
    correctIndex: 1,
    explanation: 'Subjek jamak "dishes" dalam pasif lampau memakai "were cooked".'
  },
  {
    id: 'v24',
    category: 'Passive Voice',
    prompt: 'All library books must _____ before Friday afternoon.',
    options: ['return', 'returned', 'be returned', 'returning'],
    correctIndex: 2,
    explanation: 'Modal pasif mengikuti pola modal + be + Verb 3 ("must be returned").'
  },
  {
    id: 'v25',
    category: 'Passive Voice',
    prompt: 'A new bridge _____ across the river right now.',
    options: ['is building', 'is being built', 'was built', 'builds'],
    correctIndex: 1,
    explanation: 'Pasif yang sedang dikerjakan saat ini memakai "is being built".'
  },
  {
    id: 'v26',
    category: 'Modals',
    prompt: 'You _____ wear a helmet when riding a motorcycle for your safety.',
    options: ['must', 'might', 'could', 'would'],
    correctIndex: 0,
    explanation: 'Kewajiban dan aturan keselamatan dinyatakan dengan modal "must".'
  },
  {
    id: 'v27',
    category: 'Modals',
    prompt: 'Students _____ use mobile phones during the national examination.',
    options: ['must', 'must not', 'need to', 'can'],
    correctIndex: 1,
    explanation: 'Larangan keras dinyatakan dengan "must not".'
  },
  {
    id: 'v28',
    category: 'Modals',
    prompt: '_____ I borrow your English dictionary for a minute, please?',
    options: ['May', 'Must', 'Should', 'Will'],
    correctIndex: 0,
    explanation: 'Meminta izin dengan sopan menggunakan "May I...?".'
  },
  {
    id: 'v29',
    category: 'Modals',
    prompt: 'You look very tired. You _____ take a rest and drink some water.',
    options: ['should', 'cannot', 'must not', 'will not'],
    correctIndex: 0,
    explanation: 'Memberikan saran yang baik menggunakan "should".'
  },
  {
    id: 'v30',
    category: 'Modals',
    prompt: 'When Budi was five years old, he _____ swim very well.',
    options: ['can', 'could', 'may', 'shall'],
    correctIndex: 1,
    explanation: 'Kemampuan di masa lampau ("When Budi was five") memakai "could".'
  },
  {
    id: 'v31',
    category: 'Passive Voice',
    prompt: 'English _____ in many countries around the world as an international language.',
    options: ['speaks', 'is spoken', 'spoke', 'speaking'],
    correctIndex: 1,
    explanation: 'Bahasa Inggris dituturkan (pasif): "is spoken".'
  },
  {
    id: 'v32',
    category: 'Passive Voice',
    prompt: 'The school trophies _____ neatly inside the glass cabinet.',
    options: ['are kept', 'is kept', 'keeping', 'was keep'],
    correctIndex: 0,
    explanation: 'Subjek jamak "trophies" berpasangan dengan "are kept".'
  },
  {
    id: 'v33',
    category: 'Modals',
    prompt: 'The sky is very dark. It _____ rain heavily soon.',
    options: ['might', 'must not', 'ought', 'did'],
    correctIndex: 0,
    explanation: 'Kemungkinan yang cukup besar dinyatakan dengan "might".'
  },
  {
    id: 'v34',
    category: 'Modals',
    prompt: 'If you want to pass the test, you _____ study harder.',
    options: ['have to', 'has to', 'having to', 'had'],
    correctIndex: 0,
    explanation: 'Subjek "you" memakai "have to" untuk menyatakan keharusan.'
  },
  {
    id: 'v35',
    category: 'Passive Voice',
    prompt: 'The winning essay will _____ in the school magazine next month.',
    options: ['publish', 'published', 'be published', 'publishing'],
    correctIndex: 2,
    explanation: 'Future passive: will + be + Verb 3 ("be published").'
  },

  // --- 36-55: Degrees of Comparison & Pronouns ---
  {
    id: 'v36',
    category: 'Comparison',
    prompt: 'Mount Everest is the _____ mountain in the world.',
    options: ['high', 'higher', 'highest', 'most high'],
    correctIndex: 2,
    explanation: 'Superlative untuk kata sifat pendek memakai akhiran "-est" ("highest").'
  },
  {
    id: 'v37',
    category: 'Comparison',
    prompt: 'Traveling by plane is _____ than traveling by bus.',
    options: ['fast', 'faster', 'fastest', 'more fast'],
    correctIndex: 1,
    explanation: 'Perbandingan dua hal ("than") dengan kata sifat pendek memakai "-er" ("faster").'
  },
  {
    id: 'v38',
    category: 'Comparison',
    prompt: 'This science project is _____ than the previous one.',
    options: ['more difficult', 'difficulter', 'most difficult', 'as difficult'],
    correctIndex: 0,
    explanation: 'Kata sifat panjang (3 suku kata: dif-fi-cult) memakai "more difficult" + "than".'
  },
  {
    id: 'v39',
    category: 'Comparison',
    prompt: 'Rani’s handwriting is as _____ as her sister’s.',
    options: ['neat', 'neater', 'neatest', 'more neat'],
    correctIndex: 0,
    explanation: 'Perbandingan setara "as ... as" menggunakan kata sifat bentuk dasar ("neat").'
  },
  {
    id: 'v40',
    category: 'Comparison',
    prompt: 'Among all the runners, Bagas finished the race with the _____ time.',
    options: ['good', 'better', 'best', 'most good'],
    correctIndex: 2,
    explanation: 'Bentuk superlative tidak beraturan dari "good" adalah "best".'
  },
  {
    id: 'v41',
    category: 'Comparison',
    prompt: 'Today’s traffic is _____ than yesterday’s because of the heavy rain.',
    options: ['bad', 'worse', 'worst', 'badder'],
    correctIndex: 1,
    explanation: 'Bentuk comparative dari "bad" adalah "worse".'
  },
  {
    id: 'v42',
    category: 'Pronouns',
    prompt: 'My sister and I made this origami swan by _____.',
    options: ['myself', 'herself', 'ourselves', 'themselves'],
    correctIndex: 2,
    explanation: '"My sister and I" setara dengan "We", sehingga reflexive pronoun-nya adalah "ourselves".'
  },
  {
    id: 'v43',
    category: 'Pronouns',
    prompt: 'That blue backpack belongs to Kevin. It is _____.',
    options: ['he', 'him', 'his', 'himself'],
    correctIndex: 2,
    explanation: 'Possessive pronoun milik laki-laki tunggal tanpa kata benda setelahnya adalah "his".'
  },
  {
    id: 'v44',
    category: 'Pronouns',
    prompt: 'The teacher asked _____ to submit the assignment before noon.',
    options: ['we', 'us', 'our', 'ours'],
    correctIndex: 1,
    explanation: 'Setelah kata kerja "asked", dibutuhkan object pronoun ("us").'
  },
  {
    id: 'v45',
    category: 'Pronouns',
    prompt: 'This is the library _____ we usually borrow English storybooks.',
    options: ['who', 'which', 'where', 'whose'],
    correctIndex: 2,
    explanation: 'Menjelaskan tempat ("library") menggunakan relative adverb "where".'
  },
  {
    id: 'v46',
    category: 'Pronouns',
    prompt: 'The girl _____ won the speech contest is from Class 8B.',
    options: ['who', 'which', 'whom', 'where'],
    correctIndex: 0,
    explanation: 'Merujuk subjek orang ("The girl") memakai relative pronoun "who".'
  },
  {
    id: 'v47',
    category: 'Comparison',
    prompt: 'Gold is much _____ than silver.',
    options: ['expensive', 'more expensive', 'most expensive', 'expensiver'],
    correctIndex: 1,
    explanation: 'Perbandingan dengan "than" untuk kata sifat panjang memakai "more expensive".'
  },
  {
    id: 'v48',
    category: 'Pronouns',
    prompt: 'Please help _____ to some fresh fruit on the dining table.',
    options: ['yourself', 'you', 'your', 'yours'],
    correctIndex: 0,
    explanation: 'Ungkapan sopan mempersilakan tamu mengambil makanan: "help yourself".'
  },
  {
    id: 'v49',
    category: 'Pronouns',
    prompt: 'Neither Dino nor his friends _____ ready for the surprise quiz.',
    options: ['is', 'are', 'was', 'has'],
    correctIndex: 1,
    explanation: 'Pada "Neither ... nor ...", kata kerja mengikuti subjek terdekat ("his friends" -> jamak -> "are").'
  },
  {
    id: 'v50',
    category: 'Pronouns',
    prompt: 'Whose umbrella is this? I think it belongs to _____.',
    options: ['she', 'her', 'hers', 'herself'],
    correctIndex: 1,
    explanation: 'Setelah preposisi "to" ("belongs to"), gunakan object pronoun "her".'
  },

  // --- 51-75: Prepositions, Conjunctions & Conditionals ---
  {
    id: 'v51',
    category: 'Prepositions',
    prompt: 'Our English club meeting is held _____ Wednesday afternoon.',
    options: ['in', 'on', 'at', 'by'],
    correctIndex: 1,
    explanation: 'Nama hari ("Wednesday") selalu menggunakan preposisi "on".'
  },
  {
    id: 'v52',
    category: 'Prepositions',
    prompt: 'The plane will take off _____ 7:15 a.m. sharp.',
    options: ['in', 'on', 'at', 'for'],
    correctIndex: 2,
    explanation: 'Jam atau waktu spesifik ("7:15 a.m.") menggunakan preposisi "at".'
  },
  {
    id: 'v53',
    category: 'Prepositions',
    prompt: 'My cousin was born _____ July 2012.',
    options: ['in', 'on', 'at', 'to'],
    correctIndex: 0,
    explanation: 'Bulan dan tahun tanpa tanggal spesifik menggunakan preposisi "in".'
  },
  {
    id: 'v54',
    category: 'Prepositions',
    prompt: 'She is very interested _____ learning robotics and coding.',
    options: ['on', 'at', 'in', 'with'],
    correctIndex: 2,
    explanation: 'Pasangan preposisi yang tepat untuk "interested" adalah "in" ("interested in").'
  },
  {
    id: 'v55',
    category: 'Prepositions',
    prompt: 'The cat jumped _____ the wooden fence to chase the butterfly.',
    options: ['over', 'between', 'among', 'underneath'],
    correctIndex: 0,
    explanation: 'Melompati bagian atas pagar dinyatakan dengan "over".'
  },
  {
    id: 'v56',
    category: 'Conjunctions',
    prompt: '_____ it was raining heavily, the football team continued practicing.',
    options: ['Because', 'Although', 'Therefore', 'So'],
    correctIndex: 1,
    explanation: 'Menyatakan pertentangan ("meskipun hujan deras, tetap berlatih") memakai "Although".'
  },
  {
    id: 'v57',
    category: 'Conjunctions',
    prompt: 'We stayed indoors _____ the storm outside was very dangerous.',
    options: ['because', 'although', 'unless', 'but'],
    correctIndex: 0,
    explanation: 'Menyatakan alasan/sebab memakai "because".'
  },
  {
    id: 'v58',
    category: 'Conjunctions',
    prompt: 'Bring an umbrella with you _____ it rains later today.',
    options: ['in case', 'so that', 'in order to', 'despite'],
    correctIndex: 0,
    explanation: '"in case" berarti "kalau-kalau / sebagai antisipasi jika".'
  },
  {
    id: 'v59',
    category: 'Conjunctions',
    prompt: 'I always brush my teeth _____ going to bed at night.',
    options: ['before', 'after', 'while', 'since'],
    correctIndex: 0,
    explanation: 'Menggosok gigi dilakukan sebelum tidur ("before going to bed").'
  },
  {
    id: 'v60',
    category: 'Conditionals',
    prompt: 'If the weather is sunny tomorrow, we _____ a picnic in the park.',
    options: ['have', 'will have', 'had', 'would have'],
    correctIndex: 1,
    explanation: 'Conditional Type 1 (kemungkinan nyata): If + Simple Present, Subject + will + Verb 1.'
  },
  {
    id: 'v61',
    category: 'Conditionals',
    prompt: 'If you heat ice, it _____ into liquid water.',
    options: ['melt', 'melts', 'melted', 'would melt'],
    correctIndex: 1,
    explanation: 'Conditional Type 0 (fakta ilmiah): If + Simple Present, Simple Present ("melts").'
  },
  {
    id: 'v62',
    category: 'Conditionals',
    prompt: 'If I had wings like a bird, I _____ fly around the world.',
    options: ['will', 'would', 'can', 'shall'],
    correctIndex: 1,
    explanation: 'Conditional Type 2 (khayalan sekarang): If + V2, Subject + would + Verb 1.'
  },
  {
    id: 'v63',
    category: 'Conjunctions',
    prompt: 'You won’t catch the morning bus _____ you leave home right now.',
    options: ['if', 'unless', 'because', 'since'],
    correctIndex: 1,
    explanation: '"unless" berarti "kecuali jika / jika tidak".'
  },
  {
    id: 'v64',
    category: 'Conjunctions',
    prompt: 'She woke up early _____ miss the school excursion.',
    options: ['in order not to', 'so that', 'because of', 'in spite of'],
    correctIndex: 0,
    explanation: 'Tujuan negatif diikuti Verb 1 menggunakan "in order not to".'
  },
  {
    id: 'v65',
    category: 'Prepositions',
    prompt: 'The library is located _____ the science laboratory and the art room.',
    options: ['among', 'between', 'across', 'through'],
    correctIndex: 1,
    explanation: 'Di antara dua lokasi spesifik menggunakan "between".'
  },
  {
    id: 'v66',
    category: 'Prepositions',
    prompt: 'Please divide these snacks equally _____ all twenty students.',
    options: ['between', 'among', 'beside', 'into'],
    correctIndex: 1,
    explanation: 'Di antara lebih dari dua orang ("all twenty students") memakai "among".'
  },
  {
    id: 'v67',
    category: 'Prepositions',
    prompt: 'Don’t forget to turn off the lights _____ you leave the room.',
    options: ['when', 'during', 'despite', 'for'],
    correctIndex: 0,
    explanation: 'Menyatakan waktu kejadian ("ketika kamu meninggalkan ruangan") memakai "when".'
  },
  {
    id: 'v68',
    category: 'Conjunctions',
    prompt: 'The match was postponed _____ the heavy thunderstorm.',
    options: ['because', 'because of', 'although', 'despite of'],
    correctIndex: 1,
    explanation: 'Diikuti frasa benda ("the heavy thunderstorm"), sehingga menggunakan "because of".'
  },
  {
    id: 'v69',
    category: 'Conjunctions',
    prompt: '_____ his leg injury, Anton still cheered for his teammates from the bench.',
    options: ['Although', 'Despite', 'Because', 'Whereas'],
    correctIndex: 1,
    explanation: '"Despite" diikuti frasa benda ("his leg injury") untuk menyatakan kontras.'
  },
  {
    id: 'v70',
    category: 'Prepositions',
    prompt: 'Sinta is very proud _____ her younger brother’s chess trophy.',
    options: ['with', 'of', 'at', 'for'],
    correctIndex: 1,
    explanation: 'Kolokasi yang tepat adalah "proud of" (bangga terhadap).'
  },
  {
    id: 'v71',
    category: 'Prepositions',
    prompt: 'Are you afraid _____ walking through the dark forest?',
    options: ['of', 'to', 'in', 'by'],
    correctIndex: 0,
    explanation: '"afraid of" berarti takut terhadap sesuatu.'
  },
  {
    id: 'v72',
    category: 'Prepositions',
    prompt: 'The students walked quietly _____ the museum gallery.',
    options: ['through', 'between', 'above', 'onto'],
    correctIndex: 0,
    explanation: 'Berjalan melewati bagian dalam galeri dinyatakan dengan "through".'
  },
  {
    id: 'v73',
    category: 'Conjunctions',
    prompt: 'I like both swimming _____ cycling on weekends.',
    options: ['or', 'and', 'but', 'nor'],
    correctIndex: 1,
    explanation: 'Pasangan korelatif "both ... and ...".'
  },
  {
    id: 'v74',
    category: 'Conjunctions',
    prompt: 'He studied very hard; _____, he achieved the highest grade in English.',
    options: ['however', 'therefore', 'nevertheless', 'otherwise'],
    correctIndex: 1,
    explanation: 'Menyatakan akibat logis memakai "therefore" (oleh karena itu).'
  },
  {
    id: 'v75',
    category: 'Conditionals',
    prompt: 'If we plant more trees today, the air _____ cleaner in the future.',
    options: ['becomes', 'will become', 'became', 'had become'],
    correctIndex: 1,
    explanation: 'Conditional Type 1 menggunakan "will become" pada klausa utama.'
  },

  // --- 76-95: Vocabulary, Phrasal Verbs & Idioms ---
  {
    id: 'v76',
    category: 'Phrasal Verbs',
    prompt: 'Please _____ the volume of the speaker; it is too loud for the neighbors.',
    options: ['turn up', 'turn down', 'turn on', 'turn into'],
    correctIndex: 1,
    explanation: '"turn down" berarti mengecilkan volume atau suara.'
  },
  {
    id: 'v77',
    category: 'Phrasal Verbs',
    prompt: 'Don’t _____ on your dream even when the challenges feel tough.',
    options: ['give up', 'give out', 'give away', 'give back'],
    correctIndex: 0,
    explanation: '"give up" berarti menyerah.'
  },
  {
    id: 'v78',
    category: 'Phrasal Verbs',
    prompt: 'If you don’t know the meaning of a word, _____ it _____ in the dictionary.',
    options: ['look / up', 'look / after', 'look / for', 'look / forward'],
    correctIndex: 0,
    explanation: '"look up" berarti mencari informasi atau arti kata di kamus.'
  },
  {
    id: 'v79',
    category: 'Phrasal Verbs',
    prompt: 'My aunt asked me to _____ her cute cat while she is out of town.',
    options: ['look after', 'look at', 'look out', 'look into'],
    correctIndex: 0,
    explanation: '"look after" berarti merawat atau menjaga.'
  },
  {
    id: 'v80',
    category: 'Phrasal Verbs',
    prompt: 'We need to _____ early tomorrow so we don’t miss the sunrise at Bromo.',
    options: ['set off', 'put off', 'call off', 'take off'],
    correctIndex: 0,
    explanation: '"set off" berarti berangkat memulai perjalanan.'
  },
  {
    id: 'v81',
    category: 'Vocabulary',
    prompt: 'The opposite meaning (antonym) of "generous" is _____.',
    options: ['kind', 'stingy', 'polite', 'honest'],
    correctIndex: 1,
    explanation: '"generous" (dermawan) berlawanan arti dengan "stingy" (pelit/kikir).'
  },
  {
    id: 'v82',
    category: 'Vocabulary',
    prompt: 'A person who designs buildings and bridges is called an _____.',
    options: ['artisan', 'architect', 'accountant', 'astronomer'],
    correctIndex: 1,
    explanation: 'Perancang bangunan disebut "architect" (arsitek).'
  },
  {
    id: 'v83',
    category: 'Vocabulary',
    prompt: 'The synonym of "enormous" is _____.',
    options: ['tiny', 'huge', 'narrow', 'shallow'],
    correctIndex: 1,
    explanation: '"enormous" (sangat besar) bersinonim dengan "huge".'
  },
  {
    id: 'v84',
    category: 'Vocabulary',
    prompt: 'The antonym of "ancient" is _____.',
    options: ['old', 'historic', 'modern', 'antique'],
    correctIndex: 2,
    explanation: '"ancient" (kuno) berlawanan dengan "modern".'
  },
  {
    id: 'v85',
    category: 'Vocabulary',
    prompt: 'Please handle this crystal vase carefully because it is very _____.',
    options: ['fragile', 'durable', 'sturdy', 'heavy'],
    correctIndex: 0,
    explanation: '"fragile" berarti mudah pecah / rapuh.'
  },
  {
    id: 'v86',
    category: 'Idioms',
    prompt: 'The math test was "a piece of cake" for Dina. The idiom means it was _____.',
    options: ['very sweet', 'very easy', 'very messy', 'very expensive'],
    correctIndex: 1,
    explanation: 'Idiom "a piece of cake" berarti sangat mudah dikerjakan.'
  },
  {
    id: 'v87',
    category: 'Idioms',
    prompt: 'Before going on stage, Maya’s friends told her "Break a leg!", which means _____.',
    options: ['be careful', 'good luck', 'hurry up', 'sit down'],
    correctIndex: 1,
    explanation: 'Idiom teater/panggung "Break a leg!" berarti semoga berhasil / sukses (good luck).'
  },
  {
    id: 'v88',
    category: 'Vocabulary',
    prompt: 'A book that gives an alphabetical list of words and their meanings is a _____.',
    options: ['novel', 'dictionary', 'magazine', 'brochure'],
    correctIndex: 1,
    explanation: 'Daftar kata alfabetis beserta maknanya terdapat di "dictionary" (kamus).'
  },
  {
    id: 'v89',
    category: 'Phrasal Verbs',
    prompt: 'The outdoor concert was _____ because of the sudden thunderstorm.',
    options: ['called off', 'put on', 'turned up', 'carried on'],
    correctIndex: 0,
    explanation: '"called off" berarti dibatalkan.'
  },
  {
    id: 'v90',
    category: 'Vocabulary',
    prompt: 'We should _____ plastic bottles so they can be turned into useful products.',
    options: ['recycle', 'pollute', 'destroy', 'waste'],
    correctIndex: 0,
    explanation: '"recycle" berarti mendaur ulang.'
  },
  {
    id: 'v91',
    category: 'Vocabulary',
    prompt: 'The synonym of "brave" is _____.',
    options: ['cowardly', 'courageous', 'timid', 'nervous'],
    correctIndex: 1,
    explanation: '"brave" (berani) bersinonim dengan "courageous".'
  },
  {
    id: 'v92',
    category: 'Vocabulary',
    prompt: 'The antonym of "temporary" is _____.',
    options: ['brief', 'short', 'permanent', 'momentary'],
    correctIndex: 2,
    explanation: '"temporary" (sementara) berlawanan dengan "permanent" (tetap).'
  },
  {
    id: 'v93',
    category: 'Phrasal Verbs',
    prompt: 'Please _____ your shoes before stepping onto the clean carpet.',
    options: ['take off', 'put up', 'get over', 'run out'],
    correctIndex: 0,
    explanation: '"take off" berarti melepas (sepatu/pakaian).'
  },
  {
    id: 'v94',
    category: 'Vocabulary',
    prompt: 'A place where sick people receive medical treatment is a _____.',
    options: ['stadium', 'hospital', 'bakery', 'museum'],
    correctIndex: 1,
    explanation: 'Tempat perawatan medis adalah "hospital" (rumah sakit).'
  },
  {
    id: 'v95',
    category: 'Idioms',
    prompt: 'We only visit our village "once in a blue moon", meaning _____.',
    options: ['every night', 'very rarely', 'every month', 'very quickly'],
    correctIndex: 1,
    explanation: 'Idiom "once in a blue moon" berarti sangat jarang sekali.'
  },

  // --- 96-115: Functional Expressions, Dialogues & Word Formation ---
  {
    id: 'v96',
    category: 'Dialogue',
    prompt: 'Rafi: "I won first place in the national robotics Olympiad!"\nSari: "_____! You really deserve it."',
    options: ['I am sorry to hear that', 'Congratulations', 'Never mind', 'Excuse me'],
    correctIndex: 1,
    explanation: 'Merayakan keberhasilan teman menggunakan ungkapan "Congratulations!".'
  },
  {
    id: 'v97',
    category: 'Dialogue',
    prompt: 'Stranger: "Excuse me, could you tell me the way to the post office?"\nYou: "_____. Go straight two blocks and turn left."',
    options: ['Certainly', 'No problem at all, I forgot', 'I don’t care', 'That’s impossible'],
    correctIndex: 0,
    explanation: '"Certainly" (Tentu saja) adalah respon sopan untuk membantu menunjukkan arah.'
  },
  {
    id: 'v98',
    category: 'Dialogue',
    prompt: 'Waiter: "Would you like anything else to drink?"\nCustomer: "_____, just a glass of iced tea, please."',
    options: ['Yes, I hate it', 'No, thank you', 'You are welcome', 'Good afternoon'],
    correctIndex: 1,
    explanation: 'Menolak tambahan pesanan dengan sopan menggunakan "No, thank you".'
  },
  {
    id: 'v99',
    category: 'Dialogue',
    prompt: 'Lina: "Thank you so much for helping me carry these heavy books."\nBima: "_____."',
    options: ['I hope so', 'My pleasure', 'Not at all, I am angry', 'See you yesterday'],
    correctIndex: 1,
    explanation: '"My pleasure" (Dengan senang hati) adalah balasan sopan atas ucapan terima kasih.'
  },
  {
    id: 'v100',
    category: 'Dialogue',
    prompt: 'Notice at the Zoo: "DO NOT FEED THE ANIMALS". What does this notice mean?',
    options: [
      'Visitors must bring food for animals',
      'Visitors are forbidden to give food to animals',
      'Animals are not hungry today',
      'Visitors may feed animals after noon'
    ],
    correctIndex: 1,
    explanation: 'Larangan "DO NOT FEED" berarti pengunjung dilarang memberi makan hewan.'
  },
  {
    id: 'v101',
    category: 'Word Form',
    prompt: 'We must protect the _____ of endangered tropical rainforests.',
    options: ['exist', 'existing', 'existence', 'existed'],
    correctIndex: 2,
    explanation: 'Setelah artikel "the" dan sebelum "of" dibutuhkan kata benda (noun): "existence".'
  },
  {
    id: 'v102',
    category: 'Word Form',
    prompt: 'The magician performed the trick so _____ that everyone clapped loudly.',
    options: ['amazing', 'amaze', 'amazingly', 'amazement'],
    correctIndex: 2,
    explanation: 'Menjelaskan kata kerja "performed" membutuhkan adverb berakhiran -ly ("amazingly").'
  },
  {
    id: 'v103',
    category: 'Word Form',
    prompt: 'Honesty and _____ are two important values in friendship.',
    options: ['loyal', 'loyalty', 'loyally', 'loyalist'],
    correctIndex: 1,
    explanation: 'Setara dengan kata benda "Honesty" setelah "and" adalah noun "loyalty".'
  },
  {
    id: 'v104',
    category: 'Grammar',
    prompt: 'There _____ not enough chairs in the hall for all the parents.',
    options: ['is', 'are', 'was', 'has'],
    correctIndex: 1,
    explanation: 'Subjek setelahnya jamak ("chairs"), sehingga memakai "are".'
  },
  {
    id: 'v105',
    category: 'Grammar',
    prompt: 'How _____ sugar do you need to make this cup of coffee?',
    options: ['many', 'much', 'few', 'number'],
    correctIndex: 1,
    explanation: '"sugar" adalah uncountable noun, sehingga menggunakan "How much".'
  },
  {
    id: 'v106',
    category: 'Grammar',
    prompt: 'How _____ apples are left in the refrigerator?',
    options: ['much', 'many', 'little', 'amount'],
    correctIndex: 1,
    explanation: '"apples" adalah countable plural noun, sehingga menggunakan "How many".'
  },
  {
    id: 'v107',
    category: 'Grammar',
    prompt: 'Everyone in the classroom _____ excited about the upcoming study tour.',
    options: ['are', 'were', 'is', 'have'],
    correctIndex: 2,
    explanation: 'Indefinite pronoun "Everyone" selalu dianggap tunggal dan berpasangan dengan "is".'
  },
  {
    id: 'v108',
    category: 'Grammar',
    prompt: 'She enjoys _____ watercolor landscapes in her free time.',
    options: ['paint', 'to paint', 'painting', 'painted'],
    correctIndex: 2,
    explanation: 'Kata kerja "enjoy" selalu diikuti gerund (Verb-ing: "painting").'
  },
  {
    id: 'v109',
    category: 'Grammar',
    prompt: 'They decided _____ a charity bazaar at school next Saturday.',
    options: ['organize', 'to organize', 'organizing', 'organized'],
    correctIndex: 1,
    explanation: 'Kata kerja "decide" selalu diikuti to-infinitive ("to organize").'
  },
  {
    id: 'v110',
    category: 'Grammar',
    prompt: 'Let’s practice speaking English together, _____?',
    options: ['will we', 'shall we', 'do we', 'are we'],
    correctIndex: 1,
    explanation: 'Question tag baku untuk ajakan "Let’s..." adalah "shall we?".'
  },
  {
    id: 'v111',
    category: 'Dialogue',
    prompt: 'Edo: "What do you think of our new school library?"\nFajar: "_____. It is bright, spacious, and well-organized."',
    options: ['I agree to disagree', 'In my opinion, it is wonderful', 'I don’t have a book', 'Let’s go home'],
    correctIndex: 1,
    explanation: 'Pertanyaan "What do you think..." dijawab dengan ungkapan pendapat ("In my opinion...").'
  },
  {
    id: 'v112',
    category: 'Vocabulary',
    prompt: 'To save electricity, always _____ your computer monitor when not in use.',
    options: ['switch off', 'switch on', 'plug in', 'turn up'],
    correctIndex: 0,
    explanation: 'Menghemat listrik dilakukan dengan mematikan ("switch off") layar monitor.'
  },
  {
    id: 'v113',
    category: 'Word Form',
    prompt: 'Regular exercise is very _____ for maintaining strong bones and heart health.',
    options: ['benefit', 'beneficial', 'beneficially', 'benefited'],
    correctIndex: 1,
    explanation: 'Setelah adverb "very" dibutuhkan kata sifat (adjective): "beneficial".'
  },
  {
    id: 'v114',
    category: 'Grammar',
    prompt: 'Open the window to let some fresh air in, _____?',
    options: ['will you', 'shall we', 'do you', 'aren’t you'],
    correctIndex: 0,
    explanation: 'Question tag untuk kalimat perintah (imperative) menggunakan "will you?".'
  },
  {
    id: 'v115',
    category: 'Dialogue',
    prompt: 'Teacher: "Pay attention, please!"\nStudents: "_____."',
    options: ['Yes, Ma’am', 'Never mind', 'Good night', 'Congratulations'],
    correctIndex: 0,
    explanation: 'Respon yang tepat saat guru meminta perhatian adalah "Yes, Ma’am" / "Yes, Sir".'
  }
];
