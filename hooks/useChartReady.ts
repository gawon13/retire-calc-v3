import { useRef, useState, useEffect, useCallback, RefObject } from 'react';

export function useChartReady(): [RefObject<HTMLDivElement | null>, boolean, number, number] {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number; ready: boolean }>({ w: 0, h: 0, ready: false });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setSize({ w, h, ready: true });
            }
        };

        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return [ref, size.ready, size.w, size.h];
}
