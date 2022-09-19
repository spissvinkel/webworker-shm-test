// ----- Messages from main thread to workers ----------------------------------

export type WorkerMessage = InitWorkerMessage | RunWorkerMessage;

export const enum WorkerMessageTag { INIT, RUN }

interface BaseWorkerMessage {
    tag: WorkerMessageTag;
}

export interface InitWorkerMessage extends BaseWorkerMessage {
    tag: WorkerMessageTag.INIT;
    workerId: number;
    controlData: Int32Array;
    textureData: Uint8Array;
}

export interface RunWorkerMessage extends BaseWorkerMessage {
    tag: WorkerMessageTag.RUN;
}

export const mkInitWorkerMsg = (workerId: number, controlData: Int32Array, textureData: Uint8Array): InitWorkerMessage => ({
    tag: WorkerMessageTag.INIT,
    workerId,
    controlData,
    textureData
});

export const mkRunWorkerMsg = (): RunWorkerMessage => ({
    tag: WorkerMessageTag.RUN
});

export const isInitMsg = (message: WorkerMessage): message is InitWorkerMessage => message.tag === WorkerMessageTag.INIT;
export const isRunMsg = (message: WorkerMessage): message is RunWorkerMessage => message.tag === WorkerMessageTag.RUN;

// ----- Messages from workers to main thread ----------------------------------

export type MainThreadMessage = WorkerReadyMessage;

export const enum MainThreadMessageTag { READY }

interface BaseMainThreadMessage {
    tag: MainThreadMessageTag;
    workerId: number;
}

export interface WorkerReadyMessage extends BaseMainThreadMessage {
    tag: MainThreadMessageTag.READY;
}

export const mkWorkerReadyMsg = (workerId: number): WorkerReadyMessage => ({
    tag: MainThreadMessageTag.READY,
    workerId
});

export const isReadyMsg = (message: MainThreadMessage): message is WorkerReadyMessage => message.tag === MainThreadMessageTag.READY;
