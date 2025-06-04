import { useState, useEffect } from 'react';

const COOLDOWN_MINUTES = 5;
const COOLDOWN_KEY = 'loginCooldownStart';

export function useCooldownTimer() {
    const [cooldown, setCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const start = localStorage.getItem(COOLDOWN_KEY);
        if (start) {
            const startTime = parseInt(start, 10);
            const now = Date.now();
            const diff = now - startTime;
            const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
            if (diff < cooldownMs) {
                setCooldown(true);
                setTimeLeft(Math.ceil((cooldownMs - diff) / 1000));
            } else {
                localStorage.removeItem(COOLDOWN_KEY);
            }
        }
    }, []);

    useEffect(() => {
        if (cooldown && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0) {
            setCooldown(false);
            localStorage.removeItem(COOLDOWN_KEY);
        }
    }, [cooldown, timeLeft]);

    const startCooldown = () => {
        const now = Date.now();
        localStorage.setItem(COOLDOWN_KEY, now.toString());
        setCooldown(true);
        setTimeLeft(COOLDOWN_MINUTES * 60);
    };

    return { cooldown, timeLeft, startCooldown, COOLDOWN_MINUTES };
}
