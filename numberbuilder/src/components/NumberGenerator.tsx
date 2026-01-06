import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface NumberGeneratorProps {
  onGenerate: (num: number) => void;
}

export const NumberGenerator = ({ onGenerate }: NumberGeneratorProps) => {
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const num = Math.floor(Math.random() * 10);
    setLastGenerated(num);
    onGenerate(num);
    
    setTimeout(() => setIsGenerating(false), 300);
  };

  return (
    <div className="bg-card rounded-lg p-4 card-shadow">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Generate Numbers</h2>
      <motion.button
        onClick={handleGenerate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 coin-glow transition-all hover:brightness-110"
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? "..." : "Generate Number"}
      </motion.button>
      
      {lastGenerated !== null && (
        <motion.div
          key={lastGenerated + Math.random()}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 text-center"
        >
          <span className="text-muted-foreground text-sm">Last: </span>
          <span className="text-primary font-mono font-bold text-xl">{lastGenerated}</span>
        </motion.div>
      )}
    </div>
  );
};
