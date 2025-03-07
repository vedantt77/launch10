import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  { text: "Traffic", color: "text-green-500" },
  { text: "Backlink", color: "text-blue-500" },
];

export function AnimatedHeader() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(150); // Controls typing speed

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const tick = () => {
      const currentWord = words[currentWordIndex].text;
      
      if (!isDeleting) {
        // Typing forward
        setText(currentWord.substring(0, text.length + 1));
        
        if (text === currentWord) {
          // Start deleting after a pause
          setIsDeleting(true);
          setDelta(2000); // Pause before deleting
        } else {
          setDelta(150); // Normal typing speed
        }
      } else {
        // Deleting
        setText(currentWord.substring(0, text.length - 1));
        setDelta(100); // Deletion speed

        if (text === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setDelta(500); // Pause before typing next word
        }
      }
    };

    timeout = setTimeout(tick, delta);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, currentWordIndex, delta]);

  return (
    <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
      🚀Advertise startup for free and get quality{' '}
      <span className={`inline-block min-w-[120px] ${words[currentWordIndex].color}`}>
        {text}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="ml-1 inline-block"
        >
          |
        </motion.span>
      </span>
    </h1>
  );
}
