import { motion } from "framer-motion";

interface CalculatorDisplayProps {
  expression: string;
  result: string | null;
  useRomanNumerals?: boolean;
  useWordNumerals?: boolean;
}

const romanNumerals: Record<string, string> = {
  "0": "N",
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IV",
  "5": "V",
  "6": "VI",
  "7": "VII",
  "8": "VIII",
  "9": "IX",
};

const wordNumerals: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};

const toRoman = (num: number): string => {
  if (num === 0) return "N";
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
  
  // Handle decimals
  if (num % 1 !== 0) {
    result += "." + String(num).split(".")[1];
  }
  
  return result;
};

const toWords = (num: number): string => {
  if (num === 0) return "zero";
  if (num < 0) return "negative " + toWords(-num);
  
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const thousands = ["", "thousand", "million", "billion", "trillion"];
  
  const intPart = Math.floor(num);
  const decPart = num % 1;
  
  const convertChunk = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one ? "-" + ones[one] : "");
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return ones[hundred] + " hundred" + (rest ? " " + convertChunk(rest) : "");
  };
  
  if (intPart === 0) {
    // Handle pure decimals
    const decStr = String(num).split(".")[1] || "";
    const decWords = decStr.split("").map(d => wordNumerals[d]).join(" ");
    return "zero point " + decWords;
  }
  
  let result = "";
  let remaining = intPart;
  let chunkIndex = 0;
  
  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkStr = convertChunk(chunk);
      const suffix = thousands[chunkIndex];
      result = chunkStr + (suffix ? " " + suffix : "") + (result ? " " + result : "");
    }
    remaining = Math.floor(remaining / 1000);
    chunkIndex++;
  }
  
  // Handle decimals
  if (decPart > 0) {
    const decStr = String(num).split(".")[1] || "";
    const decWords = decStr.split("").map(d => wordNumerals[d]).join(" ");
    result += " point " + decWords;
  }
  
  return result.trim();
};

const convertExpressionToRoman = (expr: string): string => {
  // Replace each number (including multi-digit) with Roman numerals
  return expr.replace(/\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    return toRoman(num);
  });
};

const convertExpressionToWords = (expr: string): string => {
  // Replace each number (including multi-digit) with words
  return expr.replace(/\d+\.?\d*/g, (match) => {
    const num = parseFloat(match);
    return toWords(num);
  });
};

export const CalculatorDisplay = ({ expression, result, useRomanNumerals = false, useWordNumerals = false }: CalculatorDisplayProps) => {
  let displayExpression = expression;
  let displayResult = result;
  
  if (useWordNumerals && expression) {
    displayExpression = convertExpressionToWords(expression);
  } else if (useRomanNumerals && expression) {
    displayExpression = convertExpressionToRoman(expression);
  }
  
  if (useWordNumerals && result) {
    displayResult = toWords(parseFloat(result));
  } else if (useRomanNumerals && result) {
    displayResult = toRoman(parseFloat(result));
  }

  const defaultDisplay = useWordNumerals ? "zero" : (useRomanNumerals ? "N" : "0");

  return (
    <div className="bg-display rounded-lg p-3 card-shadow overflow-hidden">
      <div className="min-h-[80px] flex flex-col justify-center items-end">
        <motion.div
          key={expression}
          initial={{ opacity: 0.5, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-muted-foreground font-mono break-all text-right w-full ${useWordNumerals ? 'text-2xl' : 'text-4xl'}`}
        >
          {displayExpression || defaultDisplay}
        </motion.div>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-primary font-mono font-bold mt-2 ${useWordNumerals ? 'text-3xl' : 'text-5xl'}`}
          >
            = {displayResult}
          </motion.div>
        )}
      </div>
    </div>
  );
};
