import { NUM_CHUNKS, NUM_WORKERS } from './common';

export const NUM_CONTROL_INTS = 3;

export const enum ControlIndex { WORKER_STATE, REMAINING_CHUNKS, REMAINING_WORKERS }
export const enum WorkerState { STOP, WAIT, RUN }

export const initControlData = (controlData: Int32Array): void => {
    Atomics.store(controlData, ControlIndex.WORKER_STATE, WorkerState.WAIT);
    Atomics.store(controlData, ControlIndex.REMAINING_CHUNKS, 0);
    Atomics.store(controlData, ControlIndex.REMAINING_WORKERS, 0);
};

export const resetControlData = (controlData: Int32Array): void => {
    Atomics.store(controlData, ControlIndex.REMAINING_CHUNKS, NUM_CHUNKS);
    Atomics.store(controlData, ControlIndex.REMAINING_WORKERS, NUM_WORKERS);
    Atomics.store(controlData, ControlIndex.WORKER_STATE, WorkerState.RUN);
    Atomics.notify(controlData, ControlIndex.WORKER_STATE);
};

export const getRemainingWorkers = (controlData: Int32Array): number => {
    return Atomics.load(controlData, ControlIndex.REMAINING_WORKERS);
};

/**
 * @returns value before decrease
 */
export const decreaseRemainingWorkers = (controlData: Int32Array): number => {
    return Atomics.sub(controlData, ControlIndex.REMAINING_WORKERS, 1);
};

/**
 * @returns value before decrease
 */
 export const decreaseRemainingChunks = (controlData: Int32Array): number => {
    return Atomics.sub(controlData, ControlIndex.REMAINING_CHUNKS, 1);
};

export const waitOnWorkerState = (controlData: Int32Array): void => {
    Atomics.wait(controlData, ControlIndex.WORKER_STATE, WorkerState.WAIT);
};

export const getWorkerState = (controlData: Int32Array): WorkerState => {
    return Atomics.load(controlData, ControlIndex.WORKER_STATE);
};

export const setWaitingWorkerState = (controlData: Int32Array): void => {
    Atomics.store(controlData, ControlIndex.WORKER_STATE, WorkerState.WAIT);
};
