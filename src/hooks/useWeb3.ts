import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, type Signer } from 'ethers';

// Simple type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3State {
  account: string | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
}

export const useWeb3 = (): Web3State => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const _provider = new BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const _network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(Number(_network.chainId));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      // Handle chain changes
      const handleChainChanged = () => {
        window.location.reload();
      };

      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setAccount(null);
          setSigner(null);
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      };
      
      checkConnection();

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [connectWallet]);

  return {
    account,
    provider,
    signer,
    chainId,
    connectWallet,
  };
};
