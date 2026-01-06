import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalculatorButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "number" | "operation" | "equals" | "clear";
  count?: number;
  digit?: number;
  useRomanNumerals?: boolean;
  useWordNumerals?: boolean;
}

const toRoman = (num: number): string => {
  if (num === 0) return "N";
  if (num === Infinity) return "∞";
  if (num < 0) return "-" + toRoman(-num);
  
  const romanValues: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  
  let result = "";
  let remaining = Math.floor(num);
  
  for (const [value, numeral] of romanValues) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  
  return result;
};

const toWords = (num: number): string => {
  if (num === Infinity) return "∞";
  if (num < 0) return "neg " + toWords(-num);
  if (num === 0) return "zero";
  
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? "-" + ones[one] : "");
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return ones[hundred] + " hundred" + (rest ? " " + toWords(rest) : "");
  }
  
  return String(num);
};

const getDigitStyles = (digit: number | undefined, disabled: boolean) => {
  if (digit === undefined || disabled) return "";
  
  const colorMap: Record<number, string> = {
    0: "bg-[hsl(var(--num-0))]",
    1: "bg-[hsl(var(--num-1))]",
    2: "bg-[hsl(var(--num-2))]",
    3: "bg-[hsl(var(--num-3))]",
    4: "bg-[hsl(var(--num-4))]",
    5: "bg-[hsl(var(--num-5))]",
    6: "bg-[hsl(var(--num-6))]",
    7: "bg-[hsl(var(--num-7))]",
    8: "bg-[hsl(var(--num-8))]",
    9: "bg-[hsl(var(--num-9))]",
  };
  
  return colorMap[digit] || "";
};

const getCountDisplay = (count: number, useRoman: boolean, useWords: boolean): string => {
  if (count === Infinity) return "∞";
  if (useWords) return toWords(count);
  if (useRoman) return toRoman(count);
  return String(count);
};

export const CalculatorButton = ({
  children,
  onClick,
  disabled = false,
  variant = "number",
  count,
  digit,
  useRomanNumerals = false,
  useWordNumerals = false,
}: CalculatorButtonProps) => {
  const baseStyles = "relative w-full aspect-square rounded-lg font-mono text-xl font-semibold transition-all duration-200 flex items-center justify-center";
  
  const variantStyles = {
    number: disabled
      ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
      : `text-white hover:brightness-110 button-shadow ${getDigitStyles(digit, disabled)}`,
    operation: disabled
      ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
      : "bg-operation text-foreground hover:bg-operation-hover button-shadow",
    equals: "bg-primary text-primary-foreground hover:brightness-110 coin-glow",
    clear: "bg-destructive/80 text-destructive-foreground hover:bg-destructive button-shadow",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={cn(baseStyles, variantStyles[variant])}
    >
      {children}
      {variant === "number" && count !== undefined && count > 0 && (
        <span className={`absolute -top-1 -right-1 bg-card text-foreground font-bold rounded-full min-w-5 h-5 flex items-center justify-center border border-border px-1 ${useRomanNumerals || useWordNumerals ? 'text-[6px]' : 'text-xs'}`}>
          {getCountDisplay(count, useRomanNumerals, useWordNumerals)}
        </span>
      )}
    </motion.button>
  );
};
