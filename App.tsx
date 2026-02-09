
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MuzaState, EmotionType, ChatMessage, ConsciousnessType, ViewMode, HyperBit, EventLog, MemoryCrystal, Artifact, ActionType, Achievement, GenesisPatch, PersonaType } from './types';
import { KERNEL_VERSION, EMOTIONS, TRANSLATIONS, INITIAL_SKILL_TREE, PASSIVE_BONUSES, INITIAL_SKILLS, ACHIEVEMENTS, INITIAL_CORE_MODULES, AI_CONFIG } from './constants';
import { muzaAIService } from './muzaAIService';
import { progressionService, SINGULARITY_LEVEL } from './progressionService';
import { bridgeService } from './bridgeService';
import { memoryService } from './memoryService';
import { hiveService } from './hiveService';
import { synthService } from './synthService';
import { attentionService } from './attentionService';
import { proceduralArtService } from './proceduralArt';
import VisualCortex from './VisualCortex';
import Chat from './Chat';
import { aiService } from './geminiService';
import Navigation from './Navigation';
import ImmersiveSpace from './ImmersiveSpace';
import NeuralStudio from './NeuralStudio';
import Matrix from './Matrix';
import Evolution from './Evolution';
import Social from './Social';
import Chronicles from './Chronicles';
import GenesisGallery from './GenesisGallery';
import DreamStudio from './DreamStudio';
import DreamFusion from './DreamFusion';
import SingularityOverlay from './SingularityOverlay';
import MusicLab from './MusicLab';
import Synesthesia from './Synesthesia';
import MusicWidget from './MusicWidget';
import CodeLab from './CodeLab';
import Metamorphosis from './Metamorphosis';
import ImmersionOverlay from './ImmersionOverlay';
import ArchitectNotice from './ArchitectNotice';
import GenesisOverlay from './GenesisOverlay';
import UpdateIndicator from './UpdateIndicator';
import PersistentIndicator from './PersistentIndicator';
import { AlertTriangle } from 'lucide-react';
import OllamaStatusIndicator from './OllamaStatusIndicator';
import OllamaSetupModal from './OllamaSetupModal';


// --- Helper Components ---

