import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorDisplay } from "./CalculatorDisplay";
import { CalculatorButton } from "./CalculatorButton";

import { BlueScreenOfDeath } from "./BlueScreenOfDeath";
import { WinScreen } from "./WinScreen";
import { DifficultySelector, Difficulty, DifficultyRecords, UnlockedDifficulties, getGoalForDifficulty, getStartingOnesForDifficulty, isSandboxMode, getDefaultUnlockedDifficulties } from "./DifficultySelector";
import { DevDialog } from "./DevDialog";
import { Divide, X, Minus, Plus, Equal, Delete, RotateCcw, Radical, Undo2 } from "lucide-react";
import { toast } from "sonner";

const EXTENDED_PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

const romanNumerals: Record<number, string> = {
  0: "N", // Nulla (no Roman numeral for 0)
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
};

const wordNumerals: Record<number, string> = {
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
};

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
  if (num === 0) return "zero";
  if (num === Infinity) return "infinity";
  if (num < 0) return "negative " + toWords(-num);
  
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const thousands = ["", "thousand", "million", "billion", "trillion"];
  
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
  
  let result = "";
  let remaining = Math.floor(num);
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
  
  return result.trim();
};

const getInitialNumbers = (diff: Difficulty) => {
  if (isSandboxMode(diff)) {
    return { 0: Infinity, 1: Infinity, 2: Infinity, 3: Infinity, 4: Infinity, 5: Infinity, 6: Infinity, 7: Infinity, 8: Infinity, 9: Infinity };
  }
  return { 0: 0, 1: getStartingOnesForDifficulty(diff), 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
};

// Detect repeating decimal digits - returns the repeating digit(s) or null
const findRepeatingDecimal = (num: number): number[] | null => {
  const absNum = Math.abs(num);
  if (Number.isInteger(absNum) || !isFinite(absNum)) return null;
  
  // Get more decimal places to detect repetition
  const extended = absNum.toFixed(10);
  const decimalPart = extended.split('.')[1];
  if (!decimalPart) return null;
  
  // Check for single digit repetition (e.g., 0.3333...)
  const lastDigit = decimalPart[decimalPart.length - 1];
  let repeatCount = 0;
  for (let i = decimalPart.length - 1; i >= 0; i--) {
    if (decimalPart[i] === lastDigit) repeatCount++;
    else break;
  }
  
  // If at least 4 consecutive same digits at the end, it's likely repeating
  if (repeatCount >= 4) {
    return [parseInt(lastDigit)];
  }
  
  return null;
};

interface CalculatorState {
  numbers: Record<number, number>;
  expression: string;
  result: string | null;
  lastAction: "number" | "operation" | null;
}

export const Calculator = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [numbers, setNumbers] = useState<Record<number, number>>(getInitialNumbers("easy"));
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"number" | "operation" | null>(null);
  const [showBSOD, setShowBSOD] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winResult, setWinResult] = useState(0);
  const [equationCount, setEquationCount] = useState(0);
  
  const [useRomanNumerals, setUseRomanNumerals] = useState(false);
  const [useWordNumerals, setUseWordNumerals] = useState(false);
  const [previousState, setPreviousState] = useState<CalculatorState | null>(null);
  const [pendingPower, setPendingPower] = useState<string | null>(null);
  const [records, setRecords] = useState<DifficultyRecords>(() => {
    const stored = localStorage.getItem("calculator-records");
    return stored ? JSON.parse(stored) : { easy: null, medium: null, hard: null, impossible: null };
  });
  const [unlockedDifficulties, setUnlockedDifficulties] = useState<UnlockedDifficulties>(() => {
    const stored = localStorage.getItem("calculator-unlocked");
    return stored ? JSON.parse(stored) : getDefaultUnlockedDifficulties();
  });

  const goal = getGoalForDifficulty(difficulty);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem("calculator-records", JSON.stringify(records));
  }, [records]);

  // Save unlocked difficulties to localStorage
  useEffect(() => {
    localStorage.setItem("calculator-unlocked", JSON.stringify(unlockedDifficulties));
  }, [unlockedDifficulties]);

  // Update record when winning and unlock next difficulty
  const updateRecord = (diff: Exclude<Difficulty, "sandbox">, equations: number) => {
    setRecords((prev) => {
      const current = prev[diff];
      if (current === null || equations < current) {
        return { ...prev, [diff]: equations };
      }
      return prev;
    });
    
    // Unlock next difficulty
    setUnlockedDifficulties((prev) => {
      const updated = { ...prev };
      if (diff === "easy") updated.medium = true;
      if (diff === "medium") updated.hard = true;
      if (diff === "hard") {
        updated.impossible = true;
        updated.sandbox = true;
      }
      return updated;
    });
  };

  // Keyboard support for sandbox mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSandboxMode(difficulty) || showBSOD || showWin) return;
    
    // Handle number keys 0-9
    if (/^[0-9]$/.test(e.key)) {
      const num = parseInt(e.key);
      if (result !== null) {
        setExpression(String(num));
        setResult(null);
      } else {
        setExpression((prev) => prev + num);
      }
      setLastAction("number");
    }
    // Handle operators
    else if (e.key === '+') {
      if (expression !== "" || result !== null) {
        if (lastAction === "operation") {
          setExpression((prev) => prev.slice(0, -3) + " + ");
        } else if (result !== null) {
          setExpression(result + " + ");
          setResult(null);
        } else {
          setExpression((prev) => prev + " + ");
        }
        setLastAction("operation");
      }
    }
    else if (e.key === '-') {
      if (expression !== "" || result !== null) {
        if (lastAction === "operation") {
          setExpression((prev) => prev.slice(0, -3) + " - ");
        } else if (result !== null) {
          setExpression(result + " - ");
          setResult(null);
        } else {
          setExpression((prev) => prev + " - ");
        }
        setLastAction("operation");
      }
    }
    else if (e.key === '*' || e.key.toLowerCase() === 'x') {
      if (expression !== "" || result !== null) {
        if (lastAction === "operation") {
          setExpression((prev) => prev.slice(0, -3) + " × ");
        } else if (result !== null) {
          setExpression(result + " × ");
          setResult(null);
        } else {
          setExpression((prev) => prev + " × ");
        }
        setLastAction("operation");
      }
    }
    else if (e.key === '/' || e.key === '%') {
      e.preventDefault();
      if (expression !== "" || result !== null) {
        if (lastAction === "operation") {
          setExpression((prev) => prev.slice(0, -3) + " ÷ ");
        } else if (result !== null) {
          setExpression(result + " ÷ ");
          setResult(null);
        } else {
          setExpression((prev) => prev + " ÷ ");
        }
        setLastAction("operation");
      }
    }
    // Handle Enter or = for equals
    else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      // Dispatch a custom event to trigger equals
      window.dispatchEvent(new CustomEvent('calculator-equals'));
    }
    // Handle @ for squared
    else if (e.key === '@') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-square'));
    }
    // Handle # for cubed
    else if (e.key === '#') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-cube'));
    }
    // Handle W/w for square root
    else if (e.key.toLowerCase() === 'w') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-sqrt'));
    }
    // Handle E/e for cube root
    else if (e.key.toLowerCase() === 'e') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-cbrt'));
    }
    // Handle Tab for reset
    else if (e.key === 'Tab') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-clear'));
    }
    // Handle Shift for undo/back
    else if (e.key === 'Shift') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-back'));
    }
    // Handle n for half
    else if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-half'));
    }
    // Handle M for quarter
    else if (e.key === 'M' || e.key === 'm') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('calculator-quarter'));
    }
    // Handle Backspace
    else if (e.key === 'Backspace') {
      if (result !== null) {
        setResult(null);
      } else if (expression !== "") {
        const operatorMatch = expression.match(/\s[+\-×÷]\s$/);
        if (operatorMatch) {
          setExpression((prev) => prev.slice(0, -3));
          setLastAction("number");
        } else {
          setExpression((prev) => prev.slice(0, -1).trim());
          setLastAction(null);
        }
      }
    }
  }, [difficulty, showBSOD, showWin, expression, result, lastAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const saveCurrentState = () => {
    setPreviousState({
      numbers: { ...numbers },
      expression,
      result,
      lastAction,
    });
  };

  const handleBack = () => {
    if (previousState) {
      setNumbers(previousState.numbers);
      setExpression(previousState.expression);
      setResult(previousState.result);
      setLastAction(previousState.lastAction);
      setPreviousState(null);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setNumbers(getInitialNumbers(newDifficulty));
    setExpression("");
    setResult(null);
    setLastAction(null);
    setShowWin(false);
    setEquationCount(0);
  };

  const handleNumberClick = (num: number) => {
    const sandbox = isSandboxMode(difficulty);
    if (!sandbox && numbers[num] <= 0) return;
    
    if (!sandbox) {
      setNumbers((prev) => ({
        ...prev,
        [num]: prev[num] - 1,
      }));
    }
    
    if (result !== null) {
      setExpression(String(num));
      setResult(null);
    } else {
      setExpression((prev) => prev + num);
    }
    setLastAction("number");
  };

  const handleOperation = (op: string) => {
    if (expression === "" && result === null) return;
    if (lastAction === "operation") {
      setExpression((prev) => prev.slice(0, -3) + ` ${op} `);
      return;
    }
    
    if (result !== null) {
      setExpression(result + ` ${op} `);
      setResult(null);
    } else {
      setExpression((prev) => prev + ` ${op} `);
    }
    setLastAction("operation");
  };

  const handleConstant = (constant: string) => {
    if (result !== null) {
      setExpression(constant);
      setResult(null);
    } else {
      setExpression((prev) => prev + constant);
    }
    setLastAction("number");
  };

  const handleNegate = () => {
    if (result !== null) {
      // Handle infinity results
      if (result === "∞") {
        setResult("-∞");
        setExpression(`-(${expression})`);
        return;
      } else if (result === "-∞") {
        setResult("∞");
        if (expression.startsWith("-(") && expression.endsWith(")")) {
          setExpression(expression.slice(2, -1));
        } else {
          setExpression(`-(${expression})`);
        }
        return;
      }
      // Negate the result
      const numResult = parseFloat(result);
      if (!isNaN(numResult)) {
        const negated = -numResult;
        const formatted = Number.isInteger(negated) 
          ? String(negated) 
          : negated.toFixed(4).replace(/\.?0+$/, "");
        setResult(formatted);
        setExpression(`-(${expression})`);
      }
    } else if (expression !== "") {
      // Wrap expression in negation
      if (expression.startsWith("-(") && expression.endsWith(")")) {
        // Remove negation
        setExpression(expression.slice(2, -1));
      } else if (expression.startsWith("-") && !expression.includes(" ")) {
        // Simple negative number, make positive
        setExpression(expression.slice(1));
      } else {
        // Add negation
        setExpression(`-(${expression})`);
      }
    }
  };

  const handleEquals = () => {
    if (expression === "" || lastAction === "operation") return;
    
    saveCurrentState();
    
    try {
      let evalExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      
      // Check for division by zero or zero divided by anything (only if not sandbox)
      if (!isSandboxMode(difficulty)) {
        if (/\/\s*0(?!\d)/.test(evalExpression) || /^0\s*\//.test(evalExpression)) {
          setShowBSOD(true);
          return;
        }
      }
      
      const evalResult = eval(evalExpression);
      
      // Check for Infinity (another sign of division by zero) - skip in sandbox
      if (!isSandboxMode(difficulty) && !isFinite(evalResult)) {
        setShowBSOD(true);
        return;
      }
      
      if (typeof evalResult === "number" && !isNaN(evalResult)) {
        // Special case: if expression is just "π" or "e", trigger BSOD
        if (expression.trim() === "π" || expression.trim() === "e") {
          setShowBSOD(true);
          return;
        }
        
        const formatted = evalResult === Infinity ? "∞" :
          evalResult === -Infinity ? "-∞" :
          Number.isInteger(evalResult) 
            ? String(evalResult) 
            : evalResult.toFixed(4).replace(/\.?0+$/, "");
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        // Check win condition - must be exactly the goal number (not in sandbox, not Infinity)
        if (!isSandboxMode(difficulty) && evalResult === goal && isFinite(evalResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(evalResult);
          setShowWin(true);
          return;
        }
        
        // Extract all digits from the result and add them to the bank (including decimals)
        if (isFinite(evalResult)) {
          // Check for repeating decimals first
          const repeatingDigits = findRepeatingDecimal(evalResult);
          
          // Get all digit characters from the formatted result, ignoring decimal point and minus
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          
          // If repeating decimal detected, set those digits to infinity
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      } else {
        setShowBSOD(true);
        return;
      }
    } catch {
      setShowBSOD(true);
      return;
    }
    setLastAction(null);
  };

  // Listen for keyboard triggers
  useEffect(() => {
    const handleEqualsEvent = () => handleEquals();
    const handleSquareEvent = () => handleSquare();
    const handleCubeEvent = () => handleCube();
    const handleSqrtEvent = () => handleSquareRoot();
    const handleCbrtEvent = () => handleCubeRoot();
    const handleClearEvent = () => handleClear();
    const handleBackEvent = () => handleBack();
    const handleHalfEvent = () => handleHalf();
    const handleQuarterEvent = () => handleQuarter();
    
    window.addEventListener('calculator-equals', handleEqualsEvent);
    window.addEventListener('calculator-square', handleSquareEvent);
    window.addEventListener('calculator-cube', handleCubeEvent);
    window.addEventListener('calculator-sqrt', handleSqrtEvent);
    window.addEventListener('calculator-cbrt', handleCbrtEvent);
    window.addEventListener('calculator-clear', handleClearEvent);
    window.addEventListener('calculator-back', handleBackEvent);
    window.addEventListener('calculator-half', handleHalfEvent);
    window.addEventListener('calculator-quarter', handleQuarterEvent);
    
    return () => {
      window.removeEventListener('calculator-equals', handleEqualsEvent);
      window.removeEventListener('calculator-square', handleSquareEvent);
      window.removeEventListener('calculator-cube', handleCubeEvent);
      window.removeEventListener('calculator-sqrt', handleSqrtEvent);
      window.removeEventListener('calculator-cbrt', handleCbrtEvent);
      window.removeEventListener('calculator-clear', handleClearEvent);
      window.removeEventListener('calculator-back', handleBackEvent);
      window.removeEventListener('calculator-half', handleHalfEvent);
      window.removeEventListener('calculator-quarter', handleQuarterEvent);
    };
  });

  const handleBSODDismiss = () => {
    setShowBSOD(false);
    setNumbers(getInitialNumbers(difficulty));
    setExpression("");
    setResult(null);
    setLastAction(null);
    setShowWin(false);
    setEquationCount(0);
    setPreviousState(null);
  };

  const handleClear = () => {
    // Reset the entire game
    setNumbers(getInitialNumbers(difficulty));
    setExpression("");
    setResult(null);
    setLastAction(null);
    setShowWin(false);
    setEquationCount(0);
    setPreviousState(null);
    toast.info("Game restarted", { duration: 1000 });
  };

  const handleWinPlayAgain = () => {
    handleClear();
  };

  const handleBackspace = () => {
    if (result !== null) {
      setResult(null);
      return;
    }
    
    if (expression === "") return;
    
    // Check if expression ends with an operator (e.g., " + ", " - ", " × ", " ÷ ")
    const operatorMatch = expression.match(/\s[+\-×÷]\s$/);
    if (operatorMatch) {
      setExpression((prev) => prev.slice(0, -3));
      setLastAction("number");
      return;
    }
    
    const lastChar = expression.slice(-1);
    if (/\d/.test(lastChar)) {
      const num = parseInt(lastChar);
      if (!isSandboxMode(difficulty)) {
        setNumbers((prev) => ({
          ...prev,
          [num]: prev[num] + 1,
        }));
      }
      setExpression((prev) => prev.slice(0, -1).trim());
      setLastAction(null);
    } else {
      // Handle any other character (like constants π, e, i, ∞)
      setExpression((prev) => prev.slice(0, -1).trim());
      setLastAction(null);
    }
  };

  const handleSquare = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    const valueToSquare = result !== null ? result : expression;
    try {
      const evalExpression = valueToSquare
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult))) {
        const squared = evalResult * evalResult;
        const formatted = squared === Infinity ? "∞" :
          squared === -Infinity ? "-∞" :
          Number.isInteger(squared) 
            ? String(squared) 
            : squared.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`(${valueToSquare})²`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && squared === goal && isFinite(squared)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(squared);
          setShowWin(true);
          return;
        }
        
        if (isFinite(squared)) {
          const repeatingDigits = findRepeatingDecimal(squared);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handleSquareRoot = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    const valueToRoot = result !== null ? result : expression;
    try {
      const evalExpression = valueToRoot
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult)) && evalResult >= 0) {
        const sqrtResult = Math.sqrt(evalResult);
        const formatted = sqrtResult === Infinity ? "∞" :
          Number.isInteger(sqrtResult) 
            ? String(sqrtResult) 
            : sqrtResult.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`√(${valueToRoot})`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && sqrtResult === goal && isFinite(sqrtResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(sqrtResult);
          setShowWin(true);
          return;
        }
        
        if (isFinite(sqrtResult)) {
          const repeatingDigits = findRepeatingDecimal(sqrtResult);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      } else if (evalResult < 0) {
        setShowBSOD(true);
        return;
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handleCube = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    const valueToCube = result !== null ? result : expression;
    try {
      const evalExpression = valueToCube
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult))) {
        const cubed = evalResult * evalResult * evalResult;
        const formatted = cubed === Infinity ? "∞" :
          cubed === -Infinity ? "-∞" :
          Number.isInteger(cubed) 
            ? String(cubed) 
            : cubed.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`(${valueToCube})³`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && cubed === goal && isFinite(cubed)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(cubed);
          setShowWin(true);
          return;
        }
        
        if (isFinite(cubed)) {
          const repeatingDigits = findRepeatingDecimal(cubed);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handleCubeRoot = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    const valueToRoot = result !== null ? result : expression;
    try {
      const evalExpression = valueToRoot
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult))) {
        const cbrtResult = Math.cbrt(evalResult);
        const formatted = cbrtResult === Infinity ? "∞" :
          cbrtResult === -Infinity ? "-∞" :
          Number.isInteger(cbrtResult) 
            ? String(cbrtResult) 
            : cbrtResult.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`∛(${valueToRoot})`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && cbrtResult === goal && isFinite(cbrtResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(cbrtResult);
          setShowWin(true);
          return;
        }
        
        if (isFinite(cbrtResult)) {
          const repeatingDigits = findRepeatingDecimal(cbrtResult);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handleHalf = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    
    const valueToHalf = result !== null ? result : expression;
    
    try {
      const evalExpression = valueToHalf
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult))) {
        const halfResult = evalResult / 2;
        const formatted = halfResult === Infinity ? "∞" :
          halfResult === -Infinity ? "-∞" :
          Number.isInteger(halfResult) 
            ? String(halfResult) 
            : halfResult.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`(${valueToHalf}) ÷ 2`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && halfResult === goal && isFinite(halfResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(halfResult);
          setShowWin(true);
          return;
        }
        
        if (isFinite(halfResult)) {
          const repeatingDigits = findRepeatingDecimal(halfResult);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handleQuarter = () => {
    if (expression === "" && result === null) return;
    
    saveCurrentState();
    
    const valueToQuarter = result !== null ? result : expression;
    
    try {
      const evalExpression = valueToQuarter
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const evalResult = eval(evalExpression);
      
      if (typeof evalResult === "number" && !isNaN(evalResult) && (isSandboxMode(difficulty) || isFinite(evalResult))) {
        const quarterResult = evalResult / 4;
        const formatted = quarterResult === Infinity ? "∞" :
          quarterResult === -Infinity ? "-∞" :
          Number.isInteger(quarterResult) 
            ? String(quarterResult) 
            : quarterResult.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`(${valueToQuarter}) ÷ 4`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        
        if (!isSandboxMode(difficulty) && quarterResult === goal && isFinite(quarterResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(quarterResult);
          setShowWin(true);
          return;
        }
        
        if (isFinite(quarterResult)) {
          const repeatingDigits = findRepeatingDecimal(quarterResult);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      }
    } catch {
      setShowBSOD(true);
    }
    setLastAction(null);
  };

  const handlePower = () => {
    if (expression === "" && result === null) return;
    
    const base = result !== null ? result : expression;
    setPendingPower(base);
    setExpression("");
    setResult(null);
    setLastAction(null);
    toast.info("Enter the exponent", { duration: 1500 });
  };

  const handlePowerEquals = () => {
    if (pendingPower === null || expression === "") return;
    
    saveCurrentState();
    
    try {
      const baseExpression = pendingPower
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      const exponentExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![0-9])/g, `(${Math.E})`)
        .replace(/i²/g, "(-1)")
        .replace(/i/g, "(Math.sqrt(-1))")
        .replace(/∞/g, "Infinity");
      
      const base = eval(baseExpression);
      const exponent = eval(exponentExpression);
      
      if (typeof base === "number" && typeof exponent === "number" && !isNaN(base) && !isNaN(exponent)) {
        const powerResult = Math.pow(base, exponent);
        
        if (!isSandboxMode(difficulty) && !isFinite(powerResult)) {
          setShowBSOD(true);
          setPendingPower(null);
          return;
        }
        
        const formatted = powerResult === Infinity ? "∞" :
          powerResult === -Infinity ? "-∞" :
          Number.isInteger(powerResult) 
            ? String(powerResult) 
            : powerResult.toFixed(4).replace(/\.?0+$/, "");
        
        setExpression(`(${pendingPower})^(${expression})`);
        setResult(formatted);
        setEquationCount((prev) => prev + 1);
        setPendingPower(null);
        
        if (!isSandboxMode(difficulty) && powerResult === goal && isFinite(powerResult)) {
          const finalEquations = equationCount + 1;
          updateRecord(difficulty as Exclude<Difficulty, "sandbox">, finalEquations);
          setWinResult(powerResult);
          setShowWin(true);
          return;
        }
        
        if (isFinite(powerResult)) {
          const repeatingDigits = findRepeatingDecimal(powerResult);
          const digitChars = formatted.replace(/[^0-9]/g, '').split('');
          const digits = digitChars.map(Number);
          const digitCounts: Record<number, number> = {};
          digits.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
          });
          if (repeatingDigits) {
            repeatingDigits.forEach(digit => {
              digitCounts[digit] = Infinity;
            });
          }
          if (digits.length > 0) {
            setNumbers((prev) => {
              const newNumbers = { ...prev };
              Object.entries(digitCounts).forEach(([digit, count]) => {
                if (count === Infinity) {
                  newNumbers[Number(digit)] = Infinity;
                } else {
                  newNumbers[Number(digit)] += count;
                }
              });
              return newNumbers;
            });
            if (repeatingDigits) {
              toast.success(`Unlocked infinite ${repeatingDigits.join(', ')}s!`, { duration: 1500 });
            } else {
              const unlockMsg = digits.length === 1 
                ? `Unlocked +1 "${digits[0]}"!`
                : `Unlocked ${digits.join(', ')}!`;
              toast.success(unlockMsg, { duration: 1500 });
            }
          }
        }
      } else {
        setShowBSOD(true);
        setPendingPower(null);
      }
    } catch {
      setShowBSOD(true);
      setPendingPower(null);
    }
    setLastAction(null);
  };

  return (
    <>
      <AnimatePresence>
        {showBSOD && <BlueScreenOfDeath onDismiss={handleBSODDismiss} />}
        {showWin && <WinScreen goal={goal} result={winResult} equationCount={equationCount} onPlayAgain={handleWinPlayAgain} />}
      </AnimatePresence>
      
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-4"
        >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Number Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSandboxMode(difficulty) ? (
              <span className="font-bold text-primary">{useWordNumerals ? "Sandbox Mode - No Rules!" : "Sandbox Mode - No Rules!"}</span>
            ) : (
              <>Reach <span className="font-bold text-primary">{useWordNumerals ? toWords(goal) : (useRomanNumerals ? toRoman(goal) : goal.toLocaleString())}</span> to win!</>
            )}
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <DifficultySelector 
              difficulty={difficulty} 
              onDifficultyChange={handleDifficultyChange}
              records={records}
              unlockedDifficulties={unlockedDifficulties}
            />
            <button
              onClick={() => {
                setUseRomanNumerals((prev) => !prev);
                if (!useRomanNumerals) setUseWordNumerals(false);
              }}
              className={`p-2 rounded-md transition-colors ${useRomanNumerals ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              title={useRomanNumerals ? "Use Arabic Numerals" : "Use Roman Numerals"}
            >
              <span className="text-xs font-bold">XII</span>
            </button>
            <button
              onClick={() => {
                setUseWordNumerals((prev) => !prev);
                if (!useWordNumerals) setUseRomanNumerals(false);
              }}
              className={`p-2 rounded-md transition-colors ${useWordNumerals ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              title={useWordNumerals ? "Use Arabic Numerals" : "Spell Out Numbers"}
            >
              <span className="text-xs font-bold">ABC</span>
            </button>
          </div>
        </div>
        

        <div className="bg-card rounded-xl p-4 card-shadow space-y-3">
          <CalculatorDisplay expression={expression} result={result} useRomanNumerals={useRomanNumerals} useWordNumerals={useWordNumerals} />
          
          <div className="grid grid-cols-4 gap-2">
            <CalculatorButton onClick={handleSquare} variant="operation" disabled={difficulty === "medium" || difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "x^two" : (useRomanNumerals ? "x^II" : "x²")}</span>
            </CalculatorButton>
            <CalculatorButton onClick={handleCube} variant="operation" disabled={difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "x^three" : (useRomanNumerals ? "x^III" : "x³")}</span>
            </CalculatorButton>
            <CalculatorButton onClick={handleSquareRoot} variant="operation" disabled={difficulty === "medium" || difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "√two" : (useRomanNumerals ? "√II" : "√")}</span>
            </CalculatorButton>
            <CalculatorButton onClick={handleCubeRoot} variant="operation" disabled={difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "√three" : (useRomanNumerals ? "√III" : "∛")}</span>
            </CalculatorButton>
            <CalculatorButton onClick={handleHalf} variant="operation" disabled={difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "half" : "½"}</span>
            </CalculatorButton>
            <CalculatorButton onClick={handleQuarter} variant="operation" disabled={difficulty === "hard" || difficulty === "impossible"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "quarter" : "¼"}</span>
            </CalculatorButton>
            <CalculatorButton onClick={pendingPower ? handlePowerEquals : handlePower} variant={pendingPower ? "equals" : "operation"}>
              <span className={useWordNumerals ? "text-[10px]" : "text-lg"}>{useWordNumerals ? "x^y" : "xʸ"}</span>
            </CalculatorButton>
            <div></div>

            <CalculatorButton onClick={handleClear} variant="clear">
              <RotateCcw className="w-5 h-5" />
            </CalculatorButton>
            <CalculatorButton onClick={handleBack} variant="operation" disabled={!previousState}>
              <Undo2 className="w-5 h-5" />
            </CalculatorButton>
            <CalculatorButton onClick={handleBackspace} variant="operation">
              <Delete className="w-5 h-5" />
            </CalculatorButton>
            <CalculatorButton onClick={() => handleOperation("÷")} variant="operation">
              <Divide className="w-5 h-5" />
            </CalculatorButton>

            {[7, 8, 9].map((num) => (
              <CalculatorButton
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={numbers[num] <= 0}
                count={numbers[num]}
                digit={num}
                useRomanNumerals={useRomanNumerals}
                useWordNumerals={useWordNumerals}
              >
                <span className={useWordNumerals ? 'text-xs' : ''}>
                  {useWordNumerals ? wordNumerals[num] : (useRomanNumerals ? romanNumerals[num] : num)}
                </span>
              </CalculatorButton>
            ))}
            <CalculatorButton onClick={() => handleOperation("×")} variant="operation">
              <X className="w-5 h-5" />
            </CalculatorButton>

            {[4, 5, 6].map((num) => (
              <CalculatorButton
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={numbers[num] <= 0}
                count={numbers[num]}
                digit={num}
                useRomanNumerals={useRomanNumerals}
                useWordNumerals={useWordNumerals}
              >
                <span className={useWordNumerals ? 'text-xs' : ''}>
                  {useWordNumerals ? wordNumerals[num] : (useRomanNumerals ? romanNumerals[num] : num)}
                </span>
              </CalculatorButton>
            ))}
            <CalculatorButton onClick={() => handleOperation("-")} variant="operation">
              <Minus className="w-5 h-5" />
            </CalculatorButton>

            {[1, 2, 3].map((num) => (
              <CalculatorButton
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={numbers[num] <= 0}
                count={numbers[num]}
                digit={num}
                useRomanNumerals={useRomanNumerals}
                useWordNumerals={useWordNumerals}
              >
                <span className={useWordNumerals ? 'text-xs' : ''}>
                  {useWordNumerals ? wordNumerals[num] : (useRomanNumerals ? romanNumerals[num] : num)}
                </span>
              </CalculatorButton>
            ))}
            <CalculatorButton onClick={() => handleOperation("+")} variant="operation">
              <Plus className="w-5 h-5" />
            </CalculatorButton>

            <div /> {/* Empty cell */}
            <CalculatorButton
              onClick={() => handleNumberClick(0)}
              disabled={numbers[0] <= 0}
              count={numbers[0]}
              digit={0}
              useRomanNumerals={useRomanNumerals}
              useWordNumerals={useWordNumerals}
            >
              <span className={useWordNumerals ? 'text-xs' : ''}>
                {useWordNumerals ? wordNumerals[0] : (useRomanNumerals ? romanNumerals[0] : 0)}
              </span>
            </CalculatorButton>
            <div /> {/* Empty cell */}
            <CalculatorButton onClick={handleEquals} variant="equals">
              <Equal className="w-5 h-5" />
            </CalculatorButton>
          </div>
          
          {/* Sandbox constants */}
          {isSandboxMode(difficulty) && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              <motion.button
                onClick={() => handleConstant("π")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg font-mono text-xl font-semibold bg-purple-600 text-white hover:brightness-110 button-shadow flex items-center justify-center"
              >
                π
              </motion.button>
              <motion.button
                onClick={() => handleConstant("e")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg font-mono text-xl font-semibold bg-teal-500 text-white hover:brightness-110 button-shadow flex items-center justify-center"
              >
                e
              </motion.button>
              <motion.button
                onClick={() => handleConstant("i")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg font-mono text-xl font-semibold bg-black text-white hover:brightness-110 button-shadow flex items-center justify-center"
              >
                i
              </motion.button>
              <motion.button
                onClick={() => handleConstant("∞")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg font-mono text-xl font-semibold bg-gradient-rainbow text-white hover:brightness-110 button-shadow flex items-center justify-center"
              >
                ∞
              </motion.button>
              <motion.button
                onClick={handleNegate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg font-mono text-xl font-semibold bg-amber-600 text-white hover:brightness-110 button-shadow flex items-center justify-center"
              >
                +/−
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
      <DevDialog 
        onUnlockAll={() => setUnlockedDifficulties({
          easy: true,
          medium: true,
          hard: true,
          impossible: true,
          sandbox: true
        })} 
        onResetAll={() => {
          setUnlockedDifficulties({
            easy: true,
            medium: false,
            hard: false,
            impossible: false,
            sandbox: false
          });
          setRecords({ easy: null, medium: null, hard: null, impossible: null });
          setDifficulty("easy");
        }}
      />
    </div>
    </>
  );
};
