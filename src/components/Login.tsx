import { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import {
  dispatchNetworkId,
  dispatchPublicAddress,
  dispatchPublicKeyHolder,
  dispatchSnackbarMessage,
  dispatchStatusMessage,
  dispatchWeb3
} from '../redux-support';
import { Box, Button, Stack } from '@mui/material';

import logo from '../images/keyblock200.png';
import { errorMessage, HolderType, infoMessage, isStatusMessage, PublicKeyHolder } from '../types';
import { useNavigate } from 'react-router-dom';
import { PublicKeyStore_getMine } from '../contracts/public-key-store/PublicKeyStore-support';

import { displayAddress } from '../utils/misc-util';

const Login: React.FC = () => {
  const w: any = window;
  const navigate = useNavigate();
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (w.ethereum) {
      w.web3 = new Web3(w.ethereum);
      dispatchWeb3(w.web3);
    }
  }, [w]);

  // let handleEthereum: () => Promise<void>;
  const handleEthereum = useCallback(async () => {
    if (connected) {
      dispatchSnackbarMessage(infoMessage('Connected!'));
      return;
    }
    setConnected(true);
    try {
      if (!w.ethereum) {
        dispatchSnackbarMessage(errorMessage('Can not connect to Wallet!', 'window.ethereum id not initialized!'));
        return;
      }

      await w.ethereum.enable();
      dispatchSnackbarMessage(infoMessage('Ethereum is enabled!'));

      const web3 = new Web3(w.ethereum);
      dispatchWeb3(web3);
      dispatchSnackbarMessage(infoMessage('Web3 initialized!'));
      w?.ethereum?.on('accountsChanged', () =>
        // e: never
        {
          w?.location?.reload();
        }
      );

      w?.ethereum?.on('networkChanged', () => {
        w?.location?.reload();
      });

      const networkId = await getCurrentNetworkId(web3);
      if (networkId) {
        dispatchNetworkId(networkId);
      } else {
        dispatchStatusMessage(errorMessage('Web3 could not detect network id!'));
        return;
      }

      const publicAddress = await getCurrentAddress(web3);

      // PUBLIC ADDRESS & PUBLIC KEY
      if (!publicAddress) {
        dispatchSnackbarMessage(errorMessage('Please open MetaMask first.', 'Web3 could not detect a public address!'));
        return;
      }
      dispatchSnackbarMessage(infoMessage(`Address ${displayAddress(publicAddress)} connected`));
      dispatchPublicAddress(publicAddress);

      const publicKeyHolder = await getPublicKey64(web3, publicAddress);
      if (!publicKeyHolder) {
        dispatchSnackbarMessage(errorMessage('Could not access the Public Key!'));
      } else {
        dispatchSnackbarMessage(infoMessage(`Public Key ${displayAddress(publicKeyHolder.publicKey)} connected`));
      }
      dispatchPublicKeyHolder(publicKeyHolder);
      navigate('/secret-store');

      // ADDRESS BOOK
    } catch (error) {
      dispatchSnackbarMessage(errorMessage('Error occurred while connecting to Wallet', error));
    }
  }, [w, connected, navigate]);

  const connectMetaMask = useCallback(() => {
    if (w.ethereum) {
      handleEthereum().catch(console.error);
    } else {
      dispatchSnackbarMessage(infoMessage('Try to detect METAMASK...'));
      w.addEventListener(
        'ethereum#initialized',
        () => {
          handleEthereum().catch((e) => dispatchSnackbarMessage(errorMessage(`Error occurred`, e)));
        },
        {
          once: true
        }
      );

      setTimeout(() => {
        handleEthereum().catch(console.error);
      }, 3000); // 3 seconds
    }
  }, [w, handleEthereum]);

  return (
    <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{ marginTop: '2em' }}>
      <Box sx={{ padding: '2em', margin: '2em', boxShadow: '2px 2px 10px lightgrey' }}>
        <img src={logo} alt={'logo'} />
      </Box>
      <Button onClick={connectMetaMask}>Connect MetaMask</Button>
    </Stack>
  );
};

export default Login;

async function getCurrentAddress(web3: Web3) {
  const coinbase = await web3.eth.getCoinbase();
  let addr = coinbase;
  if (Array.isArray(coinbase)) {
    addr = coinbase[0];
  }
  if (!addr) {
    return;
  }

  return addr.toLowerCase();
}

export async function getPublicKey64(web3: Web3, publicAddress: string): Promise<PublicKeyHolder | undefined> {
  dispatchSnackbarMessage(`Try to get public key`);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let publicKey = await PublicKeyStore_getMine(web3, publicAddress);
    let origin: HolderType = 'public-key-store';
    if (isStatusMessage(publicKey)) {
      dispatchSnackbarMessage(`No Public Key Store contract for: ${publicAddress}`);
      console.log(`No Public Key Store contract for: ${publicAddress}`);
      publicKey = '';
    }
    if (!publicKey) {
      const w = window as any;
      publicKey = (await w?.ethereum?.request({
        method: 'eth_getEncryptionPublicKey',
        params: [publicAddress]
      })) as string;
      origin = 'wallet';
    }
    if (!publicKey) {
      return;
    }
    return { publicKey, origin };
  } catch (e) {
    dispatchSnackbarMessage(errorMessage('getPublicKey64', e));
  }
}

async function getCurrentNetworkId(web3: Web3): Promise<number> {
  return +((await web3.eth.net.getId()) || '-1').toString();
}
