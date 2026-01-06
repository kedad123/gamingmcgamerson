import { useState, useMemo } from "react";
import AnimalInput from "@/components/AnimalInput";
import HybridResult from "@/components/HybridResult";
import BlueScreen from "@/components/BlueScreen";
import { Shuffle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedSplits } from "@/hooks/useSavedSplits";

const ANIMAL_LIST = [
  "elephant", "dolphin", "lion", "tiger", "shark", "whale", "butterfly", 
  "dragon", "penguin", "flamingo", "giraffe", "zebra", "kangaroo", "koala",
  "rabbit", "turtle", "eagle", "falcon", "panther", "leopard", "crocodile",
  "hippopotamus", "rhinoceros", "cheetah", "gorilla", "octopus", "jellyfish"
];

// Common curse words to filter (keeping it family-friendly)
const CURSE_WORDS = [
  "fuck", "shit", "ass", "damn", "hell", "bitch", "crap", "dick", "cock", 
  "pussy", "bastard", "slut", "whore", "piss", "cunt", "fag", "tit", "boob"
];

const containsCurseWord = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return CURSE_WORDS.some(word => lowerText.includes(word));
};

const Index = () => {
  const [animal1, setAnimal1] = useState("elephant");
  const [animal2, setAnimal2] = useState("dolphin");
  const [split1, setSplit1] = useState(3);
  const [split2, setSplit2] = useState(3);
  const [showBlueScreen, setShowBlueScreen] = useState(false);
  const [seenCursedWords, setSeenCursedWords] = useState<Set<string>>(new Set());
  
  const { getSavedSplit, saveSplit, hasSavedSplit } = useSavedSplits();

  const firstPart = animal1.slice(0, split1);
  const secondPart = animal2.slice(split2);
  const hybridName = firstPart + secondPart;

  const isCursed = useMemo(() => containsCurseWord(hybridName), [hybridName]);
  const alreadySeen = seenCursedWords.has(hybridName.toLowerCase());

  // Show blue screen when curse word is detected (only if not seen before)
  if (isCursed && !showBlueScreen && !alreadySeen) {
    setTimeout(() => setShowBlueScreen(true), 100);
  }

  const handleBlueScreenDismiss = () => {
    setSeenCursedWords((prev) => new Set(prev).add(hybridName.toLowerCase()));
    setShowBlueScreen(false);
  };

  const getDefaultSplit = (animal: string, isFirst: boolean): number => {
    const saved = getSavedSplit(animal);
    if (saved !== undefined && saved <= animal.length && saved >= 1) {
      return saved;
    }
    return isFirst ? Math.ceil(animal.length / 2) : Math.floor(animal.length / 2);
  };

  const randomizeAnimals = () => {
    const a1 = ANIMAL_LIST[Math.floor(Math.random() * ANIMAL_LIST.length)];
    let a2 = ANIMAL_LIST[Math.floor(Math.random() * ANIMAL_LIST.length)];
    while (a2 === a1) {
      a2 = ANIMAL_LIST[Math.floor(Math.random() * ANIMAL_LIST.length)];
    }
    setAnimal1(a1);
    setAnimal2(a2);
    setSplit1(getDefaultSplit(a1, true));
    setSplit2(getDefaultSplit(a2, false));
  };

  const randomizeSplits = () => {
    setSplit1(Math.floor(Math.random() * (animal1.length - 1)) + 1);
    setSplit2(Math.floor(Math.random() * (animal2.length - 1)) + 1);
  };

  const handleAnimal1Change = (val: string) => {
    setAnimal1(val);
    const saved = getSavedSplit(val);
    if (saved !== undefined && saved <= val.length && saved >= 1) {
      setSplit1(saved);
    } else {
      setSplit1(Math.min(split1, val.length) || 1);
    }
  };

  const handleAnimal2Change = (val: string) => {
    setAnimal2(val);
    const saved = getSavedSplit(val);
    if (saved !== undefined && saved <= val.length && saved >= 1) {
      setSplit2(saved);
    } else {
      setSplit2(Math.min(split2, val.length) || 1);
    }
  };

  const handleSplit1Change = (val: number) => {
    setSplit1(val);
    saveSplit(animal1, val);
  };

  const handleSplit2Change = (val: number) => {
    setSplit2(val);
    saveSplit(animal2, val);
  };

  return (
    <>
      {showBlueScreen && (
        <BlueScreen onDismiss={handleBlueScreenDismiss} />
      )}
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 dark:from-sky-900 dark:via-sky-800 dark:to-green-900">
      {/* Farm background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Sun */}
        <div className="absolute top-8 right-12 w-24 h-24 rounded-full bg-yellow-300 dark:bg-yellow-500 blur-sm opacity-80" />
        <div className="absolute top-10 right-14 w-20 h-20 rounded-full bg-yellow-200 dark:bg-yellow-400" />
        
        {/* Clouds */}
        <div className="absolute top-16 left-[10%] w-32 h-12 bg-white/80 dark:bg-white/20 rounded-full blur-sm" />
        <div className="absolute top-14 left-[12%] w-24 h-10 bg-white/90 dark:bg-white/30 rounded-full" />
        <div className="absolute top-20 left-[40%] w-40 h-14 bg-white/70 dark:bg-white/20 rounded-full blur-sm" />
        <div className="absolute top-24 right-[30%] w-28 h-10 bg-white/80 dark:bg-white/25 rounded-full" />
        
        {/* Rolling hills */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-green-400 dark:bg-green-700 rounded-t-[100%] translate-y-20" />
        <div className="absolute bottom-0 left-[-10%] right-0 h-40 bg-green-500 dark:bg-green-600 rounded-t-[100%] translate-y-16" />
        <div className="absolute bottom-0 left-[20%] right-[-20%] h-36 bg-green-400 dark:bg-green-700 rounded-t-[100%] translate-y-12" />
        
        {/* Fence */}
        <div className="absolute bottom-24 left-8 flex gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-3 h-20 bg-amber-700 dark:bg-amber-800 rounded-sm" />
              <div className="absolute top-4 w-full h-2 bg-amber-600 dark:bg-amber-700 -left-4" style={{ width: '100vw' }} />
              <div className="absolute top-12 w-full h-2 bg-amber-600 dark:bg-amber-700 -left-4" style={{ width: '100vw' }} />
            </div>
          ))}
        </div>
        
        {/* Barn silhouette */}
        <div className="absolute bottom-32 right-8 opacity-30 dark:opacity-20">
          <div className="w-20 h-16 bg-red-800" />
          <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-900 -mt-0.5 -ml-2.5" />
        </div>
      </div>

      <main className="relative container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            <span className="text-primary">Animal</span>{" "}
            <span className="text-secondary">Mixer</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Combine two animals to create a fantastic hybrid creature!
          </p>
        </header>

        {/* Random Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={randomizeAnimals}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Shuffle className="w-4 h-4" />
            Random Animals
          </Button>
          <Button
            onClick={randomizeSplits}
            variant="secondary"
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Random Split
          </Button>
        </div>

        {/* Input Cards */}
        <div className="space-y-6 mb-8">
          <AnimalInput
            label="🦁 First Animal"
            animal={animal1}
            splitPosition={split1}
            onAnimalChange={handleAnimal1Change}
            onSplitChange={handleSplit1Change}
            colorClass="text-primary"
            hasSavedSplit={hasSavedSplit(animal1)}
          />

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full gradient-playful flex items-center justify-center text-2xl shadow-soft animate-pulse-glow">
              ✨
            </div>
          </div>

          <AnimalInput
            label="🐬 Second Animal"
            animal={animal2}
            splitPosition={split2}
            onAnimalChange={handleAnimal2Change}
            onSplitChange={handleSplit2Change}
            colorClass="text-secondary"
            hasSavedSplit={hasSavedSplit(animal2)}
          />
        </div>

        {/* Result */}
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-soft p-6">
          <HybridResult firstPart={firstPart} secondPart={secondPart} animal1={animal1} animal2={animal2} />
        </div>

        {/* Fun suggestions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Try these combos:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { a1: "lion", a2: "tiger" },
              { a1: "shark", a2: "whale" },
              { a1: "butterfly", a2: "dragon" },
              { a1: "penguin", a2: "flamingo" },
            ].map(({ a1, a2 }) => (
              <button
                key={`${a1}-${a2}`}
                onClick={() => {
                  setAnimal1(a1);
                  setAnimal2(a2);
                  setSplit1(getDefaultSplit(a1, true));
                  setSplit2(getDefaultSplit(a2, false));
                }}
                className="px-4 py-2 bg-card/80 backdrop-blur-sm hover:bg-card rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              >
                {a1} + {a2}
              </button>
            ))}
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default Index;
