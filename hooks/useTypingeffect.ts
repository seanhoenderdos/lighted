import { useEffect, useState } from "react";

export function useTypingEffect(texts: string[], delay = 150) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [forward, setForward] = useState(true);

  useEffect(() => {
    if (index === texts.length) return;

    if (subIndex === texts[index].length + 1 && forward) {
      setForward(false);
      return;
    }

    if (subIndex === 0 && !forward) {
      setForward(true);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (forward ? 1 : -1));
    }, delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, forward, texts, delay]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return `${texts[index].substring(0, subIndex)}${blink ? "|" : " "}`;
}
