declare global {
  interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
  }
  type IdleRequestCallback = (deadline: IdleDeadline) => void;
  interface IdleRequestOptions {
    timeout?: number;
  }

  interface Window {
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      opts?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
}
export {};
