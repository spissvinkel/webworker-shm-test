let deltaElem: HTMLDivElement | null | undefined = undefined;
let lastTime = 0;

// Update elapsed time
export const updateTime = (time: number): number => {
    const deltaTime = time - lastTime;
    lastTime = time;
    if (deltaElem === undefined) deltaElem = document.getElementById('delta') as HTMLDivElement | null;
    if (deltaElem !== null) deltaElem.textContent = `${deltaTime.toFixed(1)} ms`;
    return deltaTime;
};

export const ONE_SECOND = 1000; // Millisecond resolution

const counters: Record<string, Counter> = { };

export interface Counter {
    id: string;
    label: string;
    count: number;
    average: number;
    delta: number;
    last: number;
    elem: HTMLDivElement;
}

export const mkCounter = (id: string, label = id.toLocaleUpperCase()): void => {
    const count = 0, average = 0, delta = 0, last = 0;
    const elem = document.getElementById(id) as HTMLDivElement | null;
    if (elem === null) throw `No ${id} element`;
    counters[id] = { id, label, count, average, delta, last, elem };
};

export const updateCounter = (id: string): void => {
    if (!(id in counters)) return;
    const counter = counters[id];
    if (lastTime - counter.last >= ONE_SECOND) {
        counter.average = counter.count;
        counter.count = -1;
        counter.last = lastTime;
    }
    counter.count++;
    counter.elem.textContent = `${counter.average} ${counter.label}`;
};
