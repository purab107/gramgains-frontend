// Framer motion variants for horizontal slide between questions
export const slideVariants: any = {
  enter: (dir: number) => ({
    x: dir > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.25 },
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 50 : -50,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.18 },
    },
  }),
};

// Cascading slide-down animation for question headlines, inputs, and cards
export const slideDown: any = {
  hidden: { opacity: 0, y: -10 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.04,
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};
