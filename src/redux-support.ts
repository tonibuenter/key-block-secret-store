import { ACTIONS, getStore } from './redux';
import { useSelector } from 'react-redux';
import Web3 from 'web3';
import {
  AddressBookEntry,
  infoMessage,
  KeyBlockReduxState,
  PublicKeyHolder,
  SnackbarMessage,
  StatusMessage
} from './types';

export const useLoading = () => useSelector((state: KeyBlockReduxState) => state.loading || '');

export const dispatchLoading = (loading: string) =>
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { loading }
  });

export const useWeb3 = (): Web3 | undefined => useSelector((state: KeyBlockReduxState) => state.web3);

export const dispatchWeb3 = (web3?: Web3) =>
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { web3 }
  });

export const useStatusMessage = (): StatusMessage | undefined =>
  useSelector((state: KeyBlockReduxState) => state.statusMessage);

export const dispatchStatusMessage = (statusMessage?: StatusMessage) =>
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { statusMessage }
  });

export let SnackbarMessageCounter = 0;
export const dispatchSnackbarMessage = (statusMessage: StatusMessage | string, duration: number = 3000) => {
  if (typeof statusMessage === 'string') {
    statusMessage = infoMessage(statusMessage);
  }
  SnackbarMessageCounter++;
  const snackbarMessage: SnackbarMessage = { ...statusMessage, duration, counter: SnackbarMessageCounter };
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { snackbarMessage }
  });
};

export const useSnackbarMessage = (): SnackbarMessage | undefined =>
  useSelector((state: KeyBlockReduxState) => state.snackbarMessage);

export const usePublicAddress = () => useSelector((state: KeyBlockReduxState) => state.publicAddress);

export const dispatchPublicAddress = (publicAddress: string) =>
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { publicAddress }
  });

export const usePublicKeyHolder = () =>
  useSelector((state: KeyBlockReduxState): PublicKeyHolder | undefined => state.publicKeyHolder);

export const dispatchPublicKeyHolder = (publicKeyHolder: PublicKeyHolder | undefined) =>
  getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { publicKeyHolder }
  });

export const useNetworkId = (): number => useSelector((state: KeyBlockReduxState) => state.networkId || 0);
export const getNetworkId = (): number => getStore().getState().networkId ?? 0;

export const dispatchNetworkId = (networkId: number) => {
  return getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { networkId }
  });
};

export const useAddressBook = (): AddressBookEntry[] =>
  useSelector((state: KeyBlockReduxState) => state.addressBook || []);

export const dispatchAddressBook = (addressBook: AddressBookEntry[]) => {
  return getStore().dispatch({
    type: ACTIONS.UPDATE,
    payload: { addressBook }
  });
};
