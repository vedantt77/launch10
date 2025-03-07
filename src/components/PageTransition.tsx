import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 400, // Increased from 260 for faster movement
        damping: 30,    // Increased from 20 for less oscillation
        mass: 0.5       // Added mass reduction to make it lighter/faster
      }}
    >
      {children}
    </motion.div>
  );
}