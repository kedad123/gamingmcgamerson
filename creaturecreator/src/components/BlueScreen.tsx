import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlueScreenProps {
  onDismiss: () => void;
}

const BlueScreen = ({ onDismiss }: BlueScreenProps) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [showMagicWord, setShowMagicWord] = useState(false);
  const [magicWordInput, setMagicWordInput] = useState("");
  const [wrongAttempt, setWrongAttempt] = useState(false);
  
  const progress = ((60 - secondsLeft) / 60) * 100;

  useEffect(() => {
    if (secondsLeft <= 0) {
      setShowMagicWord(true);
      return;
    }
    
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleSubmit = () => {
    if (magicWordInput.toLowerCase().trim() === "please") {
      onDismiss();
    } else {
      setWrongAttempt(true);
      setMagicWordInput("");
      setShowMagicWord(false);
      setSecondsLeft(60);
      setTimeout(() => setWrongAttempt(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0078D7] flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="text-white max-w-2xl text-center">
        <div className="text-9xl mb-8">:(</div>
        <h1 className="text-3xl font-bold mb-6">
          Your Animal Mixer ran into a problem.
        </h1>
        <p className="text-xl mb-8">
          The hybrid name you created contains inappropriate content and cannot be displayed.
        </p>
        <div className="flex items-center justify-center gap-3 mb-8">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-lg">ERROR_CURSE_WORD_DETECTED</span>
        </div>
        
        {!showMagicWord ? (
          <>
            <div className="text-lg opacity-80 mb-4">
              {Math.round(progress)}% complete
            </div>
            <div className="w-64 h-2 bg-white/30 rounded-full mx-auto mb-8 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm opacity-60">
              {wrongAttempt 
                ? "Wrong! Wait another minute..." 
                : `Please wait ${secondsLeft} seconds...`
              }
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-xl font-semibold">What's the magic word?</p>
            <div className="flex gap-2 justify-center max-w-xs mx-auto">
              <Input
                value={magicWordInput}
                onChange={(e) => setMagicWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type the magic word..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                autoFocus
              />
              <Button 
                onClick={handleSubmit}
                className="bg-white text-[#0078D7] hover:bg-white/90"
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueScreen;
