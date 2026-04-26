declare module 'react-native-background-timer' {
  const BackgroundTimer: {
    setTimeout: (fn: () => void, delay: number) => number;
    setInterval: (fn: () => void, delay: number) => number;
    clearTimeout: (id: number) => void;
    clearInterval: (id: number) => void;
    runBackgroundTimer: (fn: () => void, delay: number) => void;
    stopBackgroundTimer: () => void;
  };

  export default BackgroundTimer;
}