import type { ChapterDefinition } from '../types/game';

const PASSAGE_1_TO_5 =
  'OK students. Prepare a sheet of paper, pen and correction pen on your desks. Please keep your books, calculators, dictionaries and other things in your bags. Let’s begin the test.';

const PASSAGE_16_TO_18 =
  'He is medium height. I think he had a black wig on because it looked really thick. He held up a gun and pointed at the ceiling and screeched at all of us to lie on the …… (16). I could see that he head to tattoo on the hand, he had the gun in. The teller of bank gave him bag and then he quickly …… (17) the bank. He …… (18) into the back seat of a dark blue car and took off really quickly up main street.';

const PASSAGE_28_TO_29 =
  'Here are some ….. (28) on how to be a succesfull English learner. First, don’t be …… (29) of making mistakes. Second, use every opportunity to practice your English. At last, be an optimistic person.';

const PASSAGE_34_TO_37 =
  'One of the most interesting places to visit m Singapore is the Bird Park. It is located in the industrial area m Singapore, called Jurong. The bird park is about twelve kilometers from the centre of the city, and it’s easy to get there by bus or by taxi.\nIt is one of the largest bird park in the world. The bird are kept in large cages, and there are hundreds of beautiful bird from many different parts of the world. Including penguins, parrots, eagles and ostriches. There is a large lake in to get a closer look at the birds.\nIt takes about two hours to see all the birds. You can walk around the park or ride on a bus. The best tome to visit the park is in the early morning or late afternoon, when it is cooler.';

const PASSAGE_38_TO_40 =
  'Samosir, approximately 50 km long and 15 km wide, is an island Lake Toba and almost as big as Singapore it is often described as the heart of Batak (38) ..... Samosir is a perfect place to relax and cool down. It is beautiful and scenic and very relaxing Accommodation is extremely (39) ..... but the food is rather expensive. The island is small enough to wonder about of you can choose to lie a hammock (40 ) .....';

const PASSAGE_43_TO_44 =
  'G570 4334DDU Laptop with large screen. The laptop also comes with a spatial experience of the screen and it has advanced function features that work effisient. It is more user-frendly than ever.\nG570 433DDU 15.-Inch Laptop Feature\n• 15,6-Inch Screen; Integrated Intel HD 3000 Graphics\n• Windows 7 Home Premium 64-bit, 4 hours Battery Life\n• 2,5 GHz Intel Core i5-2450M\n• 4GBDIMMRAM\n• 500 GB 5400 rpm Hard Drive';

const PASSAGE_45_TO_46 =
  'People are not permitted to ... (45) the rare animals because they will become extinct. Besides, our grandchildren will not be able to ... (46) them in the future.';

