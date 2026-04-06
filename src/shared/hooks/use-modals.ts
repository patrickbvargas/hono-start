import * as React from "react";

type ModalKey = string;

interface ModalState<T> {
  selected: T | undefined;
  openModals: Set<ModalKey>;
}

export function useModals<T, K extends ModalKey = ModalKey>() {
  const [state, setState] = React.useState<ModalState<T>>({
    selected: undefined,
    openModals: new Set(),
  });

  const open = React.useCallback((key: K, data?: T) => {
    setState((prev) => ({
      selected: data ?? prev.selected,
      openModals: new Set([key]),
    }));
  }, []);

  const close = React.useCallback((key?: K) => {
    setState((prev) => {
      if (!key) return { selected: undefined, openModals: new Set() };
      const next = new Set(prev.openModals);
      next.delete(key);
      return { ...prev, openModals: next };
    });
  }, []);

  const isOpen = React.useCallback(
    (key: K) => state.openModals.has(key),
    [state.openModals],
  );

  const reset = React.useCallback(() => {
    setState({ selected: undefined, openModals: new Set() });
  }, []);

  const forModal = React.useCallback(
    (key: K) => ({
      isOpen: state.openModals.has(key),
      data: state.selected,
      onClose: () => close(key),
    }),
    [state, close],
  );

  return { selected: state.selected, open, close, isOpen, reset, forModal };
}
