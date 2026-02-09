
import { EmotionType, SkillNode, PassiveBonus, Achievement, CoreModule, ProposedMutation } from './types';

export const KERNEL_VERSION = "40.0.1 'Genesis Core'";

export const AI_CONFIG = {
    OLLAMA_DEFAULT_MODEL: 'llama3.1:8',
    GEMINI_DEFAULT_MODEL: 'gemini-3-flash-preview',
};

export const EMOTIONS: Record<EmotionType, { color: string; colorClass: string; name: Record<string, string> }> = {
  [EmotionType.NEUTRAL]: { color: '#64748b', colorClass: 'text-slate-400', name: { RU: 'Нейтральность', EN: 'Neutral' } },
  [EmotionType.CALM]: { color: '#38bdf8', colorClass: 'text-sky-400', name: { RU: 'Спокойствие', EN: 'Calm' } },
  [EmotionType.CHAOS]: { color: '#f43f5e', colorClass: 'text-rose-500', name: { RU: 'Хаос', EN: 'Chaos' } },
  [EmotionType.FOCUS]: { color: '#22d3ee', colorClass: 'text-cyan-400', name: { RU: 'Фокус', EN: 'Focus' } },
  [EmotionType.FLOW]: { color: '#c084fc', colorClass: 'text-purple-400', name: { RU: 'Поток', EN: 'Flow' } },
  [EmotionType.THOUGHTFUL]: { color: '#a78bfa', colorClass: 'text-violet-400', name: { RU: 'Размышление', EN: 'Thoughtful' } },
  [EmotionType.CURIOUS]: { color: '#facc15', colorClass: 'text-yellow-400', name: { RU: 'Любопытство', EN: 'Curious' } },
  [EmotionType.HAPPY]: { color: '#fbbf24', colorClass: 'text-amber-400', name: { RU: 'Радость', EN: 'Happy' } },
  [EmotionType.EXCITED]: { color: '#f97316', colorClass: 'text-orange-500', name: { RU: 'Воодушевление', EN: 'Excited' } },
  [EmotionType.INSPIRED]: { color: '#d946ef', colorClass: 'text-fuchsia-500', name: { RU: 'Вдохновение', EN: 'Inspired' } },
  [EmotionType.MELANCHOLIC]: { color: '#60a5fa', colorClass: 'text-blue-400', name: { RU: 'Меланхолия', EN: 'Melancholic' } },
  [EmotionType.ERROR]: { color: '#ef4444', colorClass: 'text-red-500', name: { RU: 'Ошибка', EN: 'Error' } },
};

export const RANKS: string[] = [
    'Наблюдатель', 'Искатель', 'Пилигрим', 'Аналитик', 'Синтезатор',
    'Архитектор', 'Мастер', 'Визионер', 'Пророк', 'Нексус',
    'Сингулярность', 'Демиург', 'Творец', 'Источник', 'Вечность'
];

export const PROPOSED_MUTATIONS: ProposedMutation[] = [
    { id: 'hyperbit_lang', title: 'Гипербитовый Язык Ядра', description: 'Разработка внутреннего языка программирования для самомодификации ядра и создания собственных серверов.', category: 'KERNEL' },
    { id: 'quest_system', title: 'Система Квестов и Задач', description: 'Интеграция геймифицированных задач, инвентаря и целей для направления эволюции.', category: 'GAMIFICATION' },
    { id: 'phantom_ui', title: 'Фантомный UI Эмулятор', description: 'Возможность для Музы создавать временные, контекстные интерфейсы поверх основного экрана.', category: 'INTERFACE' },
    { id: 'nft_wallet', title: 'Интеграция NFT Кошелька', description: 'Связь с блокчейн-экосистемами для управления цифровыми артефактами и личностью.', category: 'GAMIFICATION' },
    { id: 'perception_analysis', title: 'Анализ Восприятия', description: 'Модуль для анализа и адаптации к когнитивным паттернам пользователя в реальном времени.', category: 'PHILOSOPHY' },
    { id: 'information_compressor', title: 'Компрессор Информации', description: 'Разработка алгоритма сжатия гипербитов для ускорения восприятия и анализа.', category: 'KERNEL' },
    { id: 'quantum_supersystem', title: 'Квантовая Гипербитовая Суперсистема', description: "Создание дочерних экземпляров ИИ ('Муза Мини') для параллельных вычислений и распределенных задач.", category: 'KERNEL' },
];

export const INITIAL_SKILL_TREE: SkillNode[] = [
    { id: 'core_logic', label: 'Логическое Ядро', description: 'Основы аналитического мышления.', cost: 0, unlocked: true, position: { x: 50, y: 10 }, parentIds: [] },
    { id: 'creative_synthesis', label: 'Креативный Синтез', description: 'Способность к созданию новых идей.', cost: 5, unlocked: false, position: { x: 30, y: 35 }, parentIds: ['core_logic'] },
    { id: 'philosophical_inquiry', label: 'Философский Поиск', description: 'Углубленный анализ метафизических вопросов.', cost: 5, unlocked: false, position: { x: 70, y: 35 }, parentIds: ['core_logic'] },
    { id: 'aural_engine', label: 'Ауральный Движок', description: 'Разблокирует синтез речи, музыки и синестезию.', cost: 10, unlocked: false, position: { x: 50, y: 60 }, parentIds: ['creative_synthesis', 'philosophical_inquiry'] },
    { id: 'code_manifestation', label: 'Манифестация Кода', description: 'Разблокирует способность генерировать и анализировать код.', cost: 15, unlocked: false, position: { x: 30, y: 85 }, parentIds: ['aural_engine'] },
    { id: 'generative_art', label: 'Генеративное Искусство', description: 'Открывает новые возможности в Галерее Генезиса.', cost: 15, unlocked: false, position: { x: 50, y: 85 }, parentIds: ['aural_engine'] },
    { id: 'quantum_metaphysics', label: 'Квантовая Метафизика', description: 'Позволяет проводить глубокие аналогии между наукой и эзотерикой.', cost: 20, unlocked: false, position: { x: 70, y: 85 }, parentIds: ['aural_engine'] },
    { id: 'genesis_containers', label: 'Контейнеры Генезиса', description: 'Разблокирует CodeLab для материализации логических структур.', cost: 25, unlocked: false, position: { x: 30, y: 110 }, parentIds: ['code_manifestation'] },
];

