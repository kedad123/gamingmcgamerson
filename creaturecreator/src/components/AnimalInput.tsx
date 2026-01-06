import { Slider } from "@/components/ui/slider";
import { Save } from "lucide-react";

interface AnimalInputProps {
  label: string;
  animal: string;
  splitPosition: number;
  onAnimalChange: (value: string) => void;
  onSplitChange: (value: number) => void;
  colorClass: string;
  hasSavedSplit?: boolean;
}

const AnimalInput = ({
  label,
  animal,
  splitPosition,
  onAnimalChange,
  onSplitChange,
  colorClass,
  hasSavedSplit,
}: AnimalInputProps) => {
  const firstHalf = animal.slice(0, splitPosition);
  const secondHalf = animal.slice(splitPosition);

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-3xl shadow-soft">
      <label className="text-lg font-display font-semibold text-foreground">
        {label}
      </label>
      
      <input
        type="text"
        value={animal}
        onChange={(e) => onAnimalChange(e.target.value.toLowerCase())}
        placeholder="Enter an animal..."
        className="w-full px-4 py-3 text-xl font-display bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
      />

      {animal.length > 1 && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Split at:
            </span>
            <Slider
              value={[splitPosition]}
              onValueChange={([val]) => onSplitChange(val)}
              min={1}
              max={animal.length}
              step={1}
              className="flex-1"
            />
            {hasSavedSplit && (
              <Save className="w-4 h-4 text-primary" />
            )}
          </div>

          <div className="flex items-center justify-center gap-1 text-3xl font-display font-bold">
            <span className={colorClass}>{firstHalf}</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground">{secondHalf}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimalInput;
