import { motion } from "framer-motion";

interface BlueScreenOfDeathProps {
  onDismiss: () => void;
}

export const BlueScreenOfDeath = ({ onDismiss }: BlueScreenOfDeathProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-[#0078d7] flex flex-col items-center justify-center p-8 cursor-pointer font-mono"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl text-white"
      >
        <div className="text-8xl mb-8">:(</div>
        <h1 className="text-2xl mb-4">
          Your calculator ran into a problem and needs to restart.
        </h1>
        <p className="text-lg mb-8 opacity-80">
          DIVISION_BY_ZERO_EXCEPTION
        </p>
        <div className="space-y-2 text-sm opacity-70">
          <p>Stop code: ATTEMPTED_DIVIDE_BY_ZERO</p>
          <p>What failed: NumberBuilder.exe</p>
          <p className="mt-4">
            If you'd like to know more, you can search online later for this error: 
            MATH_IS_UNDEFINED_0x0000001
          </p>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-lg"
        >
          Click anywhere to restart...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
