import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Upload, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Compass, 
  UserCheck, 
  RotateCcw, 
  HelpCircle, 
  Lock, 
  Music, 
  Clock, 
  Tv,
  Settings,
  Flame,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AFFIRMATION_CATEGORIES, BRAINWAVE_FREQUENCIES, BUILT_IN_SOUNDS, DEFAULT_CUSTOM_AFFIRMATION, WEALTH_AFFIRMATIONS } from './data/wealthContent';
import { readStorage, todayKey, writeStorage } from './utils/storage';

type TabName = 'home' | 'player' | 'meditation' | 'journal' | 'security';

type DailyStats = {
  date: string;
  sessions: number;
  meditationSeconds: number;
  repetitions: number;
};

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabName>(() => readStorage<TabName>('vanizan_active_tab', 'home'));
  
  // Affirmation Player States
  const [currentAffIndex, setCurrentAffIndex] = useState<number>(() => readStorage('vanizan_last_affirmation_index', 0));
  const [isPlayingAff, setIsPlayingAff] = useState<boolean>(false);
  const isPlayingAffRef = useRef<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(() => readStorage('vanizan_speech_rate', 1));
  const [autoNext, setAutoNext] = useState<boolean>(() => readStorage('vanizan_auto_next', true));
  const [showSubtitles, setShowSubtitles] = useState<boolean>(() => readStorage('vanizan_show_subtitles', true));
  const [customAffirmationText, setCustomAffirmationText] = useState<string>(() => readStorage('vanizan_custom_affirmation', DEFAULT_CUSTOM_AFFIRMATION));

  // 7 Chakra Color System for affirmations
  const CHAKRA_COLORS = [
    { name: 'سرمه‌ای (Root)', hex: '#dc2626' },
    { name: 'نارنجی (Sacral)', hex: '#ea580c' },
    { name: 'زرد (Solar Plexus)', hex: '#eab308' },
    { name: 'سبز (Heart)', hex: '#16a34a' },
    { name: 'آبی (Throat)', hex: '#2563eb' },
    { name: 'نیلی (Third Eye)', hex: '#4f46e5' },
    { name: 'بنفش (Crown)', hex: '#9333ea' }
  ];

  const getChakraColor = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('هویتی') || lower.includes('identity') || lower.includes('من واسطه') || lower.includes('حل‌کننده') || lower.includes('آهنربا')) return CHAKRA_COLORS[0].hex;
    if (lower.includes('ثروت') || lower.includes('wealth') || lower.includes('فراوانی') || lower.includes('درآمد') || lower.includes('پول')) return CHAKRA_COLORS[1].hex;
    if (lower.includes('مذاکره') || lower.includes('negotiation') || lower.includes('توافق') || lower.includes('برد-برد') || lower.includes('سکوت')) return CHAKRA_COLORS[2].hex;
    if (lower.includes('اعتماد') || lower.includes('trust') || lower.includes('خدمت') || lower.includes('ارزش')) return CHAKRA_COLORS[3].hex;
    if (lower.includes('رادار') || lower.includes('شناسایی') || lower.includes('تشخیص') || lower.includes('پروژه')) return CHAKRA_COLORS[4].hex;
    if (lower.includes('استاد') || lower.includes('mastery') || lower.includes('بازار') || lower.includes('زمان') || lower.includes('ذهن')) return CHAKRA_COLORS[5].hex;
    return CHAKRA_COLORS[6].hex;
  };

  const getChakraColorForCategory = (category: string): string => {
    const map: Record<string, string> = {
      'identity': CHAKRA_COLORS[0].hex,
      'wealth': CHAKRA_COLORS[1].hex,
      'negotiation': CHAKRA_COLORS[2].hex,
      'partnership': CHAKRA_COLORS[4].hex,
      'mastery': CHAKRA_COLORS[6].hex
    };
    return map[category] || CHAKRA_COLORS[3].hex;
  };
  const [repeatTarget, setRepeatTarget] = useState<number>(() => readStorage('vanizan_repeat_target', 108));
  const [repeatCount, setRepeatCount] = useState<number>(() => readStorage('vanizan_repeat_count', 0));

  // Sound Synth States (Web Audio API)
  const [activeFrequency, setActiveFrequency] = useState<number | null>(() => readStorage<number | null>('vanizan_selected_frequency', null));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const builtInOscillatorRef = useRef<OscillatorNode | null>(null);
  const builtInLfoRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const builtInGainRef = useRef<GainNode | null>(null);
  const [freqVolume, setFreqVolume] = useState<number>(() => readStorage('vanizan_frequency_volume', 0.3));
  const [activeBuiltInSound, setActiveBuiltInSound] = useState<string | null>(() => readStorage<string | null>('vanizan_built_in_sound', null));
  const [builtInVolume, setBuiltInVolume] = useState<number>(() => readStorage('vanizan_builtin_volume', 0.22));

  // Custom User Uploaded Music States
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioPlaying, setCustomAudioPlaying] = useState<boolean>(false);
  const [customAudioVolume, setCustomAudioVolume] = useState<number>(() => readStorage('vanizan_custom_audio_volume', 0.5));
  const [customAudioSpeed, setCustomAudioSpeed] = useState<number>(() => readStorage('vanizan_custom_audio_speed', 1.0));
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(() => readStorage('vanizan_sleep_timer_minutes', 0));
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);
  const [backgroundPlayback, setBackgroundPlayback] = useState<boolean>(() => readStorage('vanizan_background_playback', true));

  // Breathing Meditation States
  const [breathingPhase, setBreathingPhase] = useState<'دم (ورود ثروت)' | 'حبس دم (جذب در سلول‌ها)' | 'بازدم (رهاسازی فقر)'>('دم (ورود ثروت)');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingSpeed, setBreathingSpeed] = useState<number>(() => readStorage('vanizan_breathing_speed', 4)); // seconds per cycle phase (4-4-4)

  // 68-Second Focus Timer
  const [focusTimer, setFocusTimer] = useState<number>(68);
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);
  const [focusFinished, setFocusFinished] = useState<boolean>(false);
  const [focusSparkles, setFocusSparkles] = useState<{id: number, x: number, y: number}[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => readStorage('vanizan_daily_stats', {
    date: todayKey(),
    sessions: 0,
    meditationSeconds: 0,
    repetitions: 0
  }));
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(() => readStorage('vanizan_daily_reminder_enabled', false));
  const [dailyReminderTime, setDailyReminderTime] = useState<string>(() => readStorage('vanizan_daily_reminder_time', '21:00'));
  const [nightMode, setNightMode] = useState<boolean>(() => readStorage('vanizan_night_mode', true));

  // PWA Install Prompt State
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPromptEvent) {
      triggerToast('مرورگر شما از نصب PWA پشتیبانی نمی‌کند. لطفاً از مرورگر کروم استفاده کنید.', 'warning');
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
      triggerToast('اپلیکیشن ونیزان با موفقیت نصب شد! 💰', 'success');
    }
  };

  // Gratitude / Vision Board Database (LocalStorage)
  const [wealthGoals, setWealthGoals] = useState<string[]>(() => {
    return readStorage('vanizan_wealth_goals', [
      "من با شایستگی کامل تا پایان امسال به استقلال مالی بی‌نظیر دست می‌یابم.",
      "خدایا سپاسگزارم که از راه‌های حلال، شاد و آسان، ثروت به زندگی‌ام سرازیر می‌شود.",
      "من هر روز مغناطیس قوی‌تری برای جذب ایده‌های ثروت‌ساز و انسان‌های حامی هستم."
    ]);
  });
  const [newGoalText, setNewGoalText] = useState<string>('');
  
  const [gratitudeList, setGratitudeList] = useState<string[]>(() => {
    return readStorage('vanizan_gratitude_list', [
      "سپاسگزارم بابت سقفی امن، سلامتی جسمانی‌ام و فرصت زنده بودن و ثروتمند شدن.",
      "سپاسگزارم بابت تمام پول‌هایی که در طول زندگی‌ام به دست آورده‌ام و تمام نعمات کائنات.",
      "سپاسگزارم بابت سایت گرداب موفقیت ونیزان که راه ارتعاش درست را به من آموخت."
    ]);
  });
  const [newGratitudeText, setNewGratitudeText] = useState<string>('');

  // Daily Oracle Card State
  const [dailyOracle, setDailyOracle] = useState<{code: string, quote: string, action: string} | null>(null);

  // Security Shield & Alerts
  const [securityViolationsCount, setSecurityViolationsCount] = useState<number>(0);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [securityModalMsg, setSecurityModalMsg] = useState<string>('');
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'error' | 'warning' | 'success'}[]>([]);

  // Simulated System States
  const [currentTime, setCurrentTime] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [goldSparkleParticles, setGoldSparkleParticles] = useState<{id: number, left: number, size: number, delay: number, duration: number}[]>([]);
  const [subliminalWord, setSubliminalWord] = useState<string>('ثروت بی‌نهایت');
  const [subliminalDuration, setSubliminalDuration] = useState<number>(() => readStorage('vanizan_subliminal_duration', 150));
  const [subliminalFrequency, setSubliminalFrequency] = useState<number>(() => readStorage('vanizan_subliminal_frequency', 500));
  const [showSubliminalPlayer, setShowSubliminalPlayer] = useState<boolean>(false);
  const [subliminalIndex, setSubliminalIndex] = useState<number>(0);
  const [isSubliminalPlaying, setIsSubliminalPlaying] = useState<boolean>(false);
  const [isSubliminalVisible, setIsSubliminalVisible] = useState<boolean>(true);
  const subliminalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subliminalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Floating watermark coordinates for prevention of steady recording
  const [watermarkPos, setWatermarkPos] = useState({ x: 10, y: 30 });

  // 1. Core clock & battery effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Randomize battery slowly
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => (prev > 15 ? prev - 1 : 100));
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(batteryInterval);
    };
  }, []);

  // 2. Sparkle particle generator
  useEffect(() => {
    const particles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 4
    }));
    setGoldSparkleParticles(particles);

    // Subliminal word switcher
    const words = ['ثروت بی‌نهایت', 'فراوانی الهی', 'من خود ثروتم', 'جذب پول آسان', 'حق طبیعی من', 'سپاسگزاری', 'ذهن ثروتمند ونیزان'];
    const subliminalInterval = setInterval(() => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setSubliminalWord(randomWord);
    }, 3500);

    return () => clearInterval(subliminalInterval);
  }, []);

  // 3. Floating watermark movement to defeat steady video capture / screenshots
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.floor(Math.random() * 70) + 10,
        y: Math.floor(Math.random() * 80) + 10
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save databases
  useEffect(() => {
    writeStorage('vanizan_wealth_goals', wealthGoals);
  }, [wealthGoals]);

  useEffect(() => {
    writeStorage('vanizan_gratitude_list', gratitudeList);
  }, [gratitudeList]);

  const currentAffirmation = useMemo(() => {
    return WEALTH_AFFIRMATIONS[currentAffIndex] ?? WEALTH_AFFIRMATIONS[0];
  }, [currentAffIndex]);

  const currentDailyStats = useMemo(() => {
    return dailyStats.date === todayKey()
      ? dailyStats
      : { date: todayKey(), sessions: 0, meditationSeconds: 0, repetitions: 0 };
  }, [dailyStats]);

  useEffect(() => {
    if (dailyStats.date !== todayKey()) {
      setDailyStats({ date: todayKey(), sessions: 0, meditationSeconds: 0, repetitions: 0 });
    }
  }, [dailyStats.date]);

  useEffect(() => writeStorage('vanizan_active_tab', activeTab), [activeTab]);
  useEffect(() => writeStorage('vanizan_last_affirmation_index', currentAffIndex), [currentAffIndex]);
  useEffect(() => writeStorage('vanizan_speech_rate', speechRate), [speechRate]);
  useEffect(() => writeStorage('vanizan_auto_next', autoNext), [autoNext]);
  useEffect(() => writeStorage('vanizan_show_subtitles', showSubtitles), [showSubtitles]);
  useEffect(() => writeStorage('vanizan_custom_affirmation', customAffirmationText), [customAffirmationText]);
  useEffect(() => writeStorage('vanizan_repeat_target', repeatTarget), [repeatTarget]);
  useEffect(() => writeStorage('vanizan_repeat_count', repeatCount), [repeatCount]);
  useEffect(() => writeStorage('vanizan_selected_frequency', activeFrequency), [activeFrequency]);
  useEffect(() => writeStorage('vanizan_frequency_volume', freqVolume), [freqVolume]);
  useEffect(() => writeStorage('vanizan_built_in_sound', activeBuiltInSound), [activeBuiltInSound]);
  useEffect(() => writeStorage('vanizan_builtin_volume', builtInVolume), [builtInVolume]);
  useEffect(() => writeStorage('vanizan_custom_audio_volume', customAudioVolume), [customAudioVolume]);
  useEffect(() => writeStorage('vanizan_custom_audio_speed', customAudioSpeed), [customAudioSpeed]);
  useEffect(() => writeStorage('vanizan_sleep_timer_minutes', sleepTimerMinutes), [sleepTimerMinutes]);
  useEffect(() => writeStorage('vanizan_subliminal_duration', subliminalDuration), [subliminalDuration]);
  useEffect(() => writeStorage('vanizan_subliminal_frequency', subliminalFrequency), [subliminalFrequency]);
  useEffect(() => writeStorage('vanizan_background_playback', backgroundPlayback), [backgroundPlayback]);
  useEffect(() => writeStorage('vanizan_breathing_speed', breathingSpeed), [breathingSpeed]);
  useEffect(() => writeStorage('vanizan_daily_stats', dailyStats), [dailyStats]);
  useEffect(() => writeStorage('vanizan_daily_reminder_enabled', dailyReminderEnabled), [dailyReminderEnabled]);
  useEffect(() => writeStorage('vanizan_daily_reminder_time', dailyReminderTime), [dailyReminderTime]);
  useEffect(() => writeStorage('vanizan_night_mode', nightMode), [nightMode]);

  // Toast notifier helper
  const triggerToast = useCallback((message: string, type: 'error' | 'warning' | 'success' = 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const updateDailyStats = useCallback((patch: Partial<Omit<DailyStats, 'date'>>) => {
    setDailyStats(prev => {
      const base = prev.date === todayKey() ? prev : { date: todayKey(), sessions: 0, meditationSeconds: 0, repetitions: 0 };
      return {
        ...base,
        sessions: base.sessions + (patch.sessions ?? 0),
        meditationSeconds: base.meditationSeconds + (patch.meditationSeconds ?? 0),
        repetitions: base.repetitions + (patch.repetitions ?? 0)
      };
    });
  }, []);

  // SUBLIMINAL PLAYER LOGIC
  const openSubliminalPlayer = useCallback((startIndex: number = 0) => {
    setSubliminalIndex(startIndex);
    setShowSubliminalPlayer(true);
    setIsSubliminalPlaying(true);
    updateDailyStats({ sessions: 1 });
  }, [updateDailyStats]);

  const closeSubliminalPlayer = useCallback(() => {
    setIsSubliminalPlaying(false);
    setShowSubliminalPlayer(false);
    if (subliminalIntervalRef.current) {
      clearInterval(subliminalIntervalRef.current);
      subliminalIntervalRef.current = null;
    }
  }, []);

  const toggleSubliminalPlay = useCallback(() => {
    setIsSubliminalPlaying(prev => !prev);
  }, []);

  // Subliminal auto-advance with Duration + Frequency logic
  useEffect(() => {
    if (!showSubliminalPlayer) return;
    if (isSubliminalPlaying) {
      const cycle = () => {
        setIsSubliminalVisible(true);
        subliminalTimeoutRef.current = setTimeout(() => {
          setIsSubliminalVisible(false);
          subliminalTimeoutRef.current = setTimeout(() => {
            setSubliminalIndex(prev => (prev + 1) % WEALTH_AFFIRMATIONS.length);
            updateDailyStats({ repetitions: 1 });
            cycle();
          }, subliminalFrequency);
        }, subliminalDuration);
      };
      cycle();
    } else {
      if (subliminalTimeoutRef.current) {
        clearTimeout(subliminalTimeoutRef.current);
        subliminalTimeoutRef.current = null;
      }
    }
    return () => {
      if (subliminalTimeoutRef.current) {
        clearTimeout(subliminalTimeoutRef.current);
        subliminalTimeoutRef.current = null;
      }
    };
  }, [isSubliminalPlaying, showSubliminalPlayer, subliminalDuration, subliminalFrequency, updateDailyStats]);

  // 4. Strong Content Copy & Right-Click Protections
  useEffect(() => {
    const preventSelection = (e: Event) => {
      e.preventDefault();
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityViolationsCount(prev => prev + 1);
      setSecurityModalMsg("کاربر گرامی، این نرم‌افزار به صورت اختصاصی و تحت لایسنس فوق‌امنیت برای سایت «گرداب موفقیت ونیزان» (vanizan.com) طراحی شده است. کپی‌برداری، تکثیر، راست‌کلیک و فیلم‌برداری از محتوای این نرم‌افزار شرعاً و قانوناً ممنوع بوده و تمامی حقوق مادی و معنوی آن محفوظ است.");
      setShowSecurityModal(true);
      triggerToast("خطای امنیتی: کپی کردن محتوا مسدود است!", "error");
    };

    const preventKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I, F12, Cmd+C, Cmd+Option+I, etc.
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      
      if (
        (isCmdOrCtrl && (key === 'c' || key === 'v' || key === 'u' || key === 'x' || key === 'a' || key === 's')) ||
        key === 'f12' ||
        (isCmdOrCtrl && e.shiftKey && key === 'i') ||
        (isCmdOrCtrl && e.shiftKey && key === 'c') ||
        (isCmdOrCtrl && e.shiftKey && key === 'j')
      ) {
        e.preventDefault();
        setSecurityViolationsCount(prev => prev + 1);
        triggerToast("هشدار امنیتی: کلیه کلیدهای میانبر کپی و توسعه‌دهنده مسدود شده‌اند!", "error");
        setSecurityModalMsg("اقدام غیرمجاز شناسایی شد! جهت محافظت از مالکیت معنوی سایت ونیزان (vanizan.com)، کپی کردن متون، باز کردن سورس برنامه یا ذخیره صفحه مسدود می‌باشد. بیایید ارتعاش صداقت و امانت‌داری را که اولین گام ثروتمند شدن است، حفظ کنیم.");
        setShowSecurityModal(true);
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
    };

    // Add event listeners to the entire document
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyDown);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventDrag);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyDown);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventDrag);
    };
  }, []);

  // 5. Speech Synthesis Engine (Persian Voice synthesis)
  const speakAffirmation = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      triggerToast("مرورگر شما از موتور صوتی پشتیبانی نمی‌کند. از فرکانس‌های مغزی استفاده کنید.", "warning");
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    // Clean up Persian characters for speech synthesis (sometimes works better)
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find Persian/Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const faVoice = voices.find(v => v.lang.includes('fa') || v.lang.includes('ar'));
    if (faVoice) {
      utterance.voice = faVoice;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setRepeatCount(prev => {
        const next = prev + 1;
        updateDailyStats({ repetitions: 1 });
        if (next >= repeatTarget) {
          setIsPlayingAff(false);
          triggerToast(`شمارنده ${repeatTarget} تکرار کامل شد.`, 'success');
          return next;
        }
        return next;
      });
      if (autoNext && isPlayingAffRef.current) {
        // Go to next affirmation after a small delay
        setTimeout(() => {
          if (isPlayingAffRef.current) {
            setCurrentAffIndex(prev => {
              const next = (prev + 1) % WEALTH_AFFIRMATIONS.length;
              speakAffirmation(WEALTH_AFFIRMATIONS[next].text);
              return next;
            });
          }
        }, 1500);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
    };

    window.speechSynthesis.speak(utterance);
  }, [autoNext, isPlayingAff, repeatTarget, speechRate, triggerToast, updateDailyStats]);

  const speakCustomAffirmation = useCallback(() => {
    if (!customAffirmationText.trim()) {
      triggerToast('لطفا ابتدا متن تأکید شخصی خود را وارد کنید.', 'warning');
      return;
    }
    speakAffirmation(customAffirmationText.trim());
    triggerToast('تأکید شخصی شما در حال خوانش است.', 'success');
  }, [customAffirmationText, speakAffirmation, triggerToast]);

  // Trigger speech when play state changes or active index changes
  useEffect(() => {
    isPlayingAffRef.current = isPlayingAff;
    if (isPlayingAff) {
      speakAffirmation(currentAffirmation.text);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentAffIndex, currentAffirmation.text, isPlayingAff, speechRate, speakAffirmation]);

  // 6. Web Audio API Frequency Generator (Oscillator)
  const toggleFrequency = (freq: number) => {
    if (activeFrequency === freq) {
      // Stop
      stopFrequency();
    } else {
      // Play new
      stopFrequency();
      startFrequency(freq);
    }
  };

  const startFrequency = useCallback((freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Set type: Sine wave for smooth meditation tones
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Master volume
      gain.gain.setValueAtTime(freqVolume, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setActiveFrequency(freq);
      triggerToast(`فرکانس ${freq} هرتز فعال شد. آماده دریافت ارتعاش ثروت باشید.`, "success");
    } catch (error) {
      console.error("Failed to start frequency oscillator", error);
      triggerToast("خطا در راه‌اندازی فرکانس صوتی. لطفا مجدداً تلاش کنید.", "error");
    }
  }, [freqVolume, triggerToast]);

  const stopFrequency = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    gainNodeRef.current = null;
    setActiveFrequency(null);
  }, []);

  const stopBuiltInSound = useCallback(() => {
    [builtInOscillatorRef.current, builtInLfoRef.current].forEach((node) => {
      if (node) {
        try {
          node.stop();
          node.disconnect();
        } catch {}
      }
    });
    if (builtInGainRef.current) {
      try {
        builtInGainRef.current.disconnect();
      } catch {}
    }
    builtInOscillatorRef.current = null;
    builtInLfoRef.current = null;
    builtInGainRef.current = null;
    setActiveBuiltInSound(null);
  }, []);

  const startBuiltInSound = useCallback((soundId: string) => {
    const sound = BUILT_IN_SOUNDS.find((item) => item.id === soundId);
    if (!sound) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      stopBuiltInSound();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = sound.type;
      osc.frequency.value = sound.frequency;
      gain.gain.setValueAtTime(builtInVolume, ctx.currentTime);

      if (sound.modulation) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = Math.max(sound.modulation / 40, 0.2);
        lfoGain.gain.value = Math.min(sound.modulation, 80);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        builtInLfoRef.current = lfo;
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      builtInOscillatorRef.current = osc;
      builtInGainRef.current = gain;
      setActiveBuiltInSound(soundId);
      triggerToast(`${sound.name} فعال شد.`, 'success');
    } catch (error) {
      console.error('Built-in sound error', error);
      triggerToast('خطا در اجرای موسیقی داخلی. لطفا صدای دستگاه و مجوز مرورگر را بررسی کنید.', 'error');
    }
  }, [builtInVolume, stopBuiltInSound, triggerToast]);

  const toggleBuiltInSound = useCallback((soundId: string) => {
    if (activeBuiltInSound === soundId) {
      stopBuiltInSound();
    } else {
      startBuiltInSound(soundId);
    }
  }, [activeBuiltInSound, startBuiltInSound, stopBuiltInSound]);

  // Update volume of oscillator in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(freqVolume, audioCtxRef.current.currentTime);
    }
  }, [freqVolume]);

  useEffect(() => {
    if (builtInGainRef.current && audioCtxRef.current) {
      builtInGainRef.current.gain.setValueAtTime(builtInVolume, audioCtxRef.current.currentTime);
    }
  }, [builtInVolume]);

  // Clean up oscillator on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {}
      }
      stopBuiltInSound();
    };
  }, [stopBuiltInSound]);

  // 7. Custom Music Upload Handlers
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxAudioSize = 25 * 1024 * 1024;
      const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm'];
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const hasValidType = file.type.startsWith('audio/') || allowedExtensions.includes(extension);

      if (!hasValidType) {
        triggerToast("فرمت فایل نامعتبر است! لطفا فقط یک فایل صوتی انتخاب کنید.", "error");
        return;
      }

      if (!allowedExtensions.includes(extension)) {
        triggerToast("پسوند فایل مجاز نیست. فقط mp3, wav, ogg, m4a, aac و webm پذیرفته می‌شود.", "error");
        return;
      }

      if (file.size > maxAudioSize) {
        triggerToast("حجم فایل بیش از حد مجاز است. حداکثر حجم فایل صوتی ۲۵ مگابایت است.", "error");
        return;
      }
      
      setCustomAudioFile(file);
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioPlaying(false);
      triggerToast(`موسیقی "${file.name}" با موفقیت بارگذاری شد.`, "success");
    }
  };

  const stopAllAudio = useCallback(() => {
    setIsPlayingAff(false);
    setCustomAudioPlaying(false);
    stopFrequency();
    stopBuiltInSound();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopBuiltInSound, stopFrequency]);

  // Custom audio playback controls
  useEffect(() => {
    if (customAudioRef.current) {
      if (customAudioPlaying) {
        customAudioRef.current.play().catch(err => {
          console.error("Playback error", err);
          triggerToast("خطا در پخش فایل صوتی! مجددا تلاش کنید.", "error");
          setCustomAudioPlaying(false);
        });
      } else {
        customAudioRef.current.pause();
      }
    }
  }, [customAudioPlaying, customAudioUrl]);

  useEffect(() => {
    if (customAudioRef.current) {
      customAudioRef.current.volume = customAudioVolume;
    }
  }, [customAudioVolume]);

  useEffect(() => {
    if (customAudioRef.current) {
      customAudioRef.current.playbackRate = customAudioSpeed;
    }
  }, [customAudioSpeed]);

  useEffect(() => {
    if (backgroundPlayback && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'باورهای ثروت ونیزان',
        artist: 'vanizan.com',
        album: 'گرداب موفقیت ونیزان'
      });
    }
  }, [backgroundPlayback]);

  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(0);
      return;
    }

    setSleepTimerRemaining(sleepTimerMinutes * 60);
    const timer = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev <= 1) {
          stopAllAudio();
          setSleepTimerMinutes(0);
          triggerToast('تایمر خواب پایان یافت و همه صداها متوقف شدند.', 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerMinutes, stopAllAudio, triggerToast]);

  useEffect(() => {
    if (!dailyReminderEnabled) return;

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    const checkReminder = setInterval(() => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      if (`${hh}:${mm}` === dailyReminderTime) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('یادآور روزانه ونیزان', {
            body: 'وقت تمرین باورهای ثروت و فعال‌سازی فرکانس فراوانی است.',
            icon: '/pwa-icon.svg'
          });
        }
        triggerToast('یادآور روزانه: وقت تمرین باورهای ثروت است.', 'success');
      }
    }, 60000);

    return () => clearInterval(checkReminder);
  }, [dailyReminderEnabled, dailyReminderTime, triggerToast]);

  // 8. Breathing Meditation Timer & Cycles
  useEffect(() => {
    let timerId: any;
    if (isBreathingActive) {
      updateDailyStats({ sessions: 1 });
      timerId = setInterval(() => {
        updateDailyStats({ meditationSeconds: 1 });
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // Transition phase
            setBreathingPhase(current => {
              if (current === 'دم (ورود ثروت)') {
                triggerToast("نفس خود را حبس کنید و تجسم کنید ثروت جذب سلول‌ها می‌شود...", "success");
                return 'حبس دم (جذب در سلول‌ها)';
              } else if (current === 'حبس دم (جذب در سلول‌ها)') {
                triggerToast("آرام بازدم کنید و تمام موانع ذهنی فقر را رها کنید...", "warning");
                return 'بازدم (رهاسازی فقر)';
              } else {
                triggerToast("دم عمیق بگیرید؛ ثروت کائنات را تنفس کنید...", "success");
                return 'دم (ورود ثروت)';
              }
            });
            return breathingSpeed;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingTimer(breathingSpeed);
    }

    return () => clearInterval(timerId);
  }, [isBreathingActive, breathingSpeed, triggerToast, updateDailyStats]);

  // 9. 68-Second Focus Timer Logic
  useEffect(() => {
    let timerId: any;
    if (isFocusActive && focusTimer > 0) {
      updateDailyStats({ sessions: 1 });
      timerId = setInterval(() => {
        updateDailyStats({ meditationSeconds: 1 });
        setFocusTimer(prev => {
          if (prev <= 1) {
            setIsFocusActive(false);
            setFocusFinished(true);
            triggerToast("تبریک! شما ۶۸ ثانیه روی ثروت متمرکز شدید. ارتعاش شما فعال شد!", "success");
            // Generate visual celebration sparkles
            const sparks = Array.from({ length: 15 }).map((_, idx) => ({
              id: idx,
              x: Math.random() * 80 + 10,
              y: Math.random() * 60 + 20
            }));
            setFocusSparkles(sparks);
            // Play a gentle notification beep
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(528, ctx.currentTime);
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 1.5);
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isFocusActive, focusTimer, triggerToast, updateDailyStats]);

  // 10. Daily Oracle Card Generator
  const drawDailyOracle = () => {
    const quotes = [
      {
        code: "کد ارتعاشی ۹۹۹*۸۸۸",
        quote: "امروز دریای بی‌کران برکت الهی به سوی حساب‌های بانکی من جاری می‌شود. من آماده دریافت عالی‌ترین فرصت‌ها هستم.",
        action: "تمرین امروز: به مدت ۵ دقیقه جمله «من خود ثروت هستم» را جلوی آینه با لبخند تکرار کنید."
      },
      {
        code: "کد ارتعاشی ۵۲۰*۷۴۱",
        quote: "پول‌های غیرمنتظره و فرصت‌های طلایی کسب درآمد در کوتاه‌مدت از منابع کاملاً پیش‌بینی‌نشده به سراغم می‌آیند.",
        action: "تمرین امروز: یک اسکناس یا تصویر پول را لمس کرده و صمیمانه بگویید «خدا شکرت بابت فراوانی»."
      },
      {
        code: "کد ارتعاشی ۳۱۸*۷۹۸",
        quote: "ذهن ناخودآگاه من قفل‌های فقر نسلی را شکسته است. من اولین میلیونر خودساخته و الگوی افتخار خانواده‌ام هستم.",
        action: "تمرین امروز: نوشتن ۳ مورد از نعماتی که همین امروز دارید در دفترچه ثروت اپلیکیشن."
      },
      {
        code: "کد ارتعاشی ۸۸۸*۵۲۸",
        quote: "ثروتمند شدن حق الهی و طبیعی من است. من با پذیرش این حق، به چرخه فقر پایان می‌دهم و وارد کهکشان رفاه می‌شوم.",
        action: "تمرین امروز: انجام تمرین تنفس خلسه جذب ثروت به مدت ۳ دقیقه در بخش مدیتیشن اپلیکیشن."
      }
    ];

    const randomIndex = Math.floor(Math.random() * quotes.length);
    setDailyOracle(quotes[randomIndex]);
    triggerToast("کد ارتعاشی روزانه شما فعال شد!", "success");
  };

  // Add wealth goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      setWealthGoals(prev => [newGoalText.trim(), ...prev]);
      setNewGoalText('');
      triggerToast("باور ثروت با موفقیت به بانک اهداف شما افزوده شد.", "success");
    }
  };

  // Delete wealth goal
  const handleDeleteGoal = (index: number) => {
    setWealthGoals(prev => prev.filter((_, i) => i !== index));
    triggerToast("باور ثروت حذف شد.", "warning");
  };

  // Add gratitude item
  const handleAddGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGratitudeText.trim()) {
      setGratitudeList(prev => [newGratitudeText.trim(), ...prev]);
      setNewGratitudeText('');
      triggerToast("سپاسگزاری صمیمانه شما در کائنات ثبت شد.", "success");
    }
  };

  // Delete gratitude item
  const handleDeleteGratitude = (index: number) => {
    setGratitudeList(prev => prev.filter((_, i) => i !== index));
    triggerToast("مورد سپاسگزاری حذف شد.", "warning");
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 no-select relative overflow-hidden transition-colors duration-700 ${nightMode ? 'bg-slate-950' : 'bg-emerald-100'}`}>

      {/* PWA Install Banner — appears when browser supports and allows install */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-700 border-b-2 border-amber-400 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
              <span className="text-slate-950 font-black text-sm">و</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-amber-200 leading-tight truncate">
                نصب اپلیکیشن باورهای ثروت ونیزان
              </p>
              <p className="text-[9px] text-emerald-200 leading-tight">
                تجربه کامل آفلاین و بدون اینترنت روی گوشی شما
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallPWA}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded-lg shadow transition-all flex items-center gap-1"
            >
              <span>نصب رایگان</span>
              <span>⬇</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="w-7 h-7 rounded-full bg-emerald-900/50 text-emerald-200 hover:bg-emerald-950 flex items-center justify-center text-xs transition-colors"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Security Moving Watermark - Moves every 5s to prevent clear screen recordings */}
      <div
        className="absolute pointer-events-none text-amber-500/10 font-black text-sm md:text-lg select-none whitespace-nowrap z-50 transition-all duration-[5000ms] ease-in-out"
        style={{ left: `${watermarkPos.x}%`, top: `${watermarkPos.y}%` }}
      >
        🔒 ونیزان انحصاری (vanizan.com)
      </div>

      {/* Global Background Particles (Floating Gold Dust) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {goldSparkleParticles.map(p => (
          <div 
            key={p.id} 
            className="particle-gold"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              bottom: '-10px'
            }}
          />
        ))}
      </div>

      {/* Subliminal Message Flasher Overlay — uses 7 Chakra colors */}
      <div className="absolute inset-0 z-40 subliminal-overlay flex items-center justify-center bg-transparent pointer-events-none">
        <span 
          className="text-3xl md:text-5xl font-black tracking-widest drop-shadow-[0_0_20px_currentColor] chakra-flash-text"
          style={{ 
            color: getChakraColor(subliminalWord),
            animationDuration: `${subliminalDuration}ms`
          }}
        >
          {subliminalWord}
        </span>
      </div>

      {/* Android Device Shell Container */}
      <div className="w-full max-w-[430px] h-full sm:h-[860px] bg-slate-900 border-0 sm:border-8 border-amber-600/60 rounded-none sm:rounded-[45px] android-phone-frame overflow-hidden relative flex flex-col z-10">
        
        {/* Android Top Camera Notch / Dynamic Island */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-800 rounded-full mr-4"></div>
          <div className="w-16 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {/* Android Status Bar */}
        <div className="h-11 bg-emerald-950 text-emerald-100 flex items-center justify-between px-6 pt-1 text-xs select-none z-40 border-b border-amber-600/10">
          <div className="flex items-center gap-2">
            <span>{currentTime}</span>
          </div>
          
          <div className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold flex items-center gap-1">
            <span className="animate-pulse">●</span>
            <span>نسخه VIP ونیزان</span>
          </div>

          <div className="flex items-center gap-1.5 font-sans">
            <span className="text-[10px] text-emerald-400 font-bold">5G</span>
            <span>📶</span>
            <span>🔋 {batteryLevel}%</span>
          </div>
        </div>

        {/* Exclusive Brand Header (سایت گرداب موفقیت ونیزان) */}
        <header className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-emerald-950 p-3 flex items-center justify-between border-b border-amber-500/20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-slate-950 font-black text-sm">و</span>
            </div>
            <div>
              <h1 className="text-xs font-black text-amber-300">گرداب موفقیت ونیزان</h1>
              <p className="text-[9px] text-emerald-300">vanizan.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
            <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-300 font-medium">امنیت کپی غیرفعال</span>
          </div>
        </header>

        {/* Main Application Screens Wrapper */}
        <main className="flex-1 overflow-y-auto relative p-4 pb-20 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-right">
          
          {/* Diagnostic Grid Watermark overlay inside the scroll container */}
          <div className="watermark-grid grid">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="watermark-item">vanizan.com</div>
            ))}
          </div>

          {/* 1. SCREEN: HOME (داشبورد باورها و تمرینات روزانه) */}
          {activeTab === 'home' && (
            <div className="space-y-5 animate-fade-in relative z-20">
              
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-900/80 to-slate-950 border border-amber-500/30 shadow-xl">
                <div className="absolute -left-8 -top-8 w-24 h-24 bg-amber-500/20 rounded-full blur-xl"></div>
                <h2 className="text-base font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                  برنامه‌ریزی فوری باورهای ثروت
                </h2>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  به اپلیکیشن اختصاصی <span className="text-amber-300 font-bold">گرداب موفقیت ونیزان</span> خوش آمدید. با تکرار مداوم این ۵ باور طلایی در زمان‌های خلسه و قبل از خواب، ذهن نیمه‌هوشیار خود را به مغناطیس شدید ثروت در کوتاه‌مدت تبدیل کنید.
                </p>
                
                <div className="mt-3 flex gap-2">
                  <a 
                    href="https://vanizan.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow"
                  >
                    <span>مشاهده سایت ونیزان</span>
                    <span>🌐</span>
                  </a>
                  <button 
                    onClick={() => openSubliminalPlayer(0)}
                    className="text-[10px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>شروع پخش ناخودآگاه</span>
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Real Estate Advisor Mindset — 5 Categories of Powerful Beliefs */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>🏆</span>
                  ذهنیت مشاور املاک سطح بالا
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  این باورها شما را از حالت «دنبال معامله گشتن» به حالت «جذب فرصت و خلق ارزش» منتقل می‌کنند. هر دسته را انتخاب کنید تا باورهای آن در پلیر صوتی پخش شوند.
                </p>

                {/* Category Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  {AFFIRMATION_CATEGORIES.map((cat) => {
                    const catAffs = WEALTH_AFFIRMATIONS.filter(a => a.category === cat.id);
                    return (
                      <div 
                        key={cat.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all"
                      >
                        {/* Gradient header */}
                        <div className={`bg-gradient-to-l ${cat.color} p-3 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <h4 className="text-xs font-black text-white">{cat.name}</h4>
                              <p className="text-[9px] text-white/80">{cat.description}</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-black/30 text-white px-2 py-0.5 rounded-full font-bold">
                            {catAffs.length} باور
                          </span>
                        </div>

                        {/* Beliefs list */}
                        <div className="bg-slate-950/90 p-2 space-y-1.5">
                          {catAffs.map((aff) => (
                            <button
                              key={aff.id}
                              onClick={() => {
                                const idx = WEALTH_AFFIRMATIONS.findIndex(a => a.id === aff.id);
                                setCurrentAffIndex(idx);
                                openSubliminalPlayer(idx);
                              }}
                              className="w-full text-right p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all group/btn flex items-start gap-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover/btn:bg-amber-500/20 transition-all">
                                <Play className="w-3 h-3 text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-amber-200 leading-relaxed">{aff.text}</p>
                                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{aff.focusArea}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Wealth Oracle Card */}
              <div className="bg-gradient-to-tr from-purple-950/90 via-slate-950 to-emerald-950/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>
                
                <h3 className="text-xs font-black text-purple-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
                  کد ارتعاشی و الهام روزانه ثروت
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  هر روز یکبار روی دکمه زیر ضربه بزنید تا کد جذب فرکانسی و تمرین ارتعاشی اختصاصی همان روز برایتان فعال شود.
                </p>

                {dailyOracle ? (
                  <div className="mt-3 p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 animate-fade-in text-center space-y-2">
                    <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block font-mono">
                      {dailyOracle.code}
                    </span>
                    <p className="text-xs text-purple-200 font-bold leading-relaxed">
                      « {dailyOracle.quote} »
                    </p>
                    <div className="text-[10px] text-emerald-300 bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/20">
                      <strong>دستورالعمل:</strong> {dailyOracle.action}
                    </div>
                    <button 
                      onClick={drawDailyOracle}
                      className="text-[9px] text-slate-400 hover:text-white underline block mx-auto pt-1"
                    >
                      دریافت مجدد کد
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={drawDailyOracle}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-purple-700 to-emerald-700 hover:from-purple-600 hover:to-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>فعال‌سازی کد جذب روزانه</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 68-Second Focus Technique (قانون ۶۸ ثانیه تجسم) */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 shadow-xl relative overflow-hidden">
                <h3 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  تمرکز خلاق ۶۸ ثانیه‌ای ابراهام هیکس
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  طبق قوانین فرکانس، اگر بتوانید یک فکر ثروت‌ساز را بدون مزاحمت افکار منفی به مدت ۶۸ ثانیه نگه دارید، چرخه جذب فیزیکی آن در جهان آغاز می‌شود.
                </p>

                {/* 68s Timer UI */}
                <div className="mt-4 flex flex-col items-center justify-center p-3 bg-slate-950/80 rounded-xl border border-amber-500/10 relative">
                  
                  {/* Celebration sparkles overlay */}
                  {focusFinished && focusSparkles.map(s => (
                    <div 
                      key={s.id} 
                      className="absolute text-amber-400 text-xs animate-bounce pointer-events-none"
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    >
                      ✨💰
                    </div>
                  ))}

                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="rgba(16, 185, 129, 0.1)" 
                        strokeWidth="6" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="#fbbf24" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (focusTimer / 68)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-amber-300 font-mono">{focusTimer}</span>
                      <span className="text-[8px] text-slate-400">ثانیه مانده</span>
                    </div>
                  </div>

                  {focusFinished ? (
                    <div className="text-center mt-3 space-y-1">
                      <p className="text-xs font-bold text-emerald-400">✨ ارتعاش ثروت شما آزاد شد! ✨</p>
                      <p className="text-[10px] text-slate-400">یک ارتعاش خالص و عمیق به کائنات ارسال گردید.</p>
                      <button
                        onClick={() => {
                          setFocusTimer(68);
                          setFocusFinished(false);
                          setIsFocusActive(false);
                        }}
                        className="mt-2 text-[10px] bg-amber-500 text-slate-900 px-3 py-1 rounded-lg font-bold hover:bg-amber-400"
                      >
                        تکرار مجدد تمرین
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2 w-full">
                      <button
                        onClick={() => setIsFocusActive(!isFocusActive)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          isFocusActive 
                            ? 'bg-red-900/80 text-red-200 hover:bg-red-950' 
                            : 'bg-emerald-700 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {isFocusActive ? 'توقف موقت' : 'شروع تجسم ۶۸ ثانیه'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsFocusActive(false);
                          setFocusTimer(68);
                          setFocusFinished(false);
                        }}
                        className="px-3 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isFocusActive && (
                    <p className="text-[9px] text-amber-300 mt-2 animate-pulse text-center">
                      باور فعال: « {WEALTH_AFFIRMATIONS[currentAffIndex].text} » را در ذهن خود تجسم کنید.
                    </p>
                  )}
                </div>
              </div>

              {/* VIP Security Stamp */}
              <div className="p-3 bg-emerald-950/40 border border-amber-600/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-300">گواهی امنیت و مالکیت معنوی</h4>
                    <p className="text-[9px] text-slate-400">کپی، تکثیر و اسکرین‌شات از این صفحه مسدود است.</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono block">
                    LICENSE-VNZ-2026
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* 2. SCREEN: PLAYER (پلیر پیشرفته باورها - صوتی و متنی) */}
          {activeTab === 'player' && (
            <div className="space-y-4 animate-fade-in relative z-20">
              
              <div className="text-center">
                <span className="text-[10px] bg-emerald-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                  🎧 پلیر ذهنیت مشاور املاک سطح بالا
                </span>
                <h2 className="text-base font-black text-white mt-1.5">موتور صوتی هوشمند باورها</h2>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {AFFIRMATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const firstIdx = WEALTH_AFFIRMATIONS.findIndex(a => a.category === cat.id);
                      if (firstIdx >= 0) setCurrentAffIndex(firstIdx);
                    }}
                    className="shrink-0 text-[9px] px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:border-amber-500/40 hover:text-amber-300 transition-all flex items-center gap-1"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Main Affirmation Card Panel */}
              <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${currentAffirmation.visualGradient} border-2 border-amber-400/40 shadow-2xl transition-all duration-700 min-h-[260px] flex flex-col justify-between text-center`}>
                
                {/* Micro Watermarks in background of the card */}
                <div className="absolute inset-0 opacity-5 flex flex-col justify-around pointer-events-none text-xs text-white font-bold select-none overflow-hidden">
                  <div>vanizan.com</div>
                  <div>گرداب موفقیت ونیزان</div>
                  <div>vanizan.com</div>
                </div>

                <div className="flex justify-between items-center z-10">
                  <span className="text-[10px] bg-slate-950/60 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                    {AFFIRMATION_CATEGORIES.find(c => c.id === currentAffirmation.category)?.icon} باور {currentAffIndex + 1} از {WEALTH_AFFIRMATIONS.length}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] bg-slate-950/60 text-slate-300 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>کپی‌رایت محفوظ</span>
                  </div>
                </div>

                {/* Subtitle / Calligraphy representation — colored by 7 Chakras */}
                <div className="my-6 z-10 space-y-3">
                  <h3 
                    className="text-3xl font-black tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] filter leading-relaxed"
                    style={{ 
                      color: getChakraColorForCategory(currentAffirmation.category),
                      textShadow: `0 0 30px ${getChakraColorForCategory(currentAffirmation.category)}80, 0 0 60px ${getChakraColorForCategory(currentAffirmation.category)}40`
                    }}
                  >
                    « {currentAffirmation.text} »
                  </h3>
                  
                  {showSubtitles && (
                    <p className="text-xs font-sans italic opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ color: getChakraColorForCategory(currentAffirmation.category) }}>
                      {currentAffirmation.englishTranslation}
                    </p>
                  )}
                </div>

                <div className="z-10 bg-slate-950/80 p-3.5 rounded-xl border border-white/10 text-right">
                  <span className="text-[9px] text-amber-400 font-bold block mb-1">تمرکز فرکانسی: {WEALTH_AFFIRMATIONS[currentAffIndex].focusArea}</span>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {WEALTH_AFFIRMATIONS[currentAffIndex].description}
                  </p>
                </div>

                {/* Sparkling gold particles inside card */}
                <div className="absolute top-4 left-6 text-amber-300 text-lg animate-pulse">✨</div>
                <div className="absolute bottom-16 right-4 text-yellow-300 text-sm animate-bounce">💰</div>
              </div>

              {/* Navigation Indicators */}
              <div className="flex justify-between items-center px-2">
                <button 
                  onClick={() => {
                    const prev = (currentAffIndex - 1 + WEALTH_AFFIRMATIONS.length) % WEALTH_AFFIRMATIONS.length;
                    setCurrentAffIndex(prev);
                  }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-emerald-500/20 flex items-center justify-center hover:border-amber-500/40 text-slate-300"
                >
                  ◀
                </button>

                <div className="flex gap-1.5">
                  {WEALTH_AFFIRMATIONS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAffIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentAffIndex ? 'bg-amber-400 scale-125' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const next = (currentAffIndex + 1) % WEALTH_AFFIRMATIONS.length;
                    setCurrentAffIndex(next);
                  }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-emerald-500/20 flex items-center justify-center hover:border-amber-500/40 text-slate-300"
                >
                  ▶
                </button>
              </div>

              {/* Smart Speech Synthesis Controller */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    موتور خوانش صوتی فارسی هوشمند
                  </h3>
                  
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoNext} 
                      onChange={(e) => setAutoNext(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span className="text-[10px] text-slate-400">پخش اتوماتیک بعدی</span>
                  </label>
                </div>

                {/* Sound wave visualizer simulation */}
                {isPlayingAff && (
                  <div className="h-6 flex items-center justify-center gap-1 bg-emerald-950/40 rounded-lg border border-emerald-500/10 overflow-hidden">
                    <div className="w-1.5 bg-amber-400 rounded-full animate-bounce h-3"></div>
                    <div className="w-1.5 bg-amber-300 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 bg-yellow-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1.5 bg-amber-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.45s' }}></div>
                    <div className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.6s' }}></div>
                    <div className="w-1.5 bg-amber-300 rounded-full animate-bounce h-3" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 bg-yellow-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.35s' }}></div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAff(!isPlayingAff)}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isPlayingAff 
                        ? 'bg-red-700 hover:bg-red-800 text-white' 
                        : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {isPlayingAff ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>توقف خوانش صوتی</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>شروع خوانش صوتی فارسی</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Advanced Subliminal Settings — Duration + Frequency */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-300">⚡</span>
                    <span className="text-[10px] text-amber-300 font-bold">تنظیمات پیشرفته ناخودآگاه</span>
                  </div>

                  {/* Duration slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Duration (مدت نمایش هر باور):</span>
                      <span className="font-mono text-amber-300 font-bold">{subliminalDuration}ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="2000" 
                      step="1"
                      value={subliminalDuration}
                      onChange={(e) => setSubliminalDuration(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Frequency slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Frequency (فاصله بین باورها):</span>
                      <span className="font-mono text-amber-300 font-bold">{subliminalFrequency}ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5000" 
                      step="1"
                      value={subliminalFrequency}
                      onChange={(e) => setSubliminalFrequency(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'فلش', d: 1, f: 50 },
                      { label: 'سریع', d: 50, f: 150 },
                      { label: 'ناخودآگاه', d: 150, f: 500 },
                      { label: 'آرام', d: 500, f: 1500 },
                      { label: 'خلسه', d: 1000, f: 3000 },
                      { label: 'تمرکز', d: 2000, f: 5000 },
                      { label: 'خواب', d: 150, f: 2000 },
                      { label: 'مطالعه', d: 500, f: 500 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setSubliminalDuration(preset.d);
                          setSubliminalFrequency(preset.f);
                        }}
                        className={`text-[8px] py-1 rounded-lg font-bold transition-all ${
                          subliminalDuration === preset.d && subliminalFrequency === preset.f
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    💡 Duration = مدتی که هر باور دیده می‌شود. Frequency = فاصله خاموشی تا باور بعدی. برای پخش کاملاً ناخودآگاه Duration را روی ۱ms و Frequency را روی ۵۰ms تنظیم کنید.
                  </p>
                </div>

                {/* Speech rate slider (TTS voice speed) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>سرعت خوانش صوتی TTS:</span>
                    <span className="font-mono text-amber-300 font-bold">{speechRate}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Professional repetition and custom affirmation controls */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span>شمارنده تکرار تأکیدات:</span>
                    <div className="flex items-center gap-1.5">
                      {[108, 333, 1000].map((target) => (
                        <button
                          key={target}
                          onClick={() => {
                            setRepeatTarget(target);
                            setRepeatCount(0);
                          }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold ${repeatTarget === target ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                        >
                          {target}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all" style={{ width: `${Math.min((repeatCount / repeatTarget) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>{repeatCount} تکرار انجام شد</span>
                    <button onClick={() => setRepeatCount(0)} className="text-amber-300 underline">ریست شمارنده</button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[10px] text-slate-400 block">ساخت تأکید شخصی کاربر:</label>
                  <textarea
                    value={customAffirmationText}
                    onChange={(e) => setCustomAffirmationText(e.target.value.slice(0, 220))}
                    className="w-full min-h-16 bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-right focus:outline-none focus:border-amber-500 text-slate-200 resize-none"
                    placeholder="متن تأکید اختصاصی خود را بنویسید..."
                  />
                  <button
                    onClick={speakCustomAffirmation}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    خوانش تأکید شخصی با موتور فارسی
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>نمایش معادل انگلیسی باور:</span>
                  <button 
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`px-2 py-0.5 rounded text-[9px] ${
                      showSubtitles ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {showSubtitles ? 'فعال' : 'غیرفعال'}
                  </button>
                </div>
              </div>

              {/* 3. UPLOAD CUSTOM MEDITATION MUSIC (افزودن موسیقی دلخواه واقعی) */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3 relative">
                <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-xs">
                  🎵
                </div>
                
                <div className="pr-10">
                  <h3 className="text-xs font-bold text-slate-300">افزودن موسیقی دلخواه و واقعی</h3>
                  <p className="text-[10px] text-slate-400">فایل موسیقی مدیتیشن یا صدای باران دلخواه خود را بارگذاری کنید تا در پس‌زمینه پخش شود.</p>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  
                  {/* File selector input */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-900 hover:border-amber-500/40 transition-all">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-5 h-5 text-slate-500 mb-1" />
                        <p className="text-[10px] text-slate-400">
                          {customAudioFile ? (
                            <span className="text-amber-300 font-bold">✓ تغییر فایل: {customAudioFile.name.slice(0, 20)}...</span>
                          ) : (
                            <span>انتخاب فایل صوتی مدیتیشن از گوشی/کامپیوتر</span>
                          )}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleCustomAudioUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Hidden Audio element */}
                  {customAudioUrl && (
                    <audio 
                      ref={customAudioRef} 
                      src={customAudioUrl} 
                      loop 
                    />
                  )}

                  {/* Custom Player controls */}
                  {customAudioUrl && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <div className="flex items-center justify-between">
                        
                        {/* Rotating Vinyl Record Simulation */}
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center ${customAudioPlaying ? 'spin-active' : ''}`}>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-300 font-bold truncate max-w-[150px]">
                              {customAudioFile?.name || 'موسیقی دلخواه'}
                            </p>
                            <span className="text-[8px] text-emerald-400">در حال پخش مستمر</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setCustomAudioPlaying(!customAudioPlaying)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            customAudioPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-800 text-white'
                          }`}
                        >
                          {customAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>
                      </div>

                      {/* Music speed and volume controls */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                        
                        {/* Custom Volume */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>ولوم موسیقی:</span>
                            <span className="font-mono text-amber-300">{Math.round(customAudioVolume * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={customAudioVolume}
                            onChange={(e) => setCustomAudioVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                        </div>

                        {/* Custom Play Speed */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>سرعت پخش موسیقی:</span>
                            <span className="font-mono text-amber-300">{customAudioSpeed}x</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2.0" 
                            step="0.1"
                            value={customAudioSpeed}
                            onChange={(e) => setCustomAudioSpeed(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                        </div>

                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                    <label className="flex items-center justify-between gap-2 bg-slate-900/80 rounded-xl px-3 py-2 border border-slate-800 cursor-pointer">
                      <span className="text-[9px] text-slate-300">پخش در پس‌زمینه</span>
                      <input type="checkbox" checked={backgroundPlayback} onChange={(e) => setBackgroundPlayback(e.target.checked)} className="accent-amber-400" />
                    </label>
                    <select
                      value={sleepTimerMinutes}
                      onChange={(e) => setSleepTimerMinutes(parseInt(e.target.value))}
                      className="bg-slate-900 text-[10px] text-amber-300 rounded-xl px-2 py-2 border border-slate-800 focus:outline-none"
                    >
                      <option value="0">تایمر خواب خاموش</option>
                      <option value="15">خواب ۱۵ دقیقه</option>
                      <option value="30">خواب ۳۰ دقیقه</option>
                      <option value="60">خواب ۶۰ دقیقه</option>
                    </select>
                  </div>
                  {sleepTimerRemaining > 0 && (
                    <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-center font-mono">
                      تایمر خواب: {Math.floor(sleepTimerRemaining / 60)}:{(sleepTimerRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* 3. SCREEN: MEDITATION (تمرین خلسه، فرکانس‌های مغزی و تنفس) */}
          {activeTab === 'meditation' && (
            <div className="space-y-4 animate-fade-in relative z-20">
              
              <div className="text-center">
                <span className="text-[10px] bg-emerald-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                  🧘 خلسه جذب ثروت و ارتعاش ذهن
                </span>
                <h2 className="text-base font-black text-white mt-1.5">فرکانس‌های مغزی و تنفس کائنات</h2>
              </div>

              {/* Subconscious Reprogramming breathing guide */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-4 text-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-300">تمرین تنفس مربعیِ مغناطیس پول</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    با هماهنگی این دایره تنفس کنید. در مرحله دم، تصور کنید اتم‌های طلا وارد شش‌هایتان می‌شوند. در مرحله حبس، ثروت را در سلول‌هایتان هضم کنید و در بازدم، فقر و کمبود را بیرون بریزید.
                  </p>
                </div>

                {/* Breathing visualizer */}
                <div className="py-6 flex flex-col items-center justify-center relative">
                  
                  {/* Glowing breathing circle */}
                  <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-3 text-white font-bold text-xs shadow-2xl transition-all duration-1000 ${
                    isBreathingActive ? 'breathing-circle' : 'bg-emerald-950/40 border-2 border-emerald-500/20'
                  }`}>
                    <span className="text-amber-300 font-black text-sm">{breathingPhase}</span>
                    <span className="text-[18px] font-mono mt-1 text-white">{breathingTimer} ثانیه</span>
                  </div>

                  <div className="mt-6 flex gap-2 w-full max-w-[280px]">
                    <button
                      onClick={() => setIsBreathingActive(!isBreathingActive)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                        isBreathingActive 
                          ? 'bg-amber-600 text-slate-950 hover:bg-amber-500' 
                          : 'bg-emerald-700 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {isBreathingActive ? 'توقف تمرین تنفس' : 'شروع تمرین تنفس'}
                    </button>

                    <div className="flex items-center bg-slate-950/80 rounded-xl px-2 border border-slate-800">
                      <span className="text-[9px] text-slate-500 ml-1">سرعت:</span>
                      <select 
                        value={breathingSpeed} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setBreathingSpeed(val);
                          setBreathingTimer(val);
                        }}
                        className="bg-transparent text-amber-300 text-xs font-bold border-none focus:outline-none cursor-pointer"
                      >
                        <option value="3" className="bg-slate-900">سریع (۳ث)</option>
                        <option value="4" className="bg-slate-900">معمولی (۴ث)</option>
                        <option value="6" className="bg-slate-900">عمیق (۶ث)</option>
                        <option value="8" className="bg-slate-900">پیشرفته (۸ث)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/10 text-right">
                  <span className="text-[10px] text-amber-300 font-bold block mb-0.5">💡 راهنمای ذهنی:</span>
                  <p className="text-[9px] text-slate-300 leading-relaxed">
                    بهترین زمان برای انجام این تمرین، صبح‌ها بلافاصله بعد از بیداری یا شب‌ها قبل از خواب است. ۵ دقیقه تمرین تنفس به همراه شنیدن فرکانس ۸۸۸ هرتز، سرعت جذب شما را تا ۱۰ برابر افزایش می‌دهد.
                  </p>
                </div>
              </div>

              {/* REAL Web Audio Frequency Synthesizer Section */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300">سنتزکننده واقعی فرکانس‌های جذب</h3>
                    <p className="text-[10px] text-slate-400">تولید امواج صوتی بیو-ارتعاشی خالص با کارت صدای گوشی شما</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                </div>

                {/* Frequency selector buttons */}
                <div className="grid grid-cols-1 gap-2.5">
                  {BRAINWAVE_FREQUENCIES.map((freqObj) => (
                    <div 
                      key={freqObj.freq}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        activeFrequency === freqObj.freq 
                          ? 'bg-slate-950 border-amber-400 shadow-lg shadow-amber-500/10' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      onClick={() => toggleFrequency(freqObj.freq)}
                    >
                      <div className="pr-2 flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                          <span className="text-[11px] font-black text-slate-200">{freqObj.name}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">{freqObj.description}</p>
                      </div>

                      <button
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          activeFrequency === freqObj.freq 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-emerald-950 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {activeFrequency === freqObj.freq ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Frequency Volume Slider */}
                {activeFrequency !== null && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>تنظیم صدای فرکانس ارتعاشی:</span>
                      <span className="font-mono text-amber-300 font-bold">{Math.round(freqVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={freqVolume}
                      onChange={(e) => setFreqVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300">موسیقی‌های داخلی نسخه حرفه‌ای</h3>
                    <p className="text-[10px] text-slate-400 mt-1">بدون نیاز به اینترنت یا فایل خارجی، امواج آرامش‌بخش داخلی تولید می‌شوند.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {BUILT_IN_SOUNDS.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => toggleBuiltInSound(sound.id)}
                        className={`p-3 rounded-xl border text-right flex items-center justify-between gap-3 transition-all ${activeBuiltInSound === sound.id ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40'}`}
                      >
                        <span>
                          <span className="text-[11px] text-slate-200 font-bold block">{sound.name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{sound.subtitle}</span>
                        </span>
                        {activeBuiltInSound === sound.id ? <Pause className="w-4 h-4 text-amber-300" /> : <Play className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>ولوم موسیقی داخلی:</span>
                      <span className="font-mono text-amber-300">{Math.round(builtInVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.02"
                      value={builtInVolume}
                      onChange={(e) => setBuiltInVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 4. SCREEN: JOURNAL (دفترچه ثروت و کائنات ونیزان) */}
          {activeTab === 'journal' && (
            <div className="space-y-4 animate-fade-in relative z-20">
              
              <div className="text-center">
                <span className="text-[10px] bg-emerald-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                  📓 دفترچه باورها و تابلوی کائنات
                </span>
                <h2 className="text-base font-black text-white mt-1.5">دفترچه اهداف و شکرگزاری شخصی</h2>
              </div>

              {/* Secure content protection notice */}
              <div className="p-2.5 bg-red-950/30 border border-red-500/20 rounded-xl flex items-start gap-2 text-right">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  <strong>سیستم محافظت از ایده:</strong> متون وارد شده در این دفترچه به صورت کاملاً رمزشده در حافظه مرورگر شما ذخیره شده و به دلیل مسائل کپی‌رایت سایت ونیزان، غیرقابل کپی‌برداری به کلیپ‌بورد یا خروج از این برنامه است تا ایده مالی شما دزدیده نشود!
                </p>
              </div>

              {/* 1. WEALTH GOALS DATABASE */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🎯</span>
                  اهداف مالی و تعهدهای ثروت در کوتاه‌مدت
                </h3>

                <form onSubmit={handleAddGoal} className="flex gap-2">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder="مثال: من تا تاریخ ۳۰ مهر به درآمد ۵۰ میلیونی می‌رسم..."
                    className="flex-1 bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-right focus:outline-none focus:border-amber-500 text-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                  >
                    ثبت باور
                  </button>
                </form>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {wealthGoals.map((goal, index) => (
                    <div 
                      key={index}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-900 flex items-start justify-between gap-3 text-right"
                    >
                      <div className="flex-1 pr-1.5 relative">
                        <span className="absolute right-0 top-1 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <p className="text-[11px] text-slate-200 leading-relaxed mr-3 pr-0.5 select-none">{goal}</p>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteGoal(index)}
                        className="text-[9px] text-red-400 hover:text-red-300 underline shrink-0 pt-0.5"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  
                  {wealthGoals.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-2">هنوز هدفی وارد نکرده‌اید.</p>
                  )}
                </div>
              </div>

              {/* 2. GRATITUDE JOURNAL DATABASE */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>🙏</span>
                  لیست سپاسگزاری روزانه (ارتعاش بالای جذب)
                </h3>

                <form onSubmit={handleAddGratitude} className="flex gap-2">
                  <input
                    type="text"
                    value={newGratitudeText}
                    onChange={(e) => setNewGratitudeText(e.target.value)}
                    placeholder="مثال: خدایا شکرت بابت پول نقدی که امروز به دستم رسید..."
                    className="flex-1 bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-right focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    ثبت شکر
                  </button>
                </form>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {gratitudeList.map((item, index) => (
                    <div 
                      key={index}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-900 flex items-start justify-between gap-3 text-right"
                    >
                      <div className="flex-1 pr-1.5 relative">
                        <span className="absolute right-0 top-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[11px] text-slate-200 leading-relaxed mr-3 pr-0.5 select-none">{item}</p>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteGratitude(index)}
                        className="text-[9px] text-red-400 hover:text-red-300 underline shrink-0 pt-0.5"
                      >
                        حذف
                      </button>
                    </div>
                  ))}

                  {gratitudeList.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-2">هنوز سپاسگزاری وارد نکرده‌اید.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 5. SCREEN: SECURITY & LICENSING (تنظیمات امنیتی و اطلاعات سایت ونیزان) */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in relative z-20">
              
              <div className="text-center">
                <span className="text-[10px] bg-emerald-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                  🛡️ سیستم امنیتی و لایسنس ونیزان
                </span>
                <h2 className="text-base font-black text-white mt-1.5">امنیت مالکیت معنوی و تنظیمات</h2>
              </div>

              {/* Exclusive Website Verification Card */}
              <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-2xl p-5 border-2 border-amber-500/30 text-center space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl"></div>
                
                <Lock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                
                <div>
                  <h3 className="text-sm font-black text-amber-300">نسخه انحصاری و غیرقابل کپی</h3>
                  <p className="text-[11px] text-slate-300 mt-1">
                    طراحی شده مخصوص پلتفرم بزرگ «گرداب موفقیت ونیزان»
                  </p>
                  <a 
                    href="https://vanizan.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-amber-400 underline font-bold mt-1 block font-mono"
                  >
                    vanizan.com
                  </a>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-right space-y-2 text-[10px]">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-400">وضعیت لایسنس نرم‌افزار:</span>
                    <span className="text-emerald-400 font-bold">فعال و تایید شده (VIP)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-400">سیستم حفاظتی کپی‌رایت:</span>
                    <span className="text-amber-400 font-bold">فعال (کنترل پورت و رویداد)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-400">شناسه امنیتی کاربر:</span>
                    <span className="text-slate-300 font-mono">VN-98912-SEC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">تعداد تلاش غیرمجاز کپی:</span>
                    <span className="text-red-400 font-bold font-mono">{securityViolationsCount} مرتبه</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h3 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <span>📊</span>
                  آمار روزانه و تنظیمات حرفه‌ای
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2">
                    <span className="text-lg font-mono text-amber-300 block">{currentDailyStats.sessions}</span>
                    <span className="text-[9px] text-slate-400">جلسه</span>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2">
                    <span className="text-lg font-mono text-emerald-300 block">{Math.floor(currentDailyStats.meditationSeconds / 60)}</span>
                    <span className="text-[9px] text-slate-400">دقیقه مراقبه</span>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2">
                    <span className="text-lg font-mono text-purple-300 block">{currentDailyStats.repetitions}</span>
                    <span className="text-[9px] text-slate-400">تکرار</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[10px]">
                  <label className="flex items-center justify-between bg-slate-950/70 rounded-xl p-3 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">حالت شب حرفه‌ای</span>
                    <input type="checkbox" checked={nightMode} onChange={(e) => setNightMode(e.target.checked)} className="accent-amber-400" />
                  </label>
                  <label className="flex items-center justify-between bg-slate-950/70 rounded-xl p-3 border border-slate-800 cursor-pointer">
                    <span className="text-slate-300">اعلان روزانه تمرین</span>
                    <input type="checkbox" checked={dailyReminderEnabled} onChange={(e) => setDailyReminderEnabled(e.target.checked)} className="accent-amber-400" />
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-xl p-3 border border-slate-800">
                    <span className="text-slate-300">ساعت یادآور</span>
                    <input
                      type="time"
                      value={dailyReminderTime}
                      onChange={(e) => setDailyReminderTime(e.target.value)}
                      className="bg-slate-900 text-amber-300 rounded-lg px-2 py-1 border border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Android Export & Publishing Guide (Special for Vanizan Admin) */}
              <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 rounded-2xl p-4 border-2 border-amber-500/30 space-y-3">
                <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>🚀</span>
                  راهنمای ساخت APK اندروید و انتشار در مارکت‌ها
                </h3>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  اپلیکیشن ونیزان با قدرتمندترین فناوری روز (Capacitor + Android Native WebView) آماده تبدیل به فایل نصبی اندروید است. فقط با چند دستور ساده، APK حرفه‌ای بسازید:
                </p>

                <div className="space-y-2.5 text-right text-[10px]">
                  
                  {/* Step 1: Automated Scripts */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🤖</span>
                      روش فوق سریع: اسکریپت خودکار (یک کلیک)
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-[9px]">
                      فایل‌های آماده اجرا برای ویندوز و لینوکس/مک ایجاد شده‌اند. فقط کافی است دوبار کلیک کنید:
                    </p>
                    <pre className="bg-slate-950 p-2 rounded text-[8px] font-mono text-emerald-400 text-left ltr overflow-x-auto whitespace-pre">
{`# ویندوز:
build-android.bat

# لینوکس یا مک:
chmod +x build-android.sh
./build-android.sh`}
                    </pre>
                  </div>

                  {/* Step 2: Capacitor Manual */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🔧</span>
                      روش دستی Capacitor (مرحله به مرحله)
                    </h4>
                    <pre className="bg-slate-950 p-2 rounded text-[8px] font-mono text-emerald-400 text-left ltr overflow-x-auto whitespace-pre">
{`# ۱. نصب وابستگی‌ها
npm install

# ۲. ساخت نسخه وب
npm run build

# ۳. اضافه کردن پلتفرم اندروید (فقط بار اول)
npx cap add android

# ۴. همگام‌سازی Capacitor با پروژه
npx cap sync android

# ۵. ساخت APK دیباگ
cd android && ./gradlew assembleDebug

# خروجی نهایی:
# android/app/build/outputs/apk/debug/app-debug.apk`}
                    </pre>
                  </div>

                  {/* Step 3: Android Studio */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🖥️</span>
                      باز کردن در Android Studio
                    </h4>
                    <pre className="bg-slate-950 p-2 rounded text-[8px] font-mono text-emerald-400 text-left ltr overflow-x-auto whitespace-pre">
{`npx cap open android`}
                    </pre>
                    <p className="text-slate-400 text-[9px]">
                      در Android Studio مسیر <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong> را بزنید.
                    </p>
                  </div>

                  {/* Step 4: Release APK */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🔐</span>
                      ساخت APK امضا شده برای انتشار
                    </h4>
                    <pre className="bg-slate-950 p-2 rounded text-[8px] font-mono text-emerald-400 text-left ltr overflow-x-auto whitespace-pre">
{`# ساخت Release APK
npm run android:release

# ساخت Android App Bundle برای گوگل پلی
npm run android:bundle`}
                    </pre>
                  </div>

                  {/* Step 4: Publish */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🌐</span>
                      انتشار در کافه بازار، مایکت و گوگل پلی
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-[9px]">
                      فایل <code className="text-emerald-400 font-mono">.apk</code> یا <code className="text-emerald-400 font-mono">.aab</code> امضا شده را در پنل توسعه‌دهندگان کافه بازار، مایکت یا Google Play Console آپلود کنید. این اپلیکیشن دارای سیستم ضد کپی انحصاری، آیکون حرفه‌ای و Splash Screen استاندارد است.
                    </p>
                  </div>

                  {/* Step 5: GitHub Actions Auto Build */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1">
                      <span>🤖</span>
                      ساخت خودکار APK با GitHub Actions
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-[9px]">
                      فایل workflow آماده در <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> قرار دارد. با push کردن روی GitHub، APK به صورت خودکار ساخته و قابل دانلود می‌شود.
                    </p>
                  </div>

                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/20 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  سوالات متداول کاربران ونیزان
                </h3>

                <div className="space-y-2 text-right">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="text-[11px] font-bold text-amber-200">چرا دکمه راست کلیک یا کپی در این نرم‌افزار کار نمی‌کند؟</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                      این برنامه حاوی کدهای فرکانسی و باورهای گران‌قیمتی است که بر اساس استانداردهای وب‌سایت ونیزان، جهت حفظ حق مالکیت معنوی، غیرقابل کپی طراحی شده تا ارزش آن حفظ شود.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="text-[11px] font-bold text-amber-200">چگونه باید موسیقی دلخواه خود را تنظیم کنیم؟</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                      در بخش «پلیر باورها» و ذیل عنوان «افزودن موسیقی دلخواه»، روی دکمه بارگذاری فایل صوتی کلیک کنید و هر موزیک دلخواهی را از گالری خود انتخاب کنید تا همزمان با جملات تأکیدی پخش شود.
                    </p>
                  </div>
                </div>
              </div>

              {/* Developer Dedication Badge */}
              <div className="text-center py-2">
                <p className="text-[9px] text-slate-500">
                  طراحی شده با ❤️ برای کاربران فرهیخته سایت ونیزان
                </p>
                <p className="text-[8px] text-slate-600 font-mono mt-0.5">
                  © 2026 Vanizan Success Whirlpool. All Rights Reserved.
                </p>
              </div>

            </div>
          )}

        </main>

        {/* Android Bottom Navigation Bar */}
        <nav className="absolute bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-amber-500/20 flex justify-around items-center px-4 z-40">
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'home' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Tv className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">داشبورد</span>
          </button>

          <button 
            onClick={() => openSubliminalPlayer(currentAffIndex)}
            className="flex flex-col items-center justify-center w-12 h-12 transition-all text-slate-400 hover:text-amber-400"
          >
            <Music className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">پخش ناخودآگاه</span>
          </button>

          <button 
            onClick={() => setActiveTab('meditation')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'meditation' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">خلسه جذب</span>
          </button>

          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'journal' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">دفترچه</span>
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'security' ? 'text-amber-400 scale-105' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-bold">تنظیمات</span>
          </button>

        </nav>

        {/* Android Home Navigation Pill Indicator at the bottom */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full z-50"></div>

      </div>

      {/* SUBLIMINAL PLAYER MODAL — Full screen immersive player */}
      {showSubliminalPlayer && (
        <div className="fixed inset-0 z-[95] bg-black flex flex-col items-center justify-center p-0 animate-fade-in">
          {/* Animated chakra background */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full opacity-20 animate-spin-slow"
              style={{
                background: `conic-gradient(from 0deg, ${CHAKRA_COLORS[0].hex}, ${CHAKRA_COLORS[1].hex}, ${CHAKRA_COLORS[2].hex}, ${CHAKRA_COLORS[3].hex}, ${CHAKRA_COLORS[4].hex}, ${CHAKRA_COLORS[5].hex}, ${CHAKRA_COLORS[6].hex}, ${CHAKRA_COLORS[0].hex})`,
                filter: 'blur(60px)'
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={closeSubliminalPlayer}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            ✕
          </button>

          {/* Main content */}
          <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center space-y-6">
            
            {/* Chakra wheel */}
            <div className="relative w-32 h-32">
              <div 
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{
                  background: `conic-gradient(from 0deg, ${CHAKRA_COLORS[0].hex}, ${CHAKRA_COLORS[1].hex}, ${CHAKRA_COLORS[2].hex}, ${CHAKRA_COLORS[3].hex}, ${CHAKRA_COLORS[4].hex}, ${CHAKRA_COLORS[5].hex}, ${CHAKRA_COLORS[6].hex})`,
                  filter: 'blur(8px)'
                }}
              />
              <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white mb-1">آماده برنامه‌ریزی ذهن</h2>
              <p className="text-sm text-slate-400">سرعت را تنظیم کنید و شروع کنید</p>
            </div>

            {/* Affirmation display with chakra color and symbol */}
            <div className="min-h-[160px] flex flex-col items-center justify-center gap-3">
              <span 
                className="text-5xl transition-all duration-200"
                style={{ 
                  opacity: isSubliminalVisible && isSubliminalPlaying ? 1 : 0,
                  transform: isSubliminalVisible && isSubliminalPlaying ? 'scale(1)' : 'scale(0.5)',
                  filter: `drop-shadow(0 0 20px ${getChakraColorForCategory(WEALTH_AFFIRMATIONS[subliminalIndex].category)})`
                }}
              >
                {WEALTH_AFFIRMATIONS[subliminalIndex].symbol}
              </span>
              <h3 
                className="text-2xl md:text-3xl font-black leading-relaxed px-4 transition-all duration-200"
                style={{ 
                  color: getChakraColorForCategory(WEALTH_AFFIRMATIONS[subliminalIndex].category),
                  textShadow: `0 0 40px ${getChakraColorForCategory(WEALTH_AFFIRMATIONS[subliminalIndex].category)}80`,
                  opacity: isSubliminalVisible && isSubliminalPlaying ? 1 : 0,
                  transform: isSubliminalVisible && isSubliminalPlaying ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                « {WEALTH_AFFIRMATIONS[subliminalIndex].text} »
              </h3>
            </div>

            {/* Advanced Duration + Frequency Controls */}
            <div className="w-full space-y-4">
              {/* Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white font-bold">
                  <span>Duration (مدت نمایش)</span>
                  <span className="font-mono text-amber-300">{subliminalDuration}ms</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="2000" 
                  step="1"
                  value={subliminalDuration}
                  onChange={(e) => setSubliminalDuration(parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${CHAKRA_COLORS[0].hex}, ${CHAKRA_COLORS[2].hex}, ${CHAKRA_COLORS[4].hex})`
                  }}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white font-bold">
                  <span>Frequency (فاصله بین باورها)</span>
                  <span className="font-mono text-amber-300">{subliminalFrequency}ms</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5000" 
                  step="1"
                  value={subliminalFrequency}
                  onChange={(e) => setSubliminalFrequency(parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${CHAKRA_COLORS[4].hex}, ${CHAKRA_COLORS[5].hex}, ${CHAKRA_COLORS[6].hex})`
                  }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Flash', d: 1, f: 50 },
                  { label: 'Fast', d: 50, f: 150 },
                  { label: 'Sub', d: 150, f: 500 },
                  { label: 'Calm', d: 500, f: 1500 },
                  { label: 'Trance', d: 1000, f: 3000 },
                  { label: 'Focus', d: 2000, f: 5000 },
                  { label: 'Sleep', d: 150, f: 2000 },
                  { label: 'Study', d: 500, f: 500 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSubliminalDuration(preset.d);
                      setSubliminalFrequency(preset.f);
                    }}
                    className={`text-[10px] py-1.5 rounded-lg font-bold transition-all ${
                      subliminalDuration === preset.d && subliminalFrequency === preset.f
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big play/pause button */}
            <button
              onClick={toggleSubliminalPlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
                isSubliminalPlaying 
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/50' 
                  : 'bg-emerald-500 text-white shadow-emerald-500/50'
              }`}
            >
              {isSubliminalPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 fill-white" />
              )}
            </button>

            <p className="text-[10px] text-slate-500">
              باور {subliminalIndex + 1} از {WEALTH_AFFIRMATIONS.length} — دسته: {AFFIRMATION_CATEGORIES.find(c => c.id === WEALTH_AFFIRMATIONS[subliminalIndex].category)?.name}
            </p>
          </div>
        </div>
      )}

      {/* Security Shield Overlay Alert (Custom modal when copying or right clicking) */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] animate-fade-in backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 max-w-md w-full text-right space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-black">هشدار حفاظتی: کپی‌رایت غیرقابل نفوذ ونیزان</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {securityModalMsg}
            </p>

            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20 text-[10px] text-emerald-300">
              📌 <strong>توصیه گرداب موفقیت ونیزان:</strong> اولین قدم برای جذب جریان عظیم ثروت، رعایت کامل قوانین معنوی و عدم تعرض به حقوق دیگران است. این اپلیکیشن منحصراً برای رشد شخص شماست.
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[9px] text-slate-500">کد خطای امنیتی: ERR_VANIZAN_SECURE</span>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all"
              >
                متوجه شدم و رعایت می‌کنم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Toasts Notification Center (Android styled notifications) */}
      <div className="fixed bottom-5 right-5 space-y-2 z-[90] max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`p-3 rounded-xl text-xs font-bold shadow-lg border flex items-center gap-2.5 transition-all duration-300 animate-slide-in text-right pointer-events-auto ${
              t.type === 'error' 
                ? 'bg-red-950/95 text-red-200 border-red-800' 
                : t.type === 'success' 
                  ? 'bg-emerald-950/95 text-emerald-200 border-emerald-800' 
                  : 'bg-amber-950/95 text-amber-200 border-amber-800'
            }`}
          >
            {t.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />}
            
            <span className="flex-1 leading-relaxed">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Side Brand Card (Visible on Desktop to provide extra context and links) */}
      <div className="hidden xl:flex flex-col w-[300px] bg-slate-900/80 border border-amber-500/20 rounded-3xl p-5 absolute left-8 top-12 text-right space-y-4 shadow-2xl glass-panel">
        <div className="text-center">
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
            پلتفرم هوشمند رشد مالی
          </span>
          <h2 className="text-sm font-black text-white mt-2">سایت گرداب موفقیت ونیزان</h2>
          <a 
            href="https://vanizan.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-amber-400 underline font-mono block mt-1"
          >
            vanizan.com
          </a>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          این سیستم هوشمند به منظور برنامه‌ریزی فوری ضمیر ناخودآگاه با استفاده از ۵ باور انحصاری، فرکانس‌های مغزی و تمرینات تنفسی عمیق توسعه یافته است.
        </p>

        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 font-bold block">مراحل تمرین برای نتیجه‌گیری فوق‌سریع:</span>
          
          <div className="flex gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">۱.</span>
            <span>تنظیم فرکانس ۸۸۸ هرتز در هدفون</span>
          </div>
          
          <div className="flex gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">۲.</span>
            <span>آغاز خوانش صوتی باورها با سرعت ۰.۷۵</span>
          </div>

          <div className="flex gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">۳.</span>
            <span>انجام همزمان تنفس عمیق در بخش خلسه جذب</span>
          </div>

          <div className="flex gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">۴.</span>
            <span>ثبت نتایج روزانه در بخش دفترچه ثروت</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-500/20 text-center">
          <span className="text-[10px] text-emerald-300 font-bold">
            «ثروتمند شدن حق طبیعی شماست»
          </span>
        </div>
      </div>

    </div>
  );
}
