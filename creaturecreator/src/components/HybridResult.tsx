import { useEffect, useState } from "react";

interface HybridResultProps {
  firstPart: string;
  secondPart: string;
  animal1?: string;
  animal2?: string;
}

const HybridResult = ({ firstPart, secondPart }: HybridResultProps) => {
  const [animate, setAnimate] = useState(false);
  const hybridName = firstPart + secondPart;

  useEffect(() => {
    if (hybridName.length > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [hybridName]);

  if (!firstPart && !secondPart) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground font-display">
          Enter two animals to create a hybrid! 🦁🐘
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Your Hybrid Animal
      </p>
      <div
        className={`inline-block px-8 py-4 rounded-3xl gradient-magic shadow-soft ${
          animate ? "animate-bounce-in" : ""
        }`}
      >
        <h2 className="text-4xl md:text-5xl font-display font-bold text-accent-foreground">
          <span className="text-primary-foreground">{firstPart}</span>
          <span className="text-primary-foreground/80">{secondPart}</span>
        </h2>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-4 text-lg font-display">
        <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl">
          {firstPart || "?"}
        </span>
        <span className="text-muted-foreground">+</span>
        <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl">
          {secondPart || "?"}
        </span>
      </div>
    </div>
  );
};

export default HybridResult;
