import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme
} from '@mui/material';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { errorMessage, isStatusMessage } from '../../types';
import { KeyBlockEntry } from './KeyBlockEntryUi';
import { dispatchLoading, dispatchStatusMessage, useNetworkId, usePublicAddress, useWeb3 } from '../../redux-support';
import { grey } from '@mui/material/colors';
import { EmptyItem, Item, KeyBlock_get, KeyBlock_len } from '../../contracts/key-block/KeyBlock-support';
import { StatusMessageElement } from '../utils';
import Web3 from 'web3';
import { ContractName, getContractAddress, getNetworkInfo } from '../../contracts/network-info';
import { display64 } from '../../utils/misc-util';

const KeyBlockTableUi: FC = () => {
  const theme = useTheme();
  const networkId = useNetworkId();
  const web3 = useWeb3();
  const publicAddress = usePublicAddress();
  const [rows, setRows] = useState<Item[]>([]);
  const [editItem, setEditItem] = useState(EmptyItem);
  const [filterValue, setFilterValue] = useState('');
  const [openEditor, setOpenEditor] = useState(false);

  useEffect(() => {
    const load = async () => {
      await refreshFromBlockchain(publicAddress, networkId, web3, setRows);
    };
    load().catch(console.error);
  }, [web3, publicAddress, networkId]);

  const renderKeyBlockEntryTable = useCallback(() => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell key={'index'}>Index</TableCell>
              <TableCell key={'inserted'}>Inserted</TableCell>
              <TableCell key={'name'}>Name</TableCell>
              <TableCell key={'secret'}>Secret (encrypted)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .filter((row) => row.name.includes(filterValue))
              .map((row) => (
                <TableRow
                  sx={{ cursor: 'pointer' }}
                  hover={true}
                  onClick={() => {
                    setEditItem({ ...row });
                    setOpenEditor(true);
                  }}
                  key={row.index}
                >
                  <TableCell key={'index'}>{row.index}</TableCell>
                  <TableCell key={'inserted'}>{row.inserted}</TableCell>
                  <TableCell key={'name'}>{row.name}</TableCell>
                  <TableCell key={'secret'}>{display64(row.secret)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button
            onClick={() => {
              refreshFromBlockchain(publicAddress, networkId, web3, setRows).catch(console.error);
            }}
          >
            Refresh
          </Button>
        </Stack>
      </TableContainer>
    );
  }, [publicAddress, web3, rows, filterValue, networkId]);

  const { name } = getNetworkInfo(networkId);
  const contractAddress = getContractAddress(networkId, ContractName.KeyBlock);
  if (!contractAddress) {
    return <StatusMessageElement statusMessage={errorMessage(`No contract found on ${name} for Key Block`)} />;
  }

  return (
    <Stack>
      <Stack
        direction={'row'}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        mb={'1em'}
        sx={{ backgroundColor: theme.palette.mode === 'dark' ? grey['900'] : grey.A100 }}
      >
        <TextField
          autoComplete={'secret-store-search'}
          size={'small'}
          label={'Name filter'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
          value={filterValue}
        />
        <Button
          onClick={() => {
            setEditItem({ ...EmptyItem });
            setOpenEditor(true);
          }}
        >
          New Entry
        </Button>
      </Stack>
      {renderKeyBlockEntryTable()}

      <KeyBlockEntry
        item={editItem}
        open={openEditor}
        done={() => {
          setOpenEditor(false);
        }}
        update={() => {
          refreshFromBlockchain(publicAddress, networkId, web3, setRows).catch(console.error);
        }}
      />
    </Stack>
  );
};
export default KeyBlockTableUi;

async function refreshFromBlockchain(
  publicAddress: string | undefined,
  networkId: number,
  web3: Web3 | undefined,
  setRows: (items: Item[]) => void
) {
  if (!publicAddress || !web3 || !networkId) {
    return;
  }
  setRows([]);
  try {
    dispatchLoading('Reading entries...');
    dispatchStatusMessage();
    const len = await KeyBlock_len(web3, publicAddress);
    if (isStatusMessage(len)) {
      dispatchStatusMessage(len);
      return;
    }
    const items: Item[] = [];
    for (let index = 0; index < len; index++) {
      const entry = await KeyBlock_get(web3, publicAddress, index);
      if (isStatusMessage(entry)) {
        dispatchStatusMessage(entry);
        return;
      } else {
        const item: Item = { index, name: entry[0], secret: entry[1], inserted: entry[2] };
        items.push(item);
      }
    }
    setRows(items);
  } catch (e) {
    dispatchStatusMessage(errorMessage('Serious Error', e));
  } finally {
    dispatchLoading('');
  }
}
