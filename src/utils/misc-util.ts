import { Buffer } from 'buffer';
import { dispatchLoading } from '../redux-support';
import { errorMessage, StatusMessage } from '../types';

export function b64J(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openB64J(s: string): any {
  return JSON.parse(Buffer.from(s, 'base64').toString());
}

export function display64(s: string, max = 9): string {
  if (!s || s.length < max || max === 0) {
    return s;
  }
  return `${s.substring(0, max / 2)}...${s.substring(s.length - max / 2)} (size: ${s.length})`;
}

export function displayAddress(s: string, isXs = false): string {
  try {
    if (isXs) {
      return s.substring(s.length - 4);
    }
    return s.substring(0, 5) + '...' + s.substring(s.length - 4);
  } catch (e) {
    return s;
  }
}

export async function wrap<P = void>(loading: string, p: () => Promise<P>): Promise<P | StatusMessage> {
  try {
    dispatchLoading(loading);
    return await p();
  } catch (e) {
    return errorMessage('Error occurred', e);
  } finally {
    dispatchLoading('');
  }
}

export async function wrapPromise<T = void>(promise: Promise<T>, loading = 'Loading...') {
  try {
    dispatchLoading(loading);
    return await promise;
  } catch (e) {
    console.error(e);
    return errorMessage(`Error while: ${loading}`, e);
  } finally {
    dispatchLoading('');
  }
}