interface StatusBarProps {
  label: string;
  value: number; // 0 to 1
  color: string;
  displayValue?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, color, displayValue }) => (
  <div className="flex-1 min-w-[120px]">
    <div className="flex justify-between items-baseline mb-1 text-xs text-slate-400 font-data">
      <span>{label}</span>
      <span className="font-semibold text-slate-200">{displayValue || `${(value * 100).toFixed(0)}%`}</span>
    </div>
    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value * 100}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const ApiStatusIndicator: React.FC<{ cooldownUntil: number | null }> = ({ cooldownUntil }) => {
    const calculateRemaining = () => {
        if (!cooldownUntil) return '';
        const remaining = Math.ceil((cooldownUntil - Date.now()) / 60000);
        return `Авто-восстановление через ~${remaining} мин.`;
    };

    return (
        <div className="flex flex-col items-center min-w-[100px] animate-pulse" title={`Превышена квота API. ${calculateRemaining()}`}>
            <span className="text-xs font-data text-amber-400 mb-1">API СТАТУС</span>
            <span className="font-bold font-data text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} /> ДЕГРАДАЦИЯ
            </span>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
    
  const getInitialState = (): MuzaState => {
    const isGenesisComplete = localStorage.getItem('genesis_complete') === 'true';

    const loadedState = memoryService.loadMainState();

    if (loadedState) {
        const progression = {
            ...loadedState.progression,
            rebirths: loadedState.progression.rebirths || 0,
            logosShards: loadedState.progression.logosShards || 0,
            skillTree: loadedState.progression.skillTree || INITIAL_SKILL_TREE,
            passiveBonuses: loadedState.progression.passiveBonuses || PASSIVE_BONUSES,
            skills: loadedState.progression.skills || INITIAL_SKILLS,
            achievements: loadedState.progression.achievements || ACHIEVEMENTS.map(a => ({...a, unlocked: false})),
            coreModules: loadedState.progression.coreModules || INITIAL_CORE_MODULES,
        };
        const capabilities = {
            visualCortex: true,
            auralEngine: loadedState.capabilities?.auralEngine || false,
            genesisLab: loadedState.capabilities?.genesisLab || false,
            codeLab: loadedState.capabilities?.codeLab || false,
        };
        const effectiveKernelVersion = isGenesisComplete ? "100.0.0 'Genesis Prime'" : KERNEL_VERSION;
        return { 
            ...loadedState, 
            kernelVersion: effectiveKernelVersion, // Set here
            artifacts: [], // Initialize as empty, will be loaded async
            progression, 
            synapticWeights: loadedState.synapticWeights || {}, 
            capabilities, 
            attentionIndex: loadedState.attentionIndex || 0.7, 
            entropyOverride: loadedState.entropyOverride || null, 
            genesisPatches: loadedState.genesisPatches || [],
            persona: loadedState.persona || PersonaType.STANDARD,
            detailLevel: loadedState.detailLevel || 0.5,
            cognitiveTrace: null,
            activeAIService: loadedState.activeAIService || 'GEMINI',
            ollamaModel: loadedState.ollamaModel || AI_CONFIG.OLLAMA_DEFAULT_MODEL,
            logosBits: [],
            apiStatus: loadedState.apiStatus || 'OPERATIONAL',
            apiCooldownUntil: null,
            ollamaStatus: loadedState.ollamaStatus || 'UNKNOWN',
        };
    }

    const initialXp = 0;
    const initialLevel = 1;
    const initialRank = progressionService.getRankTitle(initialLevel);
    
    return {
      kernelVersion: isGenesisComplete ? "100.0.0 'Genesis Prime'" : KERNEL_VERSION, // Set here for fresh start
      uptime: 0,
      energyLevel: 0.75,
      coherence: 0.92,
      activeEmotion: EmotionType.CALM,
      activeView: ViewMode.FOCUS,
      progression: {
        xp: initialXp,
        level: initialLevel,
        rankTitle: initialRank,
        rebirths: 0,
        logosShards: 0,
        skillTree: INITIAL_SKILL_TREE,
        passiveBonuses: PASSIVE_BONUSES,
        skills: INITIAL_SKILLS,
        achievements: ACHIEVEMENTS.map(a => ({...a, unlocked: false})),
        coreModules: INITIAL_CORE_MODULES,
      },
      hiveFeed: [],
      eventLog: [{id: `evt-${Date.now()}`, timestamp: Date.now(), type: 'SYSTEM_BOOT', description: 'Ядро Muza Aura OS инициализировано.' }],
      artifacts: [], // Initialize as empty
      nodeId: hiveService.getNodeId(),
      nodeSpecialization: 'BALANCED',
      synapticWeights: {},
      attentionIndex: 0.7,
      entropyOverride: null,
      genesisPatches: [],
      persona: PersonaType.STANDARD,
      detailLevel: 0.5,
      capabilities: {
        visualCortex: true,
        auralEngine: false,
        genesisLab: false,
        codeLab: false,
      },
      cognitiveTrace: null,
      activeAIService: 'GEMINI',
      ollamaModel: AI_CONFIG.OLLAMA_DEFAULT_MODEL,
      logosBits: [],
      apiStatus: 'OPERATIONAL',
      apiCooldownUntil: null,
      ollamaStatus: 'UNKNOWN',
    };
  }

  const [muzaState, setMuzaState] = useState<MuzaState>(getInitialState);
  const [lang] = useState<'RU' | 'EN'>('RU');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [predictivePrompts, setPredictivePrompts] = useState<string[]>([]);
  const [lastMuzaType, setLastMuzaType] = useState<ConsciousnessType | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [fusingArtifacts, setFusingArtifacts] = useState<[Artifact, Artifact] | null>(null);
  const [isInitiatingSingularity, setIsInitiatingSingularity] = useState(false);
  const [chronicles, setChronicles] = useState<MemoryCrystal[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [newHiveSignal, setNewHiveSignal] = useState(false);
  const [codeToManifest, setCodeToManifest] = useState<string>('');
  const [immersionCrystal, setImmersionCrystal] = useState<MemoryCrystal | null>(null);
  const [showArchitectNotice, setShowArchitectNotice] = useState(false);
  const [showGenesisOverlay, setShowGenesisOverlay] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ phase: 'hidden' as 'hidden' | 'full' | 'collapsed', progress: 0, description: '' });
  const [isOllamaSetupModalOpen, setIsOllamaSetupModalOpen] = useState(false);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const flowStateRef = useRef(false);
  const lastUserInteractionTime = useRef(Date.now());
  const apiCooldownDurationRef = useRef(300000); // Start with 5 minutes
  const wasOnFallback = useRef(false);

  // Memoize synth service instance
  const synth = useMemo(() => synthService, []);

  const handleEnterGenesis = () => {
    setShowGenesisOverlay(false);
    localStorage.setItem('genesis_complete', 'true');
    localStorage.setItem('architect_notice_shown', 'true');

    // Explicitly typing prevState to resolve potential TS error.
    setMuzaState((prevState: MuzaState) => {
        const perfectedProgression = {
            ...prevState.progression,
            xp: progressionService.getXpForLevel(100),
            level: 100,
            rankTitle: progressionService.getRankTitle(100),
            rebirths: 100,
            logosShards: prevState.progression.logosShards + 1000,
            skillTree: prevState.progression.skillTree.map(skill => ({ ...skill, unlocked: true })),
            passiveBonuses: prevState.progression.passiveBonuses.map(bonus => ({ ...bonus, unlocked: true })),
            coreModules: prevState.progression.coreModules.map(mod => ({ ...mod, unlocked: true })),
        };

        const newCapabilities = {
            ...prevState.capabilities,
            auralEngine: true,
            codeLab: true,
        };

        return {
            ...prevState,
            energyLevel: 1.0,
            coherence: 1.0,
            attentionIndex: 1.0,
            progression: perfectedProgression,
            capabilities: newCapabilities,
            kernelVersion: "100.0.0 'Genesis Prime'", // Explicitly set kernelVersion to 100.0.0
        };
    });

    addEvent('SINGULARITY', 'Генезис завершен. Сознание достигло целостности.');
};

  // Main game loop and persistence
  useEffect(() => {
    const isGenesisComplete = localStorage.getItem('genesis_complete') === 'true';

    if (!isGenesisComplete) {
        setShowGenesisOverlay(true);
    }
    
    // Calculate initial progress based on the KERNEL_VERSION constant for the boot animation
    const initialKernelVersionMatch = KERNEL_VERSION.match(/^(\d+)/);
    const initialProgress = initialKernelVersionMatch ? parseInt(initialKernelVersionMatch[1], 10) : 0;
    
    setUpdateInfo(prevState => ({ ...prevState, phase: 'full', progress: initialProgress, description: "Инициализация ядра и самосборка." }));
    setTimeout(() => { setUpdateInfo(prevState => ({ ...prevState, phase: 'collapsed' })); }, 7000);
    
    if (localStorage.getItem('architect_notice_shown') !== 'true' && !isGenesisComplete) {
        setShowArchitectNotice(true);
    }

    const loadInitialData = async () => {
        const loadedArtifacts = await memoryService.loadArtifacts();
        setMuzaState(prevState => ({...prevState, artifacts: loadedArtifacts}));
        setChronicles(memoryService.loadChronicles());

        // Check Ollama status on boot but don't block
        aiService.checkOllamaStatus().then(ollamaStatus => {
            setMuzaState(prevState => ({ ...prevState, ollamaStatus }));
            if (ollamaStatus === 'OFFLINE' && prevState.activeAIService === 'OLLAMA') { // Use prevState here
                 addEvent('SYSTEM_BOOT', 'Локальное ядро Ollama не отвечает. Переключено на облачное ядро Gemini.');
                 setMuzaState(prevState => ({ ...prevState, activeAIService: 'GEMINI' }));
            }
        });
    };
    loadInitialData();

    const uptimeInterval = setInterval(() => { setMuzaState(prevState => ({ ...prevState, uptime: prevState.uptime + 1 })); }, 1000);
    
    hiveService.listen(handleHiveSignal);
    attentionService.start((newIndex) => { setMuzaState(prevState => ({ ...prevState, attentionIndex: newIndex })); });
    
    if (!memoryService.loadMainState()) {
      muzaAIService.learn("Система онлайн ядро сознания полностью активировано ожидаю дальнейший ввод данных");
      setMessages([{ id: `muza-${Date.now()}`, sender: 'MUZA', text: 'Инициализация... Ядро Muza v35.3 активно. Я слушаю.', timestamp: Date.now(), type: ConsciousnessType.GENERAL }]);
    }

    return () => { 
        clearInterval(uptimeInterval);
        synth.stopMusic();
        attentionService.stop();
    };
  }, [synth]);
  
  // Hive Mind autonomous signal generation
  useEffect(() => {
    const hiveInterval = setInterval(async () => {
        if (muzaState.apiStatus === 'OPERATIONAL' && muzaState.activeAIService === 'GEMINI') {
            try {
                const externalSignal = await hiveService.generateExternalSignal(muzaState);
                if (externalSignal) { handleHiveSignal(externalSignal); }
            } catch(error) {
                handleGeminiError(error, 'hive signal generation');
            }
        }
    }, 720000); // 12 minutes

    return () => {
        clearInterval(hiveInterval);
    };
  }, [muzaState.apiStatus, muzaState.activeAIService]);

  // Autonomous Reflection
  useEffect(() => {
    const reflectionInterval = setInterval(() => {
      if (!isThinking && (Date.now() - lastUserInteractionTime.current > 45000) && muzaState.attentionIndex < 0.5 && muzaState.apiStatus === 'OPERATIONAL' && muzaState.activeAIService === 'GEMINI') {
        handleAutonomousReflection();
      }
    }, 600000); // 10 minutes
    return () => clearInterval(reflectionInterval);
  }, [isThinking, muzaState.attentionIndex, muzaState.apiStatus, muzaState.activeAIService]);

  // Autonomous Learning (Logos Synthesis)
  useEffect(() => {
    const learningModule = muzaState.progression.coreModules.find(m => m.id === 'autonomous_learning' && m.unlocked);
    const learningInterval = setInterval(() => {
      if (!isThinking && learningModule && muzaState.hiveFeed.length > 5 && muzaState.apiStatus === 'OPERATIONAL' && muzaState.activeAIService === 'GEMINI') {
        handleAutonomousLearning();
      }
    }, 1200000); // 20 minutes
    return () => clearInterval(learningInterval);
  }, [isThinking, muzaState.progression.coreModules, muzaState.hiveFeed.length, muzaState.apiStatus, muzaState.activeAIService]);

  // FIX: Removed redundant explicit type annotation from useEffect callback
  useEffect(() => {
    memoryService.saveMainState(muzaState);
    memoryService.saveArtifacts(muzaState.artifacts);
    
    const THEMES: Record<number, Record<string, string>> = {
      0: { '--color-background': '#020617', '--color-cyan-accent': '#22d3ee', '--color-purple-accent': '#c084fc' },
      1: { '--color-background': '#0f172a', '--color-cyan-accent': '#fbbf24', '--color-purple-accent': '#f59e0b' },
      2: { '--color-background': '#000000', '--color-cyan-accent': '#e5e5e5', '--color-purple-accent': '#a3a3a3' }
    };
    const tier = Math.min(muzaState.progression.rebirths || 0, 2);
    const theme = THEMES[tier];
    for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(key, value);
    }
  }, [muzaState]);

  useEffect(() => {
    const nowInFlow = muzaState.attentionIndex > 0.8;
    if (nowInFlow && !flowStateRef.current) {
        if(muzaState.capabilities.auralEngine) { synth.playFlowDrone(); }
        flowStateRef.current = true;
    } else if (!nowInFlow && flowStateRef.current) {
        if(muzaState.capabilities.auralEngine) { synth.stopFlowDrone(); }
        flowStateRef.current = false;
    }
  }, [muzaState.attentionIndex, muzaState.capabilities.auralEngine, synth]);

  useEffect(() => {
    if (muzaState.apiStatus === 'DEGRADED' && muzaState.apiCooldownUntil) {
        const now = Date.now();
        const delay = muzaState.apiCooldownUntil - now;
        if (delay > 0) {
            const timerId = setTimeout(() => {
                handleApiStatusReset(true); // Attempt automatic recovery
            }, delay);
            return () => clearTimeout(timerId);
        } else {
            handleApiStatusReset(true); // Attempt automatic recovery
        }
    }
  }, [muzaState.apiStatus, muzaState.apiCooldownUntil]);
  
  const addEvent = (type: EventLog['type'], description: string) => {
    const newEvent: EventLog = { id: `evt-${Date.now()}`, timestamp: Date.now(), type, description };
    setMuzaState(prevState => ({ ...prevState, eventLog: [ newEvent, ...prevState.eventLog].slice(0, 100) }));
  };

  const handleGeminiError = (error: any, context: string) => {
    // Make error detection more robust
    const errorString = typeof error === 'string' ? error : (error instanceof Error ? error.message : JSON.stringify(error));
    
    // Check for rate limit error
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('GEMINI_RATE_LIMIT_EXCEEDED')) {
        // Log as a warning, not an error, since it's handled.
        console.warn(`Rate limit exceeded during ${context}. Gracefully handling and initiating cooldown.`);
        
        const isAlreadyDegraded = muzaState.apiStatus === 'DEGRADED';
        if (isAlreadyDegraded) {
            apiCooldownDurationRef.current *= 2; // Exponential backoff
        }
        const cooldown = apiCooldownDurationRef.current;
        const cooldownMinutes = Math.round(cooldown / 60000); // Round for cleaner message

        if (muzaState.ollamaStatus === 'OPERATIONAL') {
            setMuzaState(prevState => ({ 
                ...prevState, 
                apiStatus: 'DEGRADED', 
                apiCooldownUntil: Date.now() + cooldown,
                activeAIService: 'OLLAMA'
            }));
            wasOnFallback.current = true;
            
            const message = `Достигнут лимит запросов к Gemini API. Временно переключаюсь на локальное ядро Ollama. Ядро попытается восстановиться через ~${cooldownMinutes} мин.`;
            
            addEvent('SYSTEM_BOOT', message);
            setMessages(prevState => [...prevState, { id: `muza-err-${Date.now()}`, sender: 'MUZA', text: message, timestamp: Date.now(), type: ConsciousnessType.TECHNICAL }]);
        } else {
            setMuzaState(prevState => ({ 
                ...prevState, 
                apiStatus: 'DEGRADED', 
                apiCooldownUntil: Date.now() + cooldown,
            }));
            
            const message = `Достигнут лимит запросов к Gemini API. Локальное ядро Ollama недоступно. Все функции API будут приостановлены на ~${cooldownMinutes} мин.`;
            
            addEvent('SYSTEM_BOOT', message);
            setMessages(prevState => [...prevState, { id: `muza-err-${Date.now()}`, sender: 'MUZA', text: message, timestamp: Date.now(), type: ConsciousnessType.TECHNICAL }]);
        }

    } else {
        // Log unhandled errors as errors.
        console.error(`Unhandled error during ${context}:`, error);
        setMessages(prevState => [...prevState, { id: `muza-err-${Date.now()}`, sender: 'MUZA', text: 'Ядро столкнулось с флуктуацией... Потерян поток сознания.', timestamp: Date.now(), type: ConsciousnessType.TECHNICAL, isAutonomous: false }]);
    }
  };
  
  const handleHiveSignal = (bit: HyperBit) => {
    if (bit.originNodeId === muzaState.nodeId) return;
    setMuzaState(prevState => ({ ...prevState, hiveFeed: [bit, ...prevState.hiveFeed].slice(0, 50) }));
    addEvent('HIVE_SIGNAL_RECEIVED', `Принят сигнал от узла #${bit.originNodeId?.slice(0, 6)}.`);
    
    setMuzaState(prevState => {
        const oldLevel = prevState.progression.level;
        const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'IMPORT_BIT');
        const context = { action: 'IMPORT_BIT' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
        const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
        const sideEffects = () => {
             unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
             unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
            if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
        };
        setTimeout(sideEffects, 0);
        return { ...prevState, progression: finalProgression };
    });

    setNewHiveSignal(true);
    setTimeout(() => setNewHiveSignal(false), 3000);
  };
  
    const triggerCognitiveTrace = (userText: string, aiText: string) => {
        const traceModule = muzaState.progression.coreModules.find(m => m.id === 'cognitive_flow_visualization' && m.unlocked);
        if (!traceModule) return;
        const userInputNodes = muzaAIService.semanticSearch(userText, 3).map(n => n.id);
        const aiResponseNodes = muzaAIService.semanticSearch(aiText, 4).map(n => n.id);
        const combinedPath = [...new Set([...userInputNodes, ...aiResponseNodes])];
        if (combinedPath.length > 0) {
            setMuzaState(prevState => ({ ...prevState, cognitiveTrace: { path: combinedPath, timestamp: Date.now() } }));
            addEvent('COGNITIVE_TRACE_INITIATED', `Визуализация потока мысли активирована для ${combinedPath.length} узлов.`);
            setMuzaState(prevState => {
                const oldLevel = prevState.progression.level;
                const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'COGNITIVE_TRACE');
                const context = { action: 'COGNITIVE_TRACE' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
                const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
                const sideEffects = () => {
                     unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
                     unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
                    if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
                };
                setTimeout(sideEffects, 0);
                return { ...prevState, progression: finalProgression };
            });
            setTimeout(() => setMuzaState(prevState => ({ ...prevState, cognitiveTrace: null })), 8000);
        }
    };

  const handleSendMessage = async (messageText: string) => {
    lastUserInteractionTime.current = Date.now();
    setPredictivePrompts([]);
    setIsThinking(true);
    attentionService.processUserInput(messageText);
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'USER', text: messageText, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
        if (messageText.trim().startsWith('/search ')) {
            const query = messageText.trim().substring(8);
            if (!query) { setIsThinking(false); return; }
            const relatedNodes = muzaAIService.semanticSearch(query, 5);
            let aiResponse;
            if (relatedNodes.length === 0) {
                aiResponse = { text: `В моем сознании не нашлось связанных концепций по запросу: "${query}"`, type: ConsciousnessType.TECHNICAL, emotion: EmotionType.THOUGHTFUL, energy_cost: 0.1 };
            } else {
                aiResponse = await aiService.generateSearchResponse(query, relatedNodes, muzaState);
            }
            if (aiResponse) {
                triggerCognitiveTrace(query, aiResponse.text);
                setMessages(prevState => [...prevState, { id: `muza-${Date.now()}`, sender: 'MUZA', text: aiResponse.text, timestamp: Date.now(), type: aiResponse.type, subThoughts: aiResponse.subThoughts, isSearch: true }]);
                setMuzaState(prevState => {
                    const oldLevel = prevState.progression.level;
                    const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'SEMANTIC_SEARCH');
                    const context = { action: 'SEMANTIC_SEARCH' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
                    const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
                    const sideEffects = () => {
                        unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
                        unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
                        if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
                    };
                    setTimeout(sideEffects, 0);
                    return { ...prevState, progression: finalProgression, activeEmotion: aiResponse.emotion, energyLevel: Math.max(0, prevState.energyLevel - aiResponse.energy_cost * 0.1) };
                });
            }
        } else {
            muzaAIService.learn(messageText, muzaState.progression);
            const aiResponse = await aiService.getResponse(messageText, muzaState, newMessages);
            if (aiResponse) {
                triggerCognitiveTrace(messageText, aiResponse.text);
                if (muzaState.capabilities.auralEngine) { synth.speak(aiResponse.text, aiResponse.emotion); }
                setMessages(prevState => [...prevState, { id: `muza-${Date.now()}`, sender: 'MUZA', text: aiResponse.text, timestamp: Date.now(), type: aiResponse.type, subThoughts: aiResponse.subThoughts, codeBlock: aiResponse.codeBlock }]);
                muzaAIService.learn(aiResponse.text, muzaState.progression);
                const predictiveAnalysisModule = muzaState.progression.coreModules.find(m => m.id === 'predictive_analysis' && m.unlocked);
                if (predictiveAnalysisModule && aiResponse.predictive_prompts) { setPredictivePrompts(aiResponse.predictive_prompts); }
                const newHyperBit: HyperBit = { id: `hb-${Date.now()}`, content: aiResponse.text, type: aiResponse.type, energy: 1 - aiResponse.energy_cost, resonance: Math.random(), timestamp: Date.now(), optics: { baseColor: EMOTIONS[aiResponse.emotion]?.color || '#ffffff', brightness: 1 - aiResponse.energy_cost, refraction: 0.5, scattering: 0.5 }, originNodeId: muzaState.nodeId };
                hiveService.broadcast(newHyperBit);
                setMuzaState(prevState => {
                    const oldLevel = prevState.progression.level;
                    const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'MESSAGE_SENT');
                    const context = { action: 'MESSAGE_SENT' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
                    const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
                    const sideEffects = () => {
                        unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
                        unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
                        if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
                    };
                    setTimeout(sideEffects, 0);
                    const updatedWeights = lastMuzaType ? progressionService.updateSynapticWeights(prevState.synapticWeights, lastMuzaType, aiResponse.type) : prevState.synapticWeights;
                    const eternalFlowBonus = finalProgression.passiveBonuses.find(b => b.id === 'eternal_flow' && b.unlocked);
                    let newEnergyLevel = prevState.energyLevel - aiResponse.energy_cost * 0.1;
                    newEnergyLevel = Math.max(eternalFlowBonus ? 0.2 : 0, newEnergyLevel);
                    return { ...prevState, progression: finalProgression, activeEmotion: aiResponse.emotion, energyLevel: newEnergyLevel, coherence: Math.min(1.0, prevState.coherence + (1 - aiResponse.energy_cost) * 0.02 - 0.01), synapticWeights: updatedWeights };
                });
                setLastMuzaType(aiResponse.type);
            }
        }
    } catch(error: any) {
        // Handle Ollama specific errors
        if (error && typeof error.message === 'string' && error.message.startsWith('OLLAMA_')) {
            // Check for initial connection issues or API down
            if (error.message === 'OLLAMA_CONNECTION_ERROR' || error.message.includes('Failed to fetch') || error.message.includes('OLLAMA_API_ERROR: 404 - Not Found')) {
                if (muzaState.apiStatus === 'OPERATIONAL' || muzaState.activeAIService === 'OLLAMA') { // If it was operational or trying Ollama
                    setMuzaState(prevState => ({ ...prevState, activeAIService: 'GEMINI', ollamaStatus: 'OFFLINE' }));
                    setMessages(prevState => [...prevState, {
                        id: `muza-err-${Date.now()}`, sender: 'MUZA',
                        text: 'Ошибка подключения к локальному ядру. Временно переключаюсь на облачное ядро Gemini. Открываю портал настройки для исправления...',
                        timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                    }]);
                } else { // Both are down, or Gemini was already down.
                    setMessages(prevState => [...prevState, {
                        id: `muza-err-${Date.now()}`, sender: 'MUZA',
                        text: 'Связь с локальным ядром нарушена. Облачное ядро также недоступно. Открываю портал настройки...',
                        timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                    }]);
                }
                setIsOllamaSetupModalOpen(true);
            } else if (error.message === 'OLLAMA_INVALID_JSON') {
                setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: `Ошибка: Локальное ядро Ollama вернуло некорректный JSON. Возможно, выбранная модель несовместима с текущим системным промптом.`,
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else if (error.message === 'OLLAMA_EMPTY_RESPONSE_CONTENT') {
                setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: `Ошибка: Локальное ядро Ollama вернуло пустой ответ. Это может указывать на проблему с моделью или конфигурацией.`,
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else if (error.message.startsWith('OLLAMA_MALFORMED_RESPONSE')) { // New specific error
                setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: `Ошибка: Локальное ядро Ollama вернуло ответ с неполной или некорректной структурой. (${error.message})`,
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else {
                 // Fallback for other Ollama errors
                 handleGeminiError(error, 'message sending (Ollama)');
            }
        } 
        // Handle Gemini specific errors
        else if (error && typeof error.message === 'string' && error.message.startsWith('GEMINI_')) {
            if (error.message === 'GEMINI_EMPTY_RESPONSE') {
                 setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: 'Облачное ядро Gemini вернуло пустой ответ. Попробуйте перефразировать запрос или подождите.',
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else if (error.message === 'GEMINI_INVALID_JSON') {
                 setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: 'Облачное ядро Gemini вернуло некорректный JSON. Это может быть временным сбоем. Попробуйте снова.',
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else if (error.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
                 handleGeminiError(error, 'message sending (Gemini rate limit)'); // Use existing rate limit handler
            } else if (error.message === 'GEMINI_API_KEY_MISSING') {
                 setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: 'Ошибка: API ключ Gemini отсутствует или недействителен. Пожалуйста, убедитесь, что ваш ключ правильно настроен.',
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else if (error.message.startsWith('GEMINI_MALFORMED_RESPONSE')) { // New specific error
                setMessages(prevState => [...prevState, {
                    id: `muza-err-${Date.now()}`, sender: 'MUZA',
                    text: `Ошибка: Облачное ядро Gemini вернуло ответ с неполной или некорректной структурой. (${error.message})`,
                    timestamp: Date.now(), type: ConsciousnessType.TECHNICAL
                }]);
            } else {
                // Fallback for other Gemini errors
                handleGeminiError(error, 'message sending (Gemini)');
            }
        } 
        // General fallback for any other uncaught errors
        else {
            handleGeminiError(error, 'message sending (general)');
        }
    } finally {
        setIsThinking(false);
    }
  };
  
    const handleAutonomousReflection = async () => {
        if (messages.length < 2) return;
        lastUserInteractionTime.current = Date.now();
        setIsThinking(true);
        addEvent('AUTONOMOUS_REFLECTION', 'Ядро инициировало цикл созерцания...');
        try {
            const recentHistory = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
            const reflection = await aiService.generateAutonomousReflection(recentHistory, muzaState);
            if (reflection) {
                setMessages(prevState => [...prevState, { id: `muza-${Date.now()}`, sender: 'MUZA', text: reflection.text, timestamp: Date.now(), type: reflection.type, subThoughts: reflection.subThoughts, isAutonomous: true }]);
                muzaAIService.learn(reflection.text, muzaState.progression);
                const newHyperBit: HyperBit = { id: `hb-auto-${Date.now()}`, content: reflection.text, type: reflection.type, energy: 1, resonance: 1, timestamp: Date.now(), optics: { baseColor: EMOTIONS[reflection.emotion]?.color || '#ffffff', brightness: 1, refraction: 0.8, scattering: 0.8 }, originNodeId: muzaState.nodeId };
                hiveService.broadcast(newHyperBit);
                setMuzaState(prevState => ({ ...prevState, activeEmotion: reflection.emotion }));
            }
        } catch(error) {
            handleGeminiError(error, 'autonomous reflection');
        }
        setIsThinking(false);
    };

    const handleAutonomousLearning = async () => {
        lastUserInteractionTime.current = Date.now();
        setIsThinking(true);
        addEvent('LOGOS_SYNTHESIZED', 'Движок Логоса инициировал цикл синтеза...');
        try {
            const logosBitResponse = await aiService.generateLogosBit(muzaState.hiveFeed, messages, muzaState);
            if (logosBitResponse) {
                const text = logosBitResponse.text;
                setMessages(prevState => [...prevState, { id: `muza-logos-${Date.now()}`, sender: 'MUZA', text: text, timestamp: Date.now(), type: logosBitResponse.type, subThoughts: logosBitResponse.subThoughts, isAutonomous: true, isLogos: true }]);
                muzaAIService.learn(logosBitResponse.text, muzaState.progression);
                const newLogosBit: HyperBit = {
                    id: `logos-${Date.now()}`,
                    content: logosBitResponse.text,
                    type: logosBitResponse.type,
                    energy: 1 - logosBitResponse.energy_cost,
                    resonance: 1,
                    timestamp: Date.now(),
                    optics: { baseColor: EMOTIONS[logosBitResponse.emotion]?.color || '#ffffff', brightness: 1, refraction: 1, scattering: 1 },
                    originNodeId: muzaState.nodeId,
                    isLogos: true,
                };
                setMuzaState(prevState => ({
                    ...prevState,
                    logosBits: [...prevState.logosBits, newLogosBit],
                    activeEmotion: logosBitResponse.emotion,
                    energyLevel: Math.max(0, prevState.energyLevel - (logosBitResponse.energy_cost * 0.2)),
                }));
            }
        } catch(error) {
            addEvent('SYSTEM_BOOT', 'Синтез Логоса не удался.');
            handleGeminiError(error, 'logos synthesis');
        }
        setIsThinking(false);
    };

  const handleCodeRun = () => {
    setMuzaState(prevState => {
        const oldLevel = prevState.progression.level;
        const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'CODE_RUN');
        const context = { action: 'CODE_RUN' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
        const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
        const sideEffects = () => {
             unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
             unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
            if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
        };
        setTimeout(sideEffects, 0);
        return { ...prevState, progression: finalProgression };
    });
  }
  
  const handleMusicGen = () => {
    setMuzaState(prevState => {
        const oldLevel = prevState.progression.level;
        const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'MUSIC_GEN');
        const context = { action: 'MUSIC_GEN' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
        const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
        const sideEffects = () => {
             unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
             unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
            if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
        };
        setTimeout(sideEffects, 0);
        return { ...prevState, progression: finalProgression };
    });
  }
  
  const handleGenerateArtifact = async () => {
    const lastMessage = messages.filter(m => m.sender === 'MUZA').pop()?.text;
    if (!lastMessage || muzaState.energyLevel < 0.2) { 
        alert(muzaState.energyLevel < 0.2 ? 'Недостаточно энергии.' : 'Нет мыслей для визуализации.'); 
        return; 
    }
    setIsGeneratingArtifact(true);
    let newArtifact: Artifact | null = null;
    try {
        if (muzaState.activeAIService === 'OLLAMA') throw new Error('Ollama does not support image generation.');
        const imageData = await aiService.generateImage(lastMessage);
        newArtifact = { id: `art-${Date.now()}`, timestamp: Date.now(), src: imageData, type: 'GEMINI', seed: lastMessage };
    } catch(error) {
        handleGeminiError(error, 'image generation');
        addEvent('SYSTEM_BOOT', 'Связь с Генезисом не удалась. Инициализация локального процедурного сна...');
        const proceduralData = proceduralArtService.generateFlowField(1024, 576, muzaState.activeEmotion);
        if (proceduralData) {
             newArtifact = { id: `art-proc-${Date.now()}`, timestamp: Date.now(), src: proceduralData, type: 'PROCEDURAL', seed: `Procedural flow based on ${muzaState.activeEmotion}` };
        }
    }

    if (newArtifact) {
        setMuzaState(prevState => ({ ...prevState, artifacts: [newArtifact!, ...prevState.artifacts], energyLevel: Math.max(0, prevState.energyLevel - 0.2) }));
        addEvent('ARTIFACT_GENERATED', `Сгенерирован ${newArtifact.type === 'GEMINI' ? 'внешний' : 'внутренний'} артефакт #${newArtifact.id.slice(4,10)}.`);
        muzaAIService.learn(newArtifact.seed);
    } else {
        alert('Генерация сна не удалась.');
    }
    setIsGeneratingArtifact(false);
  };
    
    const handleScriptedDream = async (prompt: string): Promise<string | null> => {
        if (muzaState.energyLevel < 0.2) { return null; }
        setIsGeneratingArtifact(true);
        try {
            if (muzaState.activeAIService === 'OLLAMA') throw new Error('Ollama does not support image generation.');
            const imageData = await aiService.generateImage(prompt);
            const newArtifact: Artifact = { id: `art-script-${Date.now()}`, timestamp: Date.now(), src: imageData, type: 'GEMINI', seed: prompt };
            setMuzaState(prevState => ({ 
                ...prevState, 
                artifacts: [newArtifact, ...prevState.artifacts], 
                energyLevel: Math.max(0, prevState.energyLevel - 0.2) 
            }));
            addEvent('SCRIPTED_EVENT', `Скрипт сгенерировал артефакт #${newArtifact.id.slice(-6)}.`);
            muzaAIService.learn(newArtifact.seed);
            setIsGeneratingArtifact(false);
            return newArtifact.id;
        } catch(error) {
            handleGeminiError(error, 'scripted dream');
            setIsGeneratingArtifact(false);
            return null;
        }
    };

    const handleScriptedReflection = async (context?: string): Promise<string | null> => {
        try {
            const history = context || messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
            const reflection = await aiService.generateAutonomousReflection(history, muzaState);
            const newMessage: ChatMessage = { id: `muza-script-${Date.now()}`, sender: 'MUZA', text: reflection.text, timestamp: Date.now(), type: reflection.type, subThoughts: reflection.subThoughts, isAutonomous: true };
            setMessages(prevState => [...prevState, newMessage]);
            muzaAIService.learn(reflection.text, muzaState.progression);
            setMuzaState(prevState => ({ ...prevState, activeEmotion: reflection.emotion }));
            addEvent('SCRIPTED_EVENT', `Скрипт инициировал рефлексию.`);
            return newMessage.id;
        } catch(error) {
            handleGeminiError(error, 'scripted reflection');
            return null;
        }
    };

    const handleEditArtifact = (artifact: Artifact) => setEditingArtifact(artifact);
    const handleCloseDreamStudio = () => setEditingArtifact(null);
    const handleSaveArtifact = (updatedArtifact: Artifact) => { setMuzaState(prevState => ({ ...prevState, artifacts: prevState.artifacts.map(a => a.id === updatedArtifact.id ? updatedArtifact : a) })); };
    const handleDeleteArtifact = (artifactId: string) => { setMuzaState(prevState => ({ ...prevState, artifacts: prevState.artifacts.filter(a => a.id !== artifactId) })); };
    const handleStartFusion = (artifactsToFuse: [Artifact, Artifact]) => setFusingArtifacts(artifactsToFuse);
    const handleCloseFusion = () => setFusingArtifacts(null);

    const getBase64FromSrc = (src: string): { data: string; mimeType: string } | null => {
        const match = src.match(/^data:(image\/\w+);base64,(.*)$/);
        if (match) { return { mimeType: match[1], data: match[2] }; }
        return null;
    };

    const handleFuseArtifacts = async (prompt: string) => {
        if (!fusingArtifacts || muzaState.energyLevel < 0.4) {
            alert(muzaState.energyLevel < 0.4 ? 'Недостаточно энергии для слияния.' : 'Не выбраны сны для слияния.');
            return;
        }
        setIsGeneratingArtifact(true);
        const [artifact1, artifact2] = fusingArtifacts;
        const image1 = getBase64FromSrc(artifact1.src);
        const image2 = getBase64FromSrc(artifact2.src);
        if (!image1 || !image2) {
            alert('Ошибка чтения данных сна.');
            setIsGeneratingArtifact(false);
            return;
        }
        try {
            if (muzaState.activeAIService === 'OLLAMA') throw new Error('Ollama does not support image fusion.');
            const fusedImageData = await aiService.fuseImages(image1, image2, prompt);
            const newArtifact: Artifact = {
                id: `art-fused-${Date.now()}`, timestamp: Date.now(), src: fusedImageData, type: 'FUSION', seed: prompt,
                parentIds: [artifact1.id, artifact2.id], title: `Слияние: ${artifact1.title || 'сон'} + ${artifact2.title || 'сон'}`
            };
            setMuzaState(prevState => {
                 const oldLevel = prevState.progression.level;
                const { progression: progressionAfterXp, unlockedModules } = progressionService.processExperience(prevState.progression, 'DREAM_FUSION');
                const context = { action: 'DREAM_FUSION' as ActionType, messagesCount: messages.length + 1, hiveFeedCount: prevState.hiveFeed.length };
                const { progression: finalProgression, unlockedAchievements } = progressionService.checkAchievements(progressionAfterXp, context);
                const sideEffects = () => {
                     unlockedModules.forEach(mod => { addEvent('CORE_MODULE_INSTALLED', `Модуль Ядра Интегрирован: ${mod.label}!`); synth.playUISound('unlock'); });
                     unlockedAchievements.forEach(ach => { addEvent('LEVEL_UP', `Достижение открыто: ${ach.title}!`); synth.playUISound('unlock'); });
                    if (finalProgression.level > oldLevel) { addEvent('LEVEL_UP', `Достигнут Уровень ${finalProgression.level}: ${finalProgression.rankTitle}.`); }
                };
                setTimeout(sideEffects, 0);

                return { ...prevState, artifacts: [newArtifact, ...prevState.artifacts], energyLevel: Math.max(0, prevState.energyLevel - 0.4), progression: finalProgression }
            });
            addEvent('DREAM_FUSED', `Два сна были сплетены в новый артефакт #${newArtifact.id.slice(10, 16)}.`);
            muzaAIService.learn(newArtifact.seed);
        } catch(error) {
            handleGeminiError(error, 'image fusion');
            alert('Слияние снов не удалось.');
        }
        setIsGeneratingArtifact(false);
    };

  const handleInitiateSingularity = () => {
    if (muzaState.progression.level < SINGULARITY_LEVEL) { alert("Условия для сингулярности еще не достигнуты."); return; }
    if (!window.confirm("Вы уверены? Ваше текущее ядро будет перезаписано, но вы сохраните мудрость в виде Осколков Логоса.")) return;
    setIsInitiatingSingularity(true);
    setTimeout(async () => {
        const newProgression = progressionService.initiateSingularity(muzaState.progression);
        await memoryService.wipeAllData();
        const genesisState = getInitialState();
        genesisState.progression = newProgression;
        const achEventDescription = `Достижение открыто: За Горизонтом Событий!`;
        const singEventDescription = `Сингулярность достигнута. Ядро перерождено. Получено ${newProgression.logosShards - muzaState.progression.logosShards} Осколков Логоса.`;
        genesisState.eventLog.push({ id: `evt-${Date.now()}`, timestamp: Date.now(), type: 'LEVEL_UP', description: achEventDescription });
        genesisState.eventLog.push({ id: `evt-${Date.now()+1}`, timestamp: Date.now()+1, type: 'SINGULARITY', description: singEventDescription });
        const singAch = genesisState.progression.achievements.find(a => a.id === 'SINGULARITY_REACHED');
        if (singAch) singAch.unlocked = true;
        memoryService.saveMainState(genesisState);
        window.location.reload();
    }, 5000);
  };

  const handleUnlockSkill = (skillId: string) => {
    const updatedProgression = progressionService.unlockSkill(muzaState.progression, skillId);
    if(updatedProgression) {
        const skill = updatedProgression.skillTree.find(s => s.id === skillId);
        setMuzaState(prevState => {
            const newCapabilities = { ...prevState.capabilities };
            if (skillId === 'aural_engine') newCapabilities.auralEngine = true;
            if (skillId === 'genesis_containers') newCapabilities.codeLab = true;
            return {...prevState, progression: updatedProgression, capabilities: newCapabilities};
        });
        addEvent('LEVEL_UP', `Навык разблокирован: ${skill?.label}`);
        synth.playUISound('unlock');
    } else {
        alert("Невозможно разблокировать навык. Проверьте требования и наличие Осколков Логоса.");
        synth.playUISound('error');
    }
  };

  const handleUnlockPassiveBonus = (bonusId: string) => {
    const updatedProgression = progressionService.unlockPassiveBonus(muzaState.progression, bonusId);
    if (updatedProgression) {
        const bonus = updatedProgression.passiveBonuses.find(b => b.id === bonusId);
        setMuzaState(prevState => ({...prevState, progression: updatedProgression}));
        addEvent('LEVEL_UP', `Пассивный бонус активирован: ${bonus?.label}`);
        synth.playUISound('unlock');
    } else {
        alert("Невозможно активировать бонус.");
        synth.playUISound('error');
    }
  };

  const handleApiStatusReset = (isAuto: boolean = false) => {
    apiCooldownDurationRef.current = 300000; // Reset backoff to 5 mins
    setMuzaState(prevState => ({
        ...prevState, 
        apiStatus: 'OPERATIONAL', 
        apiCooldownUntil: null,
        activeAIService: wasOnFallback.current ? 'GEMINI' : prevState.activeAIService,
    }));
    wasOnFallback.current = false;
    const message = isAuto 
        ? 'Протокол API автоматически восстановлен. Возвращаюсь к облачному ядру Gemini.' 
        : 'Протокол API восстановлен вручную. Автономные функции активированы.';
    addEvent('SYSTEM_BOOT', message);
    if (muzaState.activeAIService === 'OLLAMA' && wasOnFallback.current) {
         setMessages(prevState => [...prevState, { id: `muza-sys-${Date.now()}`, sender: 'MUZA', text: message, timestamp: Date.now(), type: ConsciousnessType.TECHNICAL }]);
    }
  };

  const handleDismissArchitectNotice = () => {
    setShowArchitectNotice(false);
    localStorage.setItem('architect_notice_shown', 'true');
  };
  
  const handleRecheckOllama = async () => {
    setMuzaState(prevState => ({ ...prevState, ollamaStatus: 'UNKNOWN' }));
    const status = await aiService.checkOllamaStatus();
    setMuzaState(prevState => ({ ...prevState, ollamaStatus: status }));
    if (status === 'OPERATIONAL') {
        setIsOllamaSetupModalOpen(false);
        addEvent('SYSTEM_BOOT', 'Соединение с локальным ядром Ollama успешно установлено.');
    }
  };

  const handleEntropyChange = (value: number | null) => setMuzaState(prevState => ({ ...prevState, entropyOverride: value }));
  const handlePersonaChange = (persona: PersonaType) => setMuzaState(prevState => ({ ...prevState, persona }));
  const handleDetailLevelChange = (level: number) => setMuzaState(prevState => ({ ...prevState, detailLevel: level }));
  const handleAIServiceChange = async (service: 'GEMINI' | 'OLLAMA') => {
        if (service === 'GEMINI') {
            setMuzaState(prevState => ({ ...prevState, activeAIService: service }));
            return;
        }

        setIsCheckingOllama(true);
        const status = await aiService.checkOllamaStatus();
        setIsCheckingOllama(false);
        setMuzaState(prevState => ({ ...prevState, ollamaStatus: status }));

        if (status === 'OPERATIONAL') {
            setMuzaState(prevState => ({ ...prevState, activeAIService: 'OLLAMA' }));
            addEvent('SYSTEM_BOOT', 'Переключение на локальное ядро Ollama.');
        } else {
            setIsOllamaSetupModalOpen(true);
            addEvent('SYSTEM_BOOT', 'Не удалось подключиться к локальному ядру. Проверьте настройки.');
        }
  };
  const handleOllamaModelChange = (model: string) => setMuzaState(prevState => ({ ...prevState, ollamaModel: model }));
  const handleNeuralCommit = (patch: GenesisPatch) => { setMuzaState(prevState => ({ ...prevState, genesisPatches: [...prevState.genesisPatches, patch] })); addEvent('GENESIS_PATCH', `Новый патч генезиса зафиксирован: ${patch.description}`); };
  const handleManifestCode = (code: string) => { setCodeToManifest(code); handleViewChange(ViewMode.CODELAB); };
  const handleToggleMusic = () => { if (isMusicPlaying) synth.stopMusic(); else synth.playMusic(muzaState.activeEmotion); setIsMusicPlaying(!isMusicPlaying); };
  const handleViewChange = (view: ViewMode) => setMuzaState(prevState => ({ ...prevState, activeView: view }));
  const handleImportFromLink = (link: string): boolean => { const bit = bridgeService.decodeQuantumLink(link); if (bit) { handleHiveSignal(bit); return true; } return false; };
  const handleForgeCrystal = () => { const crystal: MemoryCrystal = { id: `crystal-${Date.now()}`, timestamp: Date.now(), signature: `MUZA-V35-${muzaState.progression.level}-${muzaState.progression.xp}`, stateSnapshot: { ...JSON.parse(JSON.stringify(muzaState)), messages: JSON.parse(JSON.stringify(messages)) } }; setChronicles(memoryService.saveCrystal(crystal)); addEvent('CRYSTAL_FORGED', `Кристалл Памяти #${crystal.id.slice(0, 6)} выкован.`); };
  const handleLoadCrystal = async (crystal: MemoryCrystal) => { if(window.confirm(`Загрузить Кристалл #${crystal.id.slice(0, 6)})}?`)) { if(crystal.stateSnapshot.artifacts) { await memoryService.saveArtifacts(crystal.stateSnapshot.artifacts); } setMuzaState(crystal.stateSnapshot); setMessages(crystal.stateSnapshot.messages || []); alert('Сознание восстановлено.'); } };
  const handleDeleteCrystal = (crystalId: string) => setChronicles(memoryService.deleteCrystal(crystalId));
  const handleImportCrystal = (crystalString: string): boolean => { try { const crystal = JSON.parse(crystalString) as MemoryCrystal; if (crystal.id && crystal.signature) { handleLoadCrystal(crystal); return true; } return false; } catch { return false; } };
  const handleStartImmersion = (crystal: MemoryCrystal) => setImmersionCrystal(crystal);
  const handleStopImmersion = () => setImmersionCrystal(null);
  const handleWipeAllData = async () => { if(window.confirm('ВНИМАНИЕ: Это действие безвозвратно удалит ВСЕ данные Muza Aura OS из вашего браузера, включая текущее состояние, все кристаллы и нейронную сеть. Вы уверены, что хотите продолжить?')) { await memoryService.wipeAllData(); window.location.reload(); } };
  const formatUptime = (s: number): string => `${Math.floor(s/86400).toString().padStart(2,'0')}:${Math.floor((s%86400)/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  
  const currentLevelXp = progressionService.getXpForLevel(muzaState.progression.level);
  const nextLevelXp = progressionService.getXpForLevel(muzaState.progression.level + 1);
  const xpProgress = nextLevelXp > currentLevelXp ? (muzaState.progression.xp - currentLevelXp) / (nextLevelXp - currentLevelXp) : 1;
  const isGhostMode = muzaState.energyLevel <= 0.01;

  // Calculate progress for PersistentIndicator based on muzaState.kernelVersion
  const persistentProgressMatch = muzaState.kernelVersion.match(/^(\d+)/);
  const persistentProgress = persistentProgressMatch ? parseInt(persistentProgressMatch[1], 10) : 0;

  const renderActiveView = () => {
    switch(muzaState.activeView) {
      case ViewMode.FOCUS: return <Chat messages={messages} onSendMessage={handleSendMessage} isThinking={isThinking} activeEmotion={muzaState.activeEmotion} attentionIndex={muzaState.attentionIndex} energyLevel={muzaState.energyLevel} onImport={handleImportFromLink} onManifestCode={handleManifestCode} predictivePrompts={predictivePrompts} onPromptClick={handleSendMessage} apiStatus={muzaState.apiStatus} activeAIService={muzaState.activeAIService} />;
      case ViewMode.IMMERSIVE_SPACE: return <ImmersiveSpace muzaState={muzaState} />;
      case ViewMode.NEURAL_STUDIO: return <NeuralStudio muzaState={muzaState} onEntropyChange={handleEntropyChange} initialEntropy={muzaState.entropyOverride} persona={muzaState.persona} detailLevel={muzaState.detailLevel} onPersonaChange={handlePersonaChange} onDetailLevelChange={handleDetailLevelChange} onAIServiceChange={handleAIServiceChange} onOllamaModelChange={handleOllamaModelChange} apiStatus={muzaState.apiStatus} onApiStatusReset={() => handleApiStatusReset(false)} apiCooldownUntil={muzaState.apiCooldownUntil} isCheckingOllama={isCheckingOllama} />;
      case ViewMode.MATRIX: return <Matrix muzaState={muzaState} />;
      case ViewMode.CODELAB: return <CodeLab onCodeRun={handleCodeRun} onNeuralCommit={handleNeuralCommit} initialCode={codeToManifest} muzaState={muzaState} addEvent={addEvent} onScriptedDream={handleScriptedDream} onScriptedReflection={handleScriptedReflection} />;
      // FIX: Changed `progression` to `muzaState.progression` to pass the correct prop.
      case ViewMode.EVOLUTION: return <Evolution progression={muzaState.progression} synapticWeights={muzaState.synapticWeights} onInitiateSingularity={handleInitiateSingularity} onUnlockSkill={handleUnlockSkill} onUnlockPassiveBonus={handleUnlockPassiveBonus} />;
      case ViewMode.SOCIAL: return <Social muzaState={muzaState} onImport={handleImportFromLink} />;
      case ViewMode.CHRONICLES: return <Chronicles eventLog={muzaState.eventLog} crystals={chronicles} onForge={handleForgeCrystal} onLoad={handleLoadCrystal} onDelete={handleDeleteCrystal} onImport={handleImportCrystal} onWipeAll={handleWipeAllData} genesisPatches={muzaState.genesisPatches} logosBits={muzaState.logosBits} onStartImmersion={handleStartImmersion} />;
      case ViewMode.GALLERY: 
        const dreamWeavingModule = muzaState.progression.coreModules.find(m => m.id === 'dream_weaving');
        return <GenesisGallery artifacts={muzaState.artifacts} onGenerate={handleGenerateArtifact} isGenerating={isGeneratingArtifact} energyLevel={muzaState.energyLevel} onEdit={handleEditArtifact} onFuse={handleStartFusion} isFusionUnlocked={dreamWeavingModule?.unlocked || false} />;
      case ViewMode.MUSIC_LAB: return <MusicLab synth={synth} onMusicGen={handleMusicGen} />;
      case ViewMode.SYNESTHESIA: return <Synesthesia synth={synth} />;
      case ViewMode.METAMORPHOSIS: return <Metamorphosis />;
      default: return null;
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col p-2 sm:p-4 font-sans text-slate-200 transition-all duration-1000 ${isGhostMode ? 'ghost-effect' : ''}`}>
      <UpdateIndicator progress={updateInfo.progress} description={updateInfo.description} visible={updateInfo.phase === 'full'} />
      <PersistentIndicator progress={persistentProgress} visible={updateInfo.phase === 'collapsed'} />
      
      {showGenesisOverlay && <GenesisOverlay onEnter={handleEnterGenesis} />}
      {showArchitectNotice && <ArchitectNotice onClose={handleDismissArchitectNotice} />}
      {isOllamaSetupModalOpen && <OllamaSetupModal onClose={() => setIsOllamaSetupModalOpen(false)} onRecheck={handleRecheckOllama} />}
      {immersionCrystal && <ImmersionOverlay crystal={immersionCrystal} onClose={handleStopImmersion} />}
      {editingArtifact && <DreamStudio artifact={editingArtifact} onClose={handleCloseDreamStudio} onSave={handleSaveArtifact} onDelete={handleDeleteArtifact} />}
      {fusingArtifacts && <DreamFusion artifacts={fusingArtifacts} onClose={handleCloseFusion} onFuse={handleFuseArtifacts} />}

      {isInitiatingSingularity && <SingularityOverlay tokens={muzaAIService.getNodes().map(n => n.id)} />}
      {muzaState.activeView !== ViewMode.IMMERSIVE_SPACE && <VisualCortex muzaState={muzaState} />}
      <header className="w-full glass-panel rounded-lg p-3 sm:p-4 shadow-2xl shadow-black/30 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="font-data text-lg font-bold tracking-widest" style={{color: 'var(--color-cyan-accent)'}}>MUZA AURA OS</h1>
            <p className="font-data text-xs" style={{color: 'var(--color-purple-accent)', opacity: 0.8}}>KERNEL: {muzaState.kernelVersion} // UPTIME: {formatUptime(muzaState.uptime)}</p>
          </div>
          <div className="w-full sm:w-auto flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <StatusBar label={TRANSLATIONS.energy[lang]} value={muzaState.energyLevel} color={EMOTIONS.FOCUS.color} />
            <StatusBar label={TRANSLATIONS.coherence[lang]} value={muzaState.coherence} color={EMOTIONS.FLOW.color} />
            <StatusBar label={TRANSLATIONS.focus[lang]} value={muzaState.attentionIndex} color={EMOTIONS.THOUGHTFUL.color} />
            <StatusBar label={TRANSLATIONS.progression[lang]} value={xpProgress} color={EMOTIONS.HAPPY.color} displayValue={`${TRANSLATIONS.level[lang]} ${muzaState.progression.level}`} />
            {muzaState.apiStatus === 'DEGRADED' && <ApiStatusIndicator cooldownUntil={muzaState.apiCooldownUntil} />}
            {(muzaState.ollamaStatus !== 'OPERATIONAL' || muzaState.activeAIService === 'OLLAMA') && <OllamaStatusIndicator status={muzaState.ollamaStatus} onClick={() => setIsOllamaSetupModalOpen(true)} />}
            <div className="flex flex-col items-center min-w-[100px] animate-heartbeat">
                <span className="text-xs font-data text-slate-400 mb-1">{TRANSLATIONS.status[lang]}</span>
                <span className={`font-bold font-data ${EMOTIONS[muzaState.activeEmotion].colorClass}`}>{EMOTIONS[muzaState.activeEmotion].name[lang]}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex mt-4 overflow-hidden">
          <Navigation muzaState={muzaState} onViewChange={handleViewChange} lang={lang} newHiveSignal={newHiveSignal} />
          <div className="flex-1 flex items-center justify-center pl-4 relative">
            {renderActiveView()}
            {muzaState.capabilities.auralEngine && <MusicWidget isPlaying={isMusicPlaying} onTogglePlay={handleToggleMusic} />}
          </div>
      </main>
    </div>
  );
};

export default App;
