import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trophy, Lock } from "lucide-react";

export type Difficulty = "easy" | "medium" | "hard" | "impossible" | "sandbox";

export type DifficultyRecords = Record<Exclude<Difficulty, "sandbox">, number | null>;

export type UnlockedDifficulties = Record<Difficulty, boolean>;

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
  records?: DifficultyRecords;
  unlockedDifficulties?: UnlockedDifficulties;
}

const difficultyConfig = {
  easy: { label: "Easy", goal: 20, startingOnes: 10 },
  medium: { label: "Medium", goal: 100, startingOnes: 7 },
  hard: { label: "Hard", goal: 1000, startingOnes: 5 },
  impossible: { label: "Impossible", goal: 10000, startingOnes: 3 },
  sandbox: { label: "Sandbox", goal: Infinity, startingOnes: Infinity },
};

export const getGoalForDifficulty = (difficulty: Difficulty): number => {
  return difficultyConfig[difficulty].goal;
};

export const getStartingOnesForDifficulty = (difficulty: Difficulty): number => {
  return difficultyConfig[difficulty].startingOnes;
};

export const isSandboxMode = (difficulty: Difficulty): boolean => {
  return difficulty === "sandbox";
};

export const getDefaultUnlockedDifficulties = (): UnlockedDifficulties => ({
  easy: true,
  medium: false,
  hard: false,
  impossible: false,
  sandbox: false,
});

const RecordBadge = ({ record }: { record: number | null }) => {
  if (record === null) return null;
  return (
    <span className="flex items-center gap-0.5 text-yellow-500 text-xs ml-1">
      <Trophy className="h-3 w-3" />
      {record}
    </span>
  );
};

const LockBadge = () => (
  <Lock className="h-3 w-3 text-muted-foreground ml-1" />
);

export const DifficultySelector = ({ difficulty, onDifficultyChange, disabled, records, unlockedDifficulties }: DifficultySelectorProps) => {
  const defaultUnlocked = getDefaultUnlockedDifficulties();
  const unlocked = unlockedDifficulties || defaultUnlocked;

  return (
    <Select value={difficulty} onValueChange={(value) => onDifficultyChange(value as Difficulty)} disabled={disabled}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="easy">
          <span className="flex items-center">
            Easy (20)
            {records && <RecordBadge record={records.easy} />}
          </span>
        </SelectItem>
        <SelectItem value="medium" disabled={!unlocked.medium}>
          <span className="flex items-center">
            Medium (100)
            {!unlocked.medium && <LockBadge />}
            {unlocked.medium && records && <RecordBadge record={records.medium} />}
          </span>
        </SelectItem>
        <SelectItem value="hard" disabled={!unlocked.hard}>
          <span className="flex items-center">
            Hard (1,000)
            {!unlocked.hard && <LockBadge />}
            {unlocked.hard && records && <RecordBadge record={records.hard} />}
          </span>
        </SelectItem>
        <SelectItem value="impossible" disabled={!unlocked.impossible}>
          <span className="flex items-center">
            Impossible (10,000)
            {!unlocked.impossible && <LockBadge />}
            {unlocked.impossible && records && <RecordBadge record={records.impossible} />}
          </span>
        </SelectItem>
        <SelectItem value="sandbox" disabled={!unlocked.sandbox}>
          <span className="flex items-center">
            Sandbox
            {!unlocked.sandbox && <LockBadge />}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