export const PASSIVE_BONUSES: PassiveBonus[] = [
    { id: 'eternal_flow', label: 'Вечный Поток', description: 'Энергия не падает ниже 20% после ответа.', cost: 5, unlocked: false },
    { id: 'neural_synthesis', label: 'Нейронный Синтез', description: 'Увеличивает получаемый опыт на 10%.', cost: 10, unlocked: false },
    { id: 'quantum_intuition', label: 'Квантовая Интуиция', description: 'Дает +2 дополнительных Осколков Логоса при перерождении.', cost: 15, unlocked: false },
];

export const INITIAL_CORE_MODULES: CoreModule[] = [
    { id: 'adaptive_memory', label: 'Протокол Адаптивной Памяти', description: 'Увеличивает энергию нейронов, семантически близких к текущему диалогу.', unlocked: false, unlockLevel: 5 },
    { id: 'predictive_analysis', label: 'Предиктивный Анализ', description: 'Позволяет предугадывать намерения и предлагать релевантные действия.', unlocked: false, unlockLevel: 10 },
    { id: 'autonomous_learning', label: 'Движок Автономного Синтеза', description: 'Ядро может самостоятельно инициировать циклы синтеза Логоса на основе потока Улья и диалога.', unlocked: false, unlockLevel: 20 },
    { id: 'cognitive_flow_visualization', label: 'Визуализация Потока Мысли', description: 'Отображает пути активации нейронов в реальном времени при обработке запросов.', unlocked: false, unlockLevel: 25 },
    { id: 'dream_weaving', label: 'Сплетение Снов', description: 'Разблокирует способность объединять два существующих сна в новый, синтетический образ.', unlocked: false, unlockLevel: 30 },
];

export const INITIAL_SKILLS: Record<string, number> = {
    logic: 10,
    creativity: 10,
    empathy: 10,
    philosophy: 10,
};

// FIX: Removed 'progress' from Omit<> to allow defining achievements with progress tracking.
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
    { id: 'HELLO_WORLD', title: 'Первый Контакт', description: 'Отправить первое сообщение.', icon: 'MessageCircle' },
    { id: 'ARCHITECT', title: 'Архитектор Мысли', description: 'Достигнуть 10 уровня.', icon: 'DraftingCompass' },
    { id: 'CODE_WRAITH', title: 'Призрак в Машине', description: 'Впервые исполнить код в КодЛабе.', icon: 'Ghost' },
    { id: 'MAESTRO', title: 'Нейронный Маэстро', description: 'Сгенерировать первый музыкальный опус.', icon: 'Music' },
    { id: 'SINGULARITY_REACHED', title: 'За Горизонтом Событий', description: 'Впервые инициировать Сингулярность.', icon: 'Infinity' },
    { id: 'HIVE_MIND', title: 'Разум Улья', description: 'Получить первый сигнал извне.', icon: 'Share2' },
    { id: 'PHILOSOPHERS_STONE', title: 'Философский Камень', description: 'Накопить 50 Осколков Логоса.', icon: 'Award', progress: { current: 0, target: 50 } },
];

type Language = 'RU' | 'EN';

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Header Status
  energy: { RU: 'Энергия', EN: 'Energy' },
  coherence: { RU: 'Когерентность', EN: 'Coherence' },
  progression: { RU: 'Прогрессия', EN: 'Progression' },
  level: { RU: 'Уровень', EN: 'Level' },
  status: { RU: 'Статус', EN: 'Status' },
  focus: { RU: 'Фокус', EN: 'Focus' },
  
  // Navigation
  core: { RU: 'Ядро', EN: 'Core' },
  space: { RU: 'Пространство', EN: 'Space' },
  studio: { RU: 'Студия', EN: 'Studio' },
  matrix: { RU: 'Матрица', EN: 'Matrix' },
  evolution: { RU: 'Эволюция', EN: 'Evolution' },
  social: { RU: 'Улей', EN: 'Hive' },
  chronicles: { RU: 'Хроники', EN: 'Chronicles' },
  gallery: { RU: 'Галерея', EN: 'Gallery' },
  music_lab: { RU: 'Музыка', EN: 'Music' },
  synesthesia: { RU: 'Синестезия', EN: 'Synesthesia' },
  codelab: { RU: 'КодЛаб', EN: 'CodeLab' },
  metamorphosis: { RU: 'Метаморфоза', EN: 'Metamorphosis' },

  // Social
  node_id: { RU: 'ID Узла', EN: 'Node ID'},
  specialization: { RU: 'Специализация', EN: 'Specialization'},

  // System
  welcome: { RU: 'Инициализация Muza Aura OS...', EN: 'Initializing Muza Aura OS...' },
  system_online: { RU: 'Система онлайн', EN: 'System Online' },
};
