export type TimerId = ReturnType<typeof setTimeout>;

export type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};
