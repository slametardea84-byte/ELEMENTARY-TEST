export type CompanionType = 'owl' | 'robot' | 'fox' | 'crystal';

export type PlayerRole = 'student' | 'teacher';

export type AnimState = 'idle' | 'walk' | 'run' | 'jump';

export type WeatherKind = 'Cerah' | 'Berawan' | 'Hujan' | 'Badai' | 'Terik';

export type DayPhase = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export interface AvatarCustomization {
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hatColor: string;
  companion: CompanionType;
}

export interface PlayerSession {
  sessionId: string;
  uid?: string;
  email?: string;
  isGoogleAuth: boolean;
  name: string;
  school: string;
  className: string;
  role: PlayerRole;
  avatar: AvatarCustomization;
}

export interface QuestionOption {
  key: 'a' | 'b' | 'c' | 'd';
  text: string;
}

export interface ChapterQuestion {
  id: string;
  number: number;
  passageTitle?: string;
  passage?: string;
  prompt: string;
  underlinedWord?: string;
  options: QuestionOption[];
  correctKey: 'a' | 'b' | 'c' | 'd';
  explanation: string;
}

export interface VideoSlide {
  title: string;
  englishExample: string;
  indonesianSummary: string;
  voiceScript: string;
}

export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  buildingName: string;
  accentHex: string;
  position: { x: number; z: number; facing: number };
  summaryPoints: string[];
  videoSlides: VideoSlide[];
  reflectionPrompt: string;
  rewardObjectNames: string[];
  questions: ChapterQuestion[];
}

export interface VersusQuestion {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface PlayerProgress {
  answeredCorrectIds: string[];
  completedChapterIds: string[];
  reflections: Record<string, string>;
  totalScore: number;
  pvpWins: number;
  level: number;
}

export interface OnlinePlayer {
  sessionId: string;
  name: string;
  school: string;
  className: string;
  role: PlayerRole;
  avatar: AvatarCustomization;
  x: number;
  y: number;
  z: number;
  rotY: number;
  animState: AnimState;
  level: number;
  progressPct: number;
  buildingId: string;
  lastSeenMs: number;
}

export interface WeatherState {
  condition: WeatherKind;
  temperatureC: number;
  windKmh: number;
  source: 'open-meteo' | 'manual';
  locationLabel: string;
}

export interface TeacherBroadcast {
  frozen: boolean;
  freezeMessage: string;
  announcement: string;
  announcementId: string;
  announcementTime: number;
}

export interface DuelParticipant {
  sessionId: string;
  name: string;
  score: number;
  answeredCount: number;
  isBot?: boolean;
}

export interface ActiveDuel {
  duelId: string;
  mode: 'pvp' | 'bot';
  status: 'waiting' | 'active' | 'finished';
  questions: VersusQuestion[];
  challenger: DuelParticipant;
  opponent: DuelParticipant;
  startedAtMs: number;
  winnerSessionId?: string | null;
}

export interface DuelChallenge {
  challengeId: string;
  fromSessionId: string;
  fromName: string;
  fromSchool: string;
  toSessionId: string;
  createdAtMs: number;
}
