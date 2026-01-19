import { useState, useRef, SetStateAction, Dispatch } from 'react';

function useConditionalState<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
function useConditionalState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>];
function useConditionalState<T>(
    initialValue?: T
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
    const [state, setState] = useState<T | undefined>(initialValue);
    const stateRef = useRef<T | undefined>(state);

    const setConditionalState: Dispatch<SetStateAction<T | undefined>> = (
        newValue: SetStateAction<T | undefined>
    ): void => {
        const resolvedValue = typeof newValue === 'function'
            ? (newValue as (prevState: T | undefined) => T | undefined)(stateRef.current)
            : newValue;

        // TODO 以后可以优化下
        if (JSON.stringify(stateRef.current) !== JSON.stringify(resolvedValue)) {
            stateRef.current = resolvedValue;
            setState(resolvedValue);
        }
    };

    return [state, setConditionalState];
}

export default useConditionalState;