const PASSAGE_47_TO_50 =
  'By means of the telephone, you can …..(47) to a friend who maybe living far from you. Your …..(48) travels along a wire called a telegraph wire. There …..(49) also thick bundles of wire, called cables, placed at the bottom of the sea. You can send message through …..(50) to another country.';

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'bab-1',
    number: 1,
    title: 'Bab 1: Reading & Classroom Text',
    subtitle: 'Comprehension, Main Idea & Context Clues',
    buildingName: 'GEDUNG BAB 1 · READING HALL',
    accentHex: '#2563EB',
    position: { x: -24, z: -26, facing: Math.PI / 2 },
    summaryPoints: [
      'Menentukan waktu dan tujuan instruksi kelas (before/during/after test) dari kata kunci seperti "Let\'s begin the test".',
      'Memahami kata pengecualian ("except") dan rujukan kata ganti ("your" merujuk pada siswa/students).',
      'Menemukan gagasan utama paragraf (main idea), jarak/informasi tersurat, dan sinonim kata dalam teks deskriptif (Jurong Bird Park).'
    ],
    videoSlides: [
      {
        title: '1. Memahami Instruksi Kelas & Kata Rujukan',
        englishExample: '"Prepare a sheet of paper, pen and correction pen on your desks. Let\'s begin the test."',
        indonesianSummary: 'Kalimat "Let\'s begin the test" menunjukkan instruksi diucapkan SEBELUM ujian dimulai (before a test), dan "your" merujuk kepada para siswa.',
        voiceScript: 'Bab 1 membahas Reading Comprehension. Perhatikan kalimat ajakan seperti Lets begin the test untuk menentukan waktu kejadian sebelum ujian dimulai.'
      },
      {
        title: '2. Menentukan Main Idea & Sinonim Teks',
        englishExample: '"It is located in the industrial area in Singapore..." -> located = situated.',
        indonesianSummary: 'Untuk mencari gagasan utama paragraf (main idea), baca kalimat awal dan fokus utama yang diulang di seluruh paragraf.',
        voiceScript: 'Untuk menemukan ide pokok paragraf, amati topik utama yang paling banyak dijelaskan. Kata located memiliki arti yang sama dengan situated.'
      }
    ],
    reflectionPrompt: 'Tuliskan 2 kata baru bahasa Inggris yang kamu pelajari dari teks instruksi dan Jurong Bird Park beserta artinya:',
    rewardObjectNames: ['Rak Buku Klasik', 'Globe Edukasi', 'Lampu Baca Belajar', 'Patung Burung Hantu', 'Piala Reading Master'],
    questions: [
      {
        id: 'q1',
        number: 1,
        passageTitle: 'Text for questions 1 to 5',
        passage: PASSAGE_1_TO_5,
        prompt: '1. When would you hear this instructions ?',
        options: [
          { key: 'a', text: 'Before a test' },
          { key: 'b', text: 'During a test' },
          { key: 'c', text: 'After a test' },
          { key: 'd', text: 'Before returning home' },
        ],
        correctKey: 'a',
        explanation: 'Kalimat penutup "Let’s begin the test" (Mari kita mulai tesnya) menunjukkan instruksi diberikan tepat sebelum tes dimulai.'
      },
      {
        id: 'q2',
        number: 2,
        passageTitle: 'Text for questions 1 to 5',
        passage: PASSAGE_1_TO_5,
        prompt: '2. Students should prepare the following things, except ………',
        options: [
          { key: 'a', text: 'Pens' },
          { key: 'b', text: 'paper' },
          { key: 'c', text: 'correction pens' },
          { key: 'd', text: 'calculators' },
        ],
        correctKey: 'd',
        explanation: 'Siswa diminta menyiapkan kertas, pulpen, dan tip-ex (correction pen), sedangkan buku, kalkulator, dan kamus harus disimpan di tas.'
      },
      {
        id: 'q3',
        number: 3,
        passageTitle: 'Text for questions 1 to 5',
        passage: PASSAGE_1_TO_5,
        prompt: '3. Where should students put their dictioanaries ?',
        options: [
          { key: 'a', text: 'On their desks' },
          { key: 'b', text: 'In their bags' },
          { key: 'c', text: 'on their chairs' },
          { key: 'd', text: 'in their drawers' },
        ],
        correctKey: 'b',
        explanation: 'Teks menyebutkan: "Please keep your books, calculators, dictionaries and other things in your bags."'
      },
      {
        id: 'q4',
        number: 4,
        passageTitle: 'Text for questions 1 to 5',
        passage: PASSAGE_1_TO_5,
        prompt: '4. “Let’s begin the test “. What other word is similar to “begin”?',
        options: [
          { key: 'a', text: 'Do' },
          { key: 'b', text: 'start' },
          { key: 'c', text: 'end' },
          { key: 'd', text: 'think' },
        ],
        correctKey: 'b',
        explanation: 'Sinonim dari "begin" (memulai) adalah "start".'
      },
      {
        id: 'q5',
        number: 5,
        passageTitle: 'Text for questions 1 to 5',
        passage: PASSAGE_1_TO_5,
        prompt: '5. “…… and correction pen on your desks”. What does “your” refer to?',
        options: [
          { key: 'a', text: 'The staff’s' },
          { key: 'b', text: 'The teachers' },
          { key: 'c', text: 'The students' },
          { key: 'd', text: 'the employers' },
        ],
        correctKey: 'c',
        explanation: 'Guru membuka pengumuman dengan sapaan "OK students.", sehingga kata ganti "your" merujuk pada para siswa (The students).'
      },
      {
        id: 'q15',
        number: 15,
        prompt: '15. After a two week ceasefire, the battle broke again. “Ceasefire“, means a period of time …………',
        options: [
          { key: 'a', text: 'To stop fighting' },
          { key: 'b', text: 'To begin fighting' },
          { key: 'c', text: 'to start attacking' },
          { key: 'd', text: 'to stop debating' },
        ],
        correctKey: 'a',
        explanation: '"Ceasefire" berarti gencatan senjata, yaitu periode waktu untuk menghentikan pertempuran (to stop fighting).'
      },
      {
        id: 'q34',
        number: 34,
        passageTitle: 'The following text is for questions 34 to 37',
        passage: PASSAGE_34_TO_37,
        prompt: '34. How far is the park from the city centre?',
        options: [
          { key: 'a', text: '2 Km' },
          { key: 'b', text: '10 Km' },
          { key: 'c', text: '12 Km' },
          { key: 'd', text: '100 Km' },
        ],
        correctKey: 'c',
        explanation: 'Paragraf 1 menyatakan: "The bird park is about twelve kilometers from the centre of the city" (12 Km).'
      },
      {
        id: 'q35',
        number: 35,
        passageTitle: 'The following text is for questions 34 to 37',
        passage: PASSAGE_34_TO_37,
        prompt: '35. Why do many people like to visit the bird park late in the afternoon?',
        options: [
          { key: 'a', text: 'They are busy working in the morning' },
          { key: 'b', text: 'There weather is not hot in the afternoon' },
          { key: 'c', text: 'The birds in the park are caged in the morning' },
          { key: 'd', text: 'They live in many different parts of the world' },
        ],
        correctKey: 'b',
        explanation: 'Paragraf 3 menyatakan waktu terbaik adalah pagi hari atau sore hari "when it is cooler" (saat cuaca lebih sejuk / tidak panas).'
      },
      {
        id: 'q36',
        number: 36,
        passageTitle: 'The following text is for questions 34 to 37',
        passage: PASSAGE_34_TO_37,
        prompt: '36. What is the main idea of the second paragraph?',
        options: [
          { key: 'a', text: 'The most interesting place in Singapore is the bird park' },
          { key: 'b', text: 'There is a restaurant next to a large lake m the park' },
          { key: 'c', text: 'There are hundreds of very beautiful birds in the cages' },
          { key: 'd', text: 'Sinagpore bird park is the largest bird park in the world' },
        ],
        correctKey: 'c',
        explanation: 'Paragraf kedua berfokus menjelaskan ratusan burung indah dari berbagai belahan dunia yang dipelihara dalam kandang besar.'
      },
      {
        id: 'q37',
        number: 37,
        passageTitle: 'The following text is for questions 34 to 37',
        passage: PASSAGE_34_TO_37,
        prompt: '37. “It is located in the industrial area in Singapore.” (paragraph 1) What does the underlined word mean?',
        underlinedWord: 'located',
        options: [
          { key: 'a', text: 'Situated' },
          { key: 'b', text: 'Held' },
          { key: 'c', text: 'Conducted' },
          { key: 'd', text: 'Performed' },
        ],
        correctKey: 'a',
        explanation: 'Kata "located" (terletak/berlokasi) bersinonim dengan "situated".'
      }
    ]
  },
  {
    id: 'bab-2',
    number: 2,
    title: 'Bab 2: Grammar, Passive & Tenses',
    subtitle: 'Passive Voice, Question Tags & Verb Tenses',
    buildingName: 'GEDUNG BAB 2 · GRAMMAR TOWER',
    accentHex: '#059669',
    position: { x: 24, z: -26, facing: -Math.PI / 2 },
    summaryPoints: [
      'Passive Voice (Past): Subject + was/were + Verb 3 (past participle), contoh: "The book was written by Dee".',
      'Simple Past Tense: Kalimat positif menggunakan Verb 2 ("taught", "spent"), kalimat negatif menggunakan "didn\'t + Verb 1" ("He didn\'t give me...").',
      'Question Tag: "There is a vacant room, isn\'t there?" mengikuti auxiliary "is" dan subjek "there".',
      'Present Continuous ("is celebrating") dan kebiasaan lampau ("used to + Verb 1").'
    ],
    videoSlides: [
      {
        title: '1. Passive Voice & Simple Past Negative',
        englishExample: '"The book was written by Dee." | "He didn\'t give me a pencil."',
        indonesianSummary: 'Pada kalimat pasif lampau gunakan was/were + V3. Pada kalimat negatif lampau, kata kerja kembali ke bentuk dasar V1 setelah "didn\'t".',
        voiceScript: 'Bab 2 membahas tata bahasa penting: Passive Voice menggunakan was atau were ditambah Verb 3, sedangkan kalimat negatif Simple Past memakai didnt diikuti Verb 1.'
      },
      {
        title: '2. Question Tag & Used To',
        englishExample: '"There is a vacant room, isn\'t there?" | "We used to go camping."',
        indonesianSummary: 'Question tag untuk "There is..." adalah "isn\'t there?". Untuk kebiasaan masa lalu gunakan "used to + Verb 1".',
        voiceScript: 'Perhatikan pola Question Tag pada There is yang menjadi isnt there, serta penggunaan used to untuk kebiasaan di masa lalu.'
      }
    ],
    reflectionPrompt: 'Buatlah 1 kalimat Passive Voice bahasa Inggris sederhana menggunakan namamu atau benda di kelas:',
    rewardObjectNames: ['Papan Rumus Tense', 'Monumen Verb-3', 'Lampu Meja Akademik', 'Teleskop Grammar', 'Mahkota Syntax'],
    questions: [
      {
        id: 'q6',
        number: 6,
        prompt: '6. The book was .... by Dee',
        options: [
          { key: 'a', text: 'Writes' },
          { key: 'b', text: 'wrote' },
          { key: 'c', text: 'written' },
          { key: 'd', text: 'writing' },
        ],
        correctKey: 'c',
        explanation: 'Kalimat pasif (Passive Voice) menggunakan pola to be + V3. Bentuk V3 dari "write" adalah "written".'
      },
      {
        id: 'q7',
        number: 7,
        prompt: '7. Which one is correct!',
        options: [
          { key: 'a', text: 'My brother is older than me' },
          { key: 'b', text: 'Me is older than my brother' },
          { key: 'c', text: 'me brother is older than my' },
          { key: 'd', text: 'My is older than me brother' },
        ],
        correctKey: 'a',
        explanation: 'Possessive adjective yang benar sebelum kata benda adalah "My brother", dan setelah "than" digunakan object pronoun "me".'
      },
      {
        id: 'q13',
        number: 13,
        prompt: '13. The coffee …… by Hadi on the carpet',
        options: [
          { key: 'a', text: 'Was spilled' },
          { key: 'b', text: 'Was spilt' },
          { key: 'c', text: 'Was spill' },
          { key: 'd', text: 'Were spilted' },
        ],
        correctKey: 'a',
        explanation: 'Subjek "The coffee" (uncountable/tunggal) berpasangan dengan "was" + V3 "spilled" (atau "spilt", dengan bentuk standar kurikulum "Was spilled").'
      },
      {
        id: 'q14',
        number: 14,
        prompt: '14. Guest : There is a vacant room, ……..?\nReceptionist : Single room only, sir\nGuest : That’s okay. I’ll take it.',
        options: [
          { key: 'a', text: 'Aren’t they' },
          { key: 'b', text: 'Are they' },
          { key: 'c', text: 'Isn’t there' },
          { key: 'd', text: 'Is it' },
        ],
        correctKey: 'c',
        explanation: 'Pernyataan positif "There is..." memiliki question tag negatif "isn’t there?".'
      },
      {
        id: 'q19',
        number: 19,
        prompt: '19. He gave me a pencil\nWhich is the correct negative form of the sentence above?',
        options: [
          { key: 'a', text: 'He doesn’t gave me a pencil' },
          { key: 'b', text: 'He doesn’t give me a pencil' },
          { key: 'c', text: 'He didn’t gave me a pencil' },
          { key: 'd', text: 'He didn’t give me a pencil' },
        ],
        correctKey: 'd',
        explanation: 'Kalimat asal memakai V2 ("gave" = Simple Past), sehingga bentuk negatifnya adalah "didn’t" + V1 ("give").'
      },
      {
        id: 'q20',
        number: 20,
        prompt: '20. The amount of time she .... on her homework had paid off.',
        options: [
          { key: 'a', text: 'Spent' },
          { key: 'b', text: 'Spends' },
          { key: 'c', text: 'spend' },
          { key: 'd', text: 'spended' },
        ],
        correctKey: 'a',
        explanation: 'Kejadian lampau selaras dengan "had paid off" memerlukan V2 dari "spend", yaitu "spent".'
      },
      {
        id: 'q21',
        number: 21,
        prompt: '21. I .... to go camping on Saturday morning',
        options: [
          { key: 'a', text: 'Plan' },
          { key: 'b', text: 'Planning' },
          { key: 'c', text: 'plans' },
          { key: 'd', text: 'Will' },
        ],
        correctKey: 'a',
        explanation: 'Subjek "I" dalam Simple Present untuk rencana diikuti kata kerja dasar "plan" (dengan "to go").'
      },
      {
        id: 'q22',
        number: 22,
        prompt: '22. Mr. Aly is a teacher. He .... Math last semester',
        options: [
          { key: 'a', text: 'Teach' },
          { key: 'b', text: 'Touch' },
          { key: 'c', text: 'taught' },
          { key: 'd', text: 'tough' },
        ],
        correctKey: 'c',
        explanation: 'Keterangan waktu "last semester" membutuhkan V2 dari "teach", yaitu "taught".'
      },
      {
        id: 'q24',
        number: 24,
        prompt: '24. My family had some lovely holidays. ………….... go camping all over Europe.',
        options: [
          { key: 'a', text: 'They used to' },
          { key: 'b', text: 'We used to' },
          { key: 'c', text: 'They use to' },
          { key: 'd', text: 'We use to' },
        ],
        correctKey: 'b',
        explanation: '"My family" mencakup pembicara ("We") dan kebiasaan masa lalu dinyatakan dengan "used to" ("We used to go camping...").'
      },
      {
        id: 'q30',
        number: 30,
        prompt: '30. Milo is ……..his birthday.',
        options: [
          { key: 'a', text: 'Celebrating' },
          { key: 'b', text: 'Celebrate' },
          { key: 'c', text: 'celebrated' },
          { key: 'd', text: 'celebration' },
        ],
        correctKey: 'a',
        explanation: 'Setelah to be "is" untuk aktivitas yang sedang berlangsung (Present Continuous) digunakan V-ing "celebrating".'
      }
    ]
  },
  {
    id: 'bab-3',
    number: 3,
    title: 'Bab 3: Quantifiers, Synonyms & Expressions',
    subtitle: 'Partitives, Conjunctions & Word Choice',
    buildingName: 'GEDUNG BAB 3 · VOCAB LAB',
    accentHex: '#D97706',
    position: { x: -24, z: 2, facing: Math.PI / 2 },
    summaryPoints: [
      'Partitive & Uncountable Noun: "a piece of paper", "a bottle of ink", dan "plenty of wood" bermakna "an amount of wood".',
      'Article "an" sebelum bunyi vokal ("an intelligent boy") dan konjungsi akibat "or" ("avoid unhygienic food or you\'ll get diarrhoea").',
      'Membedakan sinonim dan kata yang BUKAN sinonim (smart ≠ hurt, exit ≠ walk, wrong ≠ interesting).'
    ],
    videoSlides: [
      {
        title: '1. Kata Benda Tak Terhitung & Partitive',
        englishExample: '"a piece of paper and a bottle of ink" | "plenty of wood = an amount of wood"',
        indonesianSummary: 'Benda tak terhitung (paper, ink, wood) menggunakan satuan takar seperti "a piece of", "a bottle of", atau "an amount of" (bukan many/a few).',
        voiceScript: 'Bab 3 membahas kata benda tak terhitung. Gunakan a piece of untuk kertas, a bottle of untuk tinta, dan an amount of untuk jumlah kayu.'
      },
      {
        title: '2. Menemukan Kata yang Bukan Sinonim & Ungkapan Simpati',
        englishExample: '"I get a toothache" -> "Get well soon!"',
        indonesianSummary: 'Baca instruksi soal dengan teliti: "Choose the word that is NOT a synonym". Untuk teman yang sakit, ucapkan "Get well soon".',
        voiceScript: 'Hati-hati pada soal yang meminta kata yang bukan sinonim, dan gunakan ungkapan Get well soon saat teman sedang sakit.'
      }
    ],
    reflectionPrompt: 'Tuliskan 3 pasangan sinonim bahasa Inggris yang kamu temukan pada soal Bab 3 ini:',
    rewardObjectNames: ['Meja Eksperimen Kata', 'Kristal Partitive', 'Lampu Sorot Kamus', 'Piala Sinonim', 'Obor Vocab Master'],
    questions: [
      {
        id: 'q8',
        number: 8,
        prompt: '8. Play station is a …….... game.',
        options: [
          { key: 'a', text: 'Traditional' },
          { key: 'b', text: 'trendy' },
          { key: 'c', text: 'modern' },
          { key: 'd', text: 'up to date' },
        ],
        correctKey: 'c',
        explanation: 'PlayStation merupakan jenis permainan elektronik modern (berlawanan dengan traditional game).'
      },
      {
        id: 'q9',
        number: 9,
        prompt: '9. Ferdy is an ……... boy. He can solve maths questions very quickly.',
        options: [
          { key: 'a', text: 'Clever' },
          { key: 'b', text: 'smart' },
          { key: 'c', text: 'intelligent' },
          { key: 'd', text: 'hardworking' },
        ],
        correctKey: 'c',
        explanation: 'Kata sandang "an" hanya dapat diikuti kata berbunyi awal huruf vokal, yaitu "intelligent" ("an intelligent boy").'
      },
      {
        id: 'q10',
        number: 10,
        prompt: '10. She gave me ……. paper and …… ink',
        options: [
          { key: 'a', text: 'Page of – a bowl of' },
          { key: 'b', text: 'A piece of – a bottle of' },
          { key: 'c', text: 'Piece – a bottle of' },
          { key: 'd', text: 'Piece of – a drop of' },
        ],
        correctKey: 'b',
        explanation: 'Ungkapan takaran yang tepat adalah "a piece of paper" (selembar kertas) dan "a bottle of ink" (sebotol tinta).'
      },
      {
        id: 'q11',
        number: 11,
        prompt: '11. There is still plenty of wood at the back of the house. This sentence means that we still have ….. wood',
        options: [
          { key: 'a', text: 'An amount of' },
          { key: 'b', text: 'A few' },
          { key: 'c', text: 'Many' },
          { key: 'd', text: 'A number of' },
        ],
        correctKey: 'a',
        explanation: '"Wood" adalah uncountable noun, sehingga "plenty of wood" setara dengan "an amount of wood" (bukan a few/many/a number of).'
      },
      {
        id: 'q12',
        number: 12,
        prompt: '12. You must avoid unhygienic food ………... you\'ll get diarrhoea.',
        options: [
          { key: 'a', text: 'Or' },
          { key: 'b', text: 'so' },
          { key: 'c', text: 'but' },
          { key: 'd', text: 'unless' },
        ],
        correctKey: 'a',
        explanation: 'Kata penghubung "or" berarti "atau (kalau tidak...)" untuk menyatakan konsekuensi peringatan.'
      },
      {
        id: 'q25',
        number: 25,
        prompt: '25. Choose the word that is NOT a synonym of the underlined word: Kyle is smart enough to solve a very difficult problem.',
        underlinedWord: 'smart',
        options: [
          { key: 'a', text: 'Hurt' },
          { key: 'b', text: 'clever' },
          { key: 'c', text: 'bright' },
          { key: 'd', text: 'intelligent' },
        ],
        correctKey: 'a',
        explanation: 'Clever, bright, dan intelligent adalah sinonim "smart" (pintar); sedangkan "hurt" (terluka) bukan sinonimnya.'
      },
      {
        id: 'q26',
        number: 26,
        prompt: '26. Choose the word that is NOT a synonym of the underlined word: The bus is ready. we’ll exit through that door.',
        underlinedWord: 'exit',
        options: [
          { key: 'a', text: 'Leave' },
          { key: 'b', text: 'walk' },
          { key: 'c', text: 'go' },
          { key: 'd', text: 'depart' },
        ],
        correctKey: 'b',
        explanation: 'Leave, go, dan depart berkaitan dengan keluar/meninggalkan tempat (exit), sedangkan "walk" berarti berjalan kaki.'
      },
      {
        id: 'q27',
        number: 27,
        prompt: '27. Choose the word that is NOT a synonym of the underlined word: The “facts“ in your statement are wrong!',
        underlinedWord: 'wrong',
        options: [
          { key: 'a', text: 'Interesting' },
          { key: 'b', text: 'false' },
          { key: 'c', text: 'untrue' },
          { key: 'd', text: 'incorrect' },
        ],
        correctKey: 'a',
        explanation: 'False, untrue, dan incorrect berarti salah (wrong); "interesting" (menarik) bukan sinonimnya.'
      },
      {
        id: 'q31',
        number: 31,
        prompt: '31. I …….happy because I got a big trophy.',
        options: [
          { key: 'a', text: 'Am' },
          { key: 'b', text: 'was' },
          { key: 'c', text: 'is' },
          { key: 'd', text: 'were' },
        ],
        correctKey: 'b',
        explanation: 'Karena klausa kedua berbentuk lampau ("got a big trophy"), to be untuk subjek "I" menggunakan "was".'
      },
      {
        id: 'q33',
        number: 33,
        prompt: '33. Tiara : I get a toothache\nRina : ………………',
        options: [
          { key: 'a', text: 'Get well soon' },
          { key: 'b', text: 'Good bye' },
          { key: 'c', text: 'congratulation' },
          { key: 'd', text: 'thank you' },
        ],
        correctKey: 'a',
        explanation: 'Saat mendengar seseorang sakit gigi (toothache), ungkapan simpati yang tepat adalah "Get well soon" (Semoga lekas sembuh).'
      }
    ]
  },
  {
    id: 'bab-4',
    number: 4,
    title: 'Bab 4: Cloze Passage Studio',
    subtitle: 'Contextual Vocabulary & Narrative Cloze',
    buildingName: 'GEDUNG BAB 4 · CLOZE STUDIO',
    accentHex: '#7C3AED',
    position: { x: 24, z: 2, facing: -Math.PI / 2 },
    summaryPoints: [
      'Cloze Test menuntut pemahaman alur cerita (Narrative/Recount) dan jenis kata (Noun, Verb, Adjective, Adverb).',
      'Perhatikan kata penghubung kontras seperti "but": "Accommodation is extremely cheap but the food is rather expensive".',
      'Perhatikan kolokasi alami: "lie on the floor", "left the bank", "jumped into the back seat", "afraid of making mistakes".'
    ],
    videoSlides: [
      {
        title: '1. Strategi Mengisi Teks Rumpang (Cloze Test)',
        englishExample: '"Accommodation is extremely cheap, but the food is rather expensive."',
        indonesianSummary: 'Lihat petunjuk sebelum dan sesudah bagian kosong! Kata "but" menandakan makna berlawanan dengan "expensive", yaitu "cheap".',
        voiceScript: 'Bab 4 melatih kemampuan Cloze Passage. Selalu perhatikan kata penghubung seperti but serta kata benda atau kata kerja di sekitar titik-titik.'
      },
      {
        title: '2. Melengkapi Paragraf Nasihat & Pelestarian Alam',
        englishExample: '"don\'t be afraid of making mistakes" | "not permitted to kill the rare animals"',
        indonesianSummary: 'Pastikan bentuk kata (verb, adjective, atau adverb seperti "comfortably") sesuai dengan struktur kalimatnya.',
        voiceScript: 'Pastikan kelas kata yang dipilih sesuai, misalnya kata keterangan comfortably untuk menjelaskan cara berbaring di hammock.'
      }
    ],
    reflectionPrompt: 'Menurutmu, petunjuk apa yang paling membantu saat mengisi bagian kosong pada teks Samosir atau Rare Animals?',
    rewardObjectNames: ['Meja Editor Teks', 'Papan Klip Cerita', 'Lampu Studio Ungu', 'Patung Penjelajah', 'Trofi Cloze Expert'],
    questions: [
      {
        id: 'q16',
        number: 16,
        passageTitle: 'For questions number 16 to 18',
        passage: PASSAGE_16_TO_18,
        prompt: '16. Complete blank (16) in the passage above:',
        options: [
          { key: 'a', text: 'fench' },
          { key: 'b', text: 'floor' },
          { key: 'c', text: 'grass' },
          { key: 'd', text: 'door' },
        ],
        correctKey: 'b',
        explanation: 'Kejadian berlangsung di dalam bank ("The teller of bank..."), sehingga orang-orang diperintahkan tiarap di lantai ("lie on the floor").'
      },
      {
        id: 'q17',
        number: 17,
        passageTitle: 'For questions number 16 to 18',
        passage: PASSAGE_16_TO_18,
        prompt: '17. Complete blank (17) in the passage above:',
        options: [
          { key: 'a', text: 'left' },
          { key: 'b', text: 'moved' },
          { key: 'c', text: 'broke' },
          { key: 'd', text: 'shot' },
        ],
        correctKey: 'a',
        explanation: 'Setelah menerima tas uang dari teller, perampok itu segera meninggalkan bank ("quickly left the bank").'
      },
      {
        id: 'q18',
        number: 18,
        passageTitle: 'For questions number 16 to 18',
        passage: PASSAGE_16_TO_18,
        prompt: '18. Complete blank (18) in the passage above:',
        options: [
          { key: 'a', text: 'shut' },
          { key: 'b', text: 'jumped' },
          { key: 'c', text: 'came' },
          { key: 'd', text: 'song' },
        ],
        correctKey: 'b',
        explanation: 'Karena tergesa-gesa kabur, ia melompat masuk ke kursi belakang mobil ("jumped into the back seat").'
      },
      {
        id: 'q28',
        number: 28,
        passageTitle: 'Text for questions no. 28 – 29',
        passage: PASSAGE_28_TO_29,
        prompt: '28. Complete blank (28) in the text above:',
        options: [
          { key: 'a', text: 'tips' },
          { key: 'b', text: 'clues' },
          { key: 'c', text: 'plans' },
          { key: 'd', text: 'rules' },
        ],
        correctKey: 'a',
        explanation: 'Teks berisi kiat-kiat sukses belajar bahasa Inggris, sehingga kata yang paling tepat adalah "tips".'
      },
      {
        id: 'q29',
        number: 29,
        passageTitle: 'Text for questions no. 28 – 29',
        passage: PASSAGE_28_TO_29,
        prompt: '29. Complete blank (29) in the text above:',
        options: [
          { key: 'a', text: 'afraid' },
          { key: 'b', text: 'proud' },
          { key: 'c', text: 'brave' },
          { key: 'd', text: 'shy' },
        ],
        correctKey: 'a',
        explanation: 'Nasihat belajar bahasa adalah jangan takut berbuat salah ("don’t be afraid of making mistakes").'
      },
      {
        id: 'q38',
        number: 38,
        passageTitle: 'For questions 38 - 40, choose the most suitable words to fill in the blanks',
        passage: PASSAGE_38_TO_40,
        prompt: '38. Complete blank (38) in the passage above:',
        options: [
          { key: 'a', text: 'Village' },
          { key: 'b', text: 'Culture' },
          { key: 'c', text: 'Hometown' },
          { key: 'd', text: 'Costumes' },
        ],
        correctKey: 'b',
        explanation: 'Pulau Samosir di Danau Toba sering disebut sebagai pusat/jantung budaya Batak ("the heart of Batak culture").'
      },
      {
        id: 'q39',
        number: 39,
        passageTitle: 'For questions 38 - 40, choose the most suitable words to fill in the blanks',
        passage: PASSAGE_38_TO_40,
        prompt: '39. Complete blank (39) in the passage above:',
        options: [
          { key: 'a', text: 'Dear' },
          { key: 'b', text: 'Easy' },
          { key: 'c', text: 'Cheap' },
          { key: 'd', text: 'Difficult' },
        ],
        correctKey: 'c',
        explanation: 'Kata hubung "but" mengontraskan kalimat dengan "rather expensive" (agak mahal), sehingga penginapannya "extremely cheap" (sangat murah).'
      },
      {
        id: 'q40',
        number: 40,
        passageTitle: 'For questions 38 - 40, choose the most suitable words to fill in the blanks',
        passage: PASSAGE_38_TO_40,
        prompt: '40. Complete blank (40) in the passage above:',
        options: [
          { key: 'a', text: 'Completely' },
          { key: 'b', text: 'Simply' },
          { key: 'c', text: 'Easily' },
          { key: 'd', text: 'Comfortably' },
        ],
        correctKey: 'd',
        explanation: 'Berbaring santai di tempat tidur gantung (hammock) dijelaskan dengan adverb "comfortably" (dengan nyaman).'
      },
      {
        id: 'q45',
        number: 45,
        passageTitle: 'Choose the right words in number 45 - 46 to complete the short paragraph!',
        passage: PASSAGE_45_TO_46,
        prompt: '45. Complete blank (45) in the short paragraph above:',
        options: [
          { key: 'a', text: 'Keep' },
          { key: 'b', text: 'kill' },
          { key: 'c', text: 'save' },
          { key: 'd', text: 'preserve' },
        ],
        correctKey: 'b',
        explanation: 'Orang-orang dilarang membunuh ("not permitted to kill") hewan langka agar tidak punah (become extinct).'
      },
      {
        id: 'q46',
        number: 46,
        passageTitle: 'Choose the right words in number 45 - 46 to complete the short paragraph!',
        passage: PASSAGE_45_TO_46,
        prompt: '46. Complete blank (46) in the short paragraph above:',
        options: [
          { key: 'a', text: 'Hunt' },
          { key: 'b', text: 'kill' },
          { key: 'c', text: 'see' },
          { key: 'd', text: 'sell' },
        ],
        correctKey: 'c',
        explanation: 'Jika hewan langka punah, anak cucu kita tidak akan bisa melihat ("will not be able to see") mereka lagi di masa depan.'
      }
    ]
  },
  {
    id: 'bab-5',
    number: 5,
    title: 'Bab 5: Arrangement, Functional & Tech Text',
    subtitle: 'Jumbled Sentences, Specifications & Technology Cloze',
    buildingName: 'GEDUNG BAB 5 · ARRANGE & TECH LAB',
    accentHex: '#0891B2',
    position: { x: -24, z: 30, facing: Math.PI / 2 },
    summaryPoints: [
      'Menyusun kalimat acak (Jumbled Sentences) secara kronologis: cari kalimat pembuka (intro), kejadian berurutan, lalu penutup/akibat.',
      'Membaca teks fungsional spesifikasi produk (Laptop G570) untuk menemukan data baterai dan fitur.',
      'Melengkapi teks teknologi (Telephone & Cables) dengan modal + V1 ("can talk"), singular/plural ("There are bundles"), dan object pronoun ("through them").'
    ],
    videoSlides: [
      {
        title: '1. Trik Cepat Menyusun Paragraf Acak (Jumbled Sentences)',
        englishExample: '"This is a house" -> "The house is new" | "Last Lebaran..." -> "We left our house..."',
        indonesianSummary: 'Selalu cari kalimat pengantar umum terlebih dahulu ("This is a house", "One day, my father bought...", "Last Lebaran..."), lalu ikuti urutan waktu.',
        voiceScript: 'Bab 5 membahas penyusunan kalimat acak dan teks teknologi. Temukan kalimat pengenalan umum di awal, lalu urutkan berdasarkan kronologi waktu.'
      },
      {
        title: '2. Membaca Spesifikasi Produk & Pronoun',
        englishExample: '"4 hours Battery Life" | "There are also thick bundles... send message through them"',
        indonesianSummary: 'Setelah kata depan "through", gunakan object pronoun jamak "them" yang merujuk pada "cables".',
        voiceScript: 'Pada teks spesifikasi laptop perhatikan angka baterai 4 jam, dan pada teks telepon gunakan object pronoun them setelah kata through.'
      }
    ],
    reflectionPrompt: 'Urutan langkah apa yang paling membantumu saat menyusun paragraf acak di Bab 5 ini?',
    rewardObjectNames: ['Papan Alur Paragraf', 'Miniatur Kereta & Kota', 'Laptop Hologram 3D', 'Kabel Telegraf Emas', 'Bintang Grandmaster'],
    questions: [
      {
        id: 'q23',
        number: 23,
        prompt: '23. Arrange these sentences to make a good paragraph\n1. The house is now ready to stay\n2. The house is new\n3. Although it is just finished yesterday\n4. We still complete it to made it comfortable\n5. So we plan to stay in it tomorrow\n6. This is a house',
        options: [
          { key: 'a', text: '6 – 2 – 3 – 4 – 1 – 5' },
          { key: 'b', text: '6 – 2 – 4 – 3 – 1 – 5' },
          { key: 'c', text: '2 – 6 – 4 – 3 – 1 – 5' },
          { key: 'd', text: '2 – 6 – 4 – 1 – 3 – 5' },
        ],
        correctKey: 'b',
        explanation: 'Urutan logis: (6) Ini rumah -> (2) Rumahnya baru -> (4) Kami masih melengkapinya agar nyaman -> (3) meskipun baru selesai kemarin -> (1) Sekarang siap ditempati -> (5) Jadi kami berencana tinggal besok.'
      },
      {
        id: 'q32',
        number: 32,
        prompt: '32. The capital city of Bali is …….',
        options: [
          { key: 'a', text: 'Kuta' },
          { key: 'b', text: 'Denpasar' },
          { key: 'c', text: 'Gianyar' },
          { key: 'd', text: 'Badung' },
        ],
        correctKey: 'b',
        explanation: 'Ibu kota Provinsi Bali adalah Denpasar.'
      },
      {
        id: 'q41',
        number: 41,
        prompt: '41. Arrange the sentences bellow into a correct paragraph\n1. We left our house at about 5 o’clock in the morning. We took a taxi to the railway station\n2. Finally our train came. All of us rushed to get 6n the train\n3. Last Lebaran, may family and I went hometown. We decided to take a train because it is more comfortable\n4. It took about 5 to 7 hours to get to our hometown. We enjoyed our journey\n5. We took the carriage no 3 according to our tickets\n6. But without any prior information, our train was late for about fifteen minutes, so we had to wait a bit longer\n7. After finding our seats we could sit comfortably\n8. We arrived at the at the station at six. Our train would leave at 6.40',
        options: [
          { key: 'a', text: '3 – 8 – 6 – 4 – 5 – 1 – 2 – 7' },
          { key: 'b', text: '3 – 4 – 5 – 8 – 1 – 2 – 6 – 7' },
          { key: 'c', text: '3 – 1 – 8 – 6 – 2 – 5 – 7 – 4' },
          { key: 'd', text: '3 – 5 – 4 – 2 – 7 – 8 – 1 – 6' },
        ],
        correctKey: 'c',
        explanation: 'Urutan kronologis perjalanan kereta: (3) Rencana Lebaran -> (1) Berangkat jam 5 -> (8) Tiba di stasiun jam 6 -> (6) Kereta telat 15 menit -> (2) Akhirnya kereta datang -> (5) Masuk gerbong 3 -> (7) Menemukan kursi -> (4) Perjalanan 5-7 jam.'
      },
      {
        id: 'q42',
        number: 42,
        prompt: '42. Arrange the following sentences into a good paragraph\n1) I was very happy when I realized I could ride motorcycle\n2) Nonetheless. I got nervous when I passed the narrow street\n3) I lost my control and fell to the ditch\n4) One day, my father bought an old motorcycle\n5) My father taught me how to ride the motorcycle\n6) My father was very patient and gave me directions\n7) In the beginning everything ran well',
        options: [
          { key: 'a', text: '7 – 3 – 1 – 5 – 2 – 6 – 4' },
          { key: 'b', text: '5 – 4 – 3 – 7 – 6 – 1 – 2' },
          { key: 'c', text: '1 – 2 – 3 – 5 – 4 – 7 – 6' },
          { key: 'd', text: '4 – 5 – 6 – 7 – 1 – 2 – 3' },
        ],
        correctKey: 'd',
        explanation: 'Urutan kronologis: (4) Ayah membeli motor -> (5) Ayah mengajari -> (6) Ayah sabar memberi arahan -> (7) Awalnya berjalan lancar -> (1) Senang bisa mengendarai -> (2) Gugup di jalan sempit -> (3) Hilang kendali dan jatuh.'
      },
      {
        id: 'q43',
        number: 43,
        passageTitle: 'The following text is for questions 43 and 44',
        passage: PASSAGE_43_TO_44,
        prompt: '43. Normally, this laptop can be used for .... hours',
        options: [
          { key: 'a', text: 'Two and half' },
          { key: 'b', text: 'Four' },
          { key: 'c', text: 'Seven' },
          { key: 'd', text: 'Sixty four' },
        ],
        correctKey: 'b',
        explanation: 'Pada daftar fitur tertulis "4 hours Battery Life", berarti dapat digunakan selama 4 jam (Four).'
      },
      {
        id: 'q44',
        number: 44,
        passageTitle: 'The following text is for questions 43 and 44',
        passage: PASSAGE_43_TO_44,
        prompt: '44. From the text we know that ....',
        options: [
          { key: 'a', text: 'The laptop is as user friendly as the previous edition' },
          { key: 'b', text: 'The laptop has advance function features' },
          { key: 'c', text: 'The battery can be used for 6 hours' },
          { key: 'd', text: 'The screen of the laptop is small' },
        ],
        correctKey: 'b',
        explanation: 'Teks menyatakan "it has advanced function features that work effisient" (memiliki fitur fungsi lanjutan).'
      },
      {
        id: 'q47',
        number: 47,
        passageTitle: 'Choose the right words in number 47 to 50 to complete the short paragraph!',
        passage: PASSAGE_47_TO_50,
        prompt: '47. Complete blank (47) in the short paragraph above:',
        options: [
          { key: 'a', text: 'talk' },
          { key: 'b', text: 'talks' },
          { key: 'c', text: 'talked' },
          { key: 'd', text: 'talking' },
        ],
        correctKey: 'a',
        explanation: 'Setelah modal auxiliary "can" wajib diikuti kata kerja bentuk dasar (V1), yaitu "talk".'
      },
      {
        id: 'q48',
        number: 48,
        passageTitle: 'Choose the right words in number 47 to 50 to complete the short paragraph!',
        passage: PASSAGE_47_TO_50,
        prompt: '48. Complete blank (48) in the short paragraph above:',
        options: [
          { key: 'a', text: 'telephone' },
          { key: 'b', text: 'friends' },
          { key: 'c', text: 'messages' },
          { key: 'd', text: 'means' },
        ],
        correctKey: 'c',
        explanation: 'Yang dikirim dan berjalan melalui kabel telegraf adalah pesan ("Your messages").'
      },
      {
        id: 'q49',
        number: 49,
        passageTitle: 'Choose the right words in number 47 to 50 to complete the short paragraph!',
        passage: PASSAGE_47_TO_50,
        prompt: '49. Complete blank (49) in the short paragraph above:',
        options: [
          { key: 'a', text: 'is' },
          { key: 'b', text: 'are' },
          { key: 'c', text: 'was' },
          { key: 'd', text: 'were' },
        ],
        correctKey: 'b',
        explanation: 'Teks menggunakan Present Tense dan kata benda setelahnya berbentuk jamak ("thick bundles of wire"), sehingga menggunakan "are".'
      },
      {
        id: 'q50',
        number: 50,
        passageTitle: 'Choose the right words in number 47 to 50 to complete the short paragraph!',
        passage: PASSAGE_47_TO_50,
        prompt: '50. Complete blank (50) in the short paragraph above:',
        options: [
          { key: 'a', text: 'they' },
          { key: 'b', text: 'them' },
          { key: 'c', text: 'their' },
          { key: 'd', text: 'theirs' },
        ],
        correctKey: 'b',
        explanation: 'Setelah preposisi "through" digunakan object pronoun jamak "them" yang merujuk pada "cables".'
      }
    ]
  }
];

export const TOTAL_CHAPTER_QUESTIONS = CHAPTERS.reduce((acc, ch) => acc + ch.questions.length, 0);

export const ARENA_VERSUS_POSITION = { x: 0, z: -56, facing: 0 };
