import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Button } from "./ui/button";

interface WinScreenProps {
  goal: number;
  result: number;
  equationCount: number;
  onPlayAgain: () => void;
}

export const WinScreen = ({ goal, result, equationCount, onPlayAgain }: WinScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
      onClick={onPlayAgain}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="text-center p-8 rounded-2xl bg-card card-shadow max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-foreground mb-2">You Win!</h2>
        <p className="text-muted-foreground mb-2">
          You reached <span className="font-bold text-primary">{result.toLocaleString()}</span>
          <br />
          (Goal: {goal.toLocaleString()})
        </p>
        <p className="text-muted-foreground mb-4">
          Solved in <span className="font-bold text-primary">{equationCount}</span> equation{equationCount !== 1 ? 's' : ''}
        </p>
        
        <Button onClick={onPlayAgain} className="mt-2">
          Play Again
        </Button>
      </motion.div>
    </motion.div>
  );
};
