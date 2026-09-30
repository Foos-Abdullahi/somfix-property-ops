import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export function useAccessFilters<T extends Record<string, string>>(
    url: string,
    initial: T,
) {
    const [values, setValues] = useState(initial);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cancel = useRef<(() => void) | undefined>(undefined);
    useEffect(
        () => () => {
            clearTimeout(timer.current);
            cancel.current?.();
        },
        [],
    );
    function update(next: T, delay = 0) {
        clearTimeout(timer.current);
        cancel.current?.();
        setValues(next);
        timer.current = setTimeout(() => {
            router.get(url, next, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onCancelToken: (token) => {
                    cancel.current = () => token.cancel();
                },
            });
        }, delay);
    }
    return { values, update };
}
