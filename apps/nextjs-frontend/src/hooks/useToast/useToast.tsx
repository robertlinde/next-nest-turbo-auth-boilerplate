import {use} from 'react';
import {type ShowToastFunction, ToastContext} from '@/providers/ToastProvider.tsx';

/**
 * Wrapper for PrimeReact Toast.
 * Usage:
 *
 * import {useToast} from '@/hooks/useToast';
 *
 * const {showToast} = useToast();
 *
 * showToast({...});
 */
export const useToast = (): {showToast: ShowToastFunction} => {
  const showToast = use(ToastContext);

  return {showToast};
};
