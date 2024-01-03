import Web3 from 'web3/lib/types';
import { errorMessage } from '../types';
import { Contract } from 'web3-eth-contract';

export async function deployContract({
  web3,
  contractABI,
  contractBytecode,
  from,
  args
}: {
  web3: Web3;
  contractABI: string;
  contractBytecode: string;
  from: string;
  args?: any;
}) {
  try {
    const contract = new Contract(JSON.parse(contractABI), web3);

    // Deploy the contract
    const deployedContract = await contract
      .deploy({
        data: contractBytecode,
        arguments: args
      })
      .send({
        from
      });

    // Get the contract address
    const contractAddress = deployedContract.options.address;

    console.log('Contract address:', contractAddress);

    if (contractAddress) {
      return contractAddress.toLowerCase();
    } else {
      return errorMessage('No Contract Address');
    }
  } catch (e) {
    return errorMessage('Deploy contract failed!', e);
  }
}
