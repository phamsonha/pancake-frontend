/* eslint-disable prefer-template */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable camelcase */
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { LockedItemInterface } from 'types'
import { AutoColumn } from 'components/Layout/Column'
import Web3 from 'web3';
import { formatEther } from '@ethersproject/units';
import { TX_SCANERS, VESTING_CONTRACT } from 'config'
import { Contract } from "web3-eth-contract";
import BN from "bn.js";
import { useVestingContract } from 'web3/contract'
import { useWeb3Provider } from 'web3/web3'
import { AppHeader, AppBody } from '../../components/App'
import Page from '../Page'



const Body = styled(CardBody)`
  background-color: ${({ theme }) => theme.colors.dropdownDeep};
`

export const Wrapper = styled.div`
  position: relative;
  padding: 1rem;
`

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: '20px';
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`
const Container = styled.div`
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
`

const web3 = new Web3(Web3.givenProvider);


const fetchInformation = async (contract: Contract, address: string) => {
  let [releaseAmount, lockedAmount, totalShare, released, unlocked, tge, cliff, duration] =
    await Promise.all([
      contract.methods.calculateReleaseAmount(address).call(),
      contract.methods.tgeUnlock(address).call(),
      contract.methods.shares(address).call(),
      contract.methods.released(address).call(),
      contract.methods.unlocked(address).call(),
      contract.methods.TGE().call(),
      contract.methods.cliff().call(),
      contract.methods.duration().call(),
    ]);

  console.log(releaseAmount, lockedAmount, totalShare, released, unlocked, tge, cliff, duration)

  return {
    releaseAmount: Number(formatEther(releaseAmount)),
    lockedAmount: Number(formatEther(lockedAmount)),
    totalShare: new BN(totalShare.toString(), 10).div(new BN("1000000000000000000")).toNumber(),
    released: new BN(released.toString(), 10).div(new BN("1000000000000000000")).toNumber(),
    unlocked: new BN(unlocked.toString(), 10).div(new BN("1000000000000000000")).toNumber(),
    tge: new BN(tge.toString(), 10).toNumber() * 1000,
    cliff: new BN(cliff.toString(), 10).toNumber() * 1000,
    duration: new BN(duration.toString(), 10).toNumber() * 1000,
  };
};

export default function VestingSing() {
  const { account, chainId, library } = useActiveWeb3React()
  const { t } = useTranslation()

  const [amount, setAmount] = useState<{
    releaseAmount: number;
    lockedAmount: number;
    totalShare: number;
    released: number;
    unlocked: number;
    tge: number;
    cliff: number;
    duration: number;
  }>({
    releaseAmount: 0,
    lockedAmount: 0,
    totalShare: 0,
    released: 0,
    unlocked: 0,
    tge: 0,
    cliff: 0,
    duration: 0,
  });

  // get smartcontract list from Server SING
  const [pending, setPending] = useState(false)

  const contract = useVestingContract(web3, account, VESTING_CONTRACT);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  const updateData = useCallback(async () => {
    if (account) {
      const myAmount = await fetchInformation(contract, account);
      console.log(myAmount);
      if (myAmount.tge <= +new Date()) {
        console.log('setAmount');
        setAmount(myAmount);
      } else {
        setAmount({
          releaseAmount: 0,
          lockedAmount: 0,
          totalShare: 0,
          released: 0,
          unlocked: 0,
          tge: myAmount.tge,
          cliff: myAmount.cliff,
          duration: myAmount.duration,
        });
      }
    }
  }, [contract, account]);

  useEffect(() => {
    const tm = setInterval(updateData, 5000);
    return () => clearInterval(tm);
  }, [account, updateData]);

  const claimAction = async () => {
    setPending(true);
    try {
      if (amount.lockedAmount > 0 && amount.releaseAmount > 0) {
        const claimResult = await contract.methods.unlockAndRelease().send({ from: account });
        setTxHash(claimResult.transactionHash);
      } else if (amount.lockedAmount > 0) {
        const claimResult = await contract.methods.unlock().send({ from: account });
        setTxHash(claimResult.transactionHash);
      } else if (amount.releaseAmount > 0) {
        const claimResult = await contract.methods.release().send({ from: account });
        setTxHash(claimResult.transactionHash);
      }
    } catch (ex: any) {
      console.error(ex);
      setError(ex.message || ex.toString());
    }
    finally {
      setPending(false);
    }
  };


  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to Claim.')}
        </Text>
      )
    }
    if (account) {
      return (
        <AutoColumn gap="md">
          <Flex mb="5px" flexDirection="column" alignItems="center" justifyContent="flex-start">
            <Text bold>
              {t('Address:')}
            </Text>
            <Text>{account}</Text>
          </Flex>

          <Flex mb="5px" flexDirection="column" alignItems="center" justifyContent="flex-start">
            <Text bold>
              {t('Available Amount:')}
            </Text>
            <Text bold fontSize="24px">
              {
                (amount.releaseAmount + amount.lockedAmount).toFixed(12)
              }&nbsp;SING
            </Text>
          </Flex>

          <Flex alignItems="flex-start" flexDirection="column" width="100%">

            <Flex mb="1px" alignItems="center" justifyContent="space-between">
              <Text bold>TGE:&nbsp;</Text>
              <Text>
                {new Date(amount.tge).toLocaleDateString()}{" "}
                {new Date(amount.tge).toLocaleTimeString()}
              </Text>
            </Flex>

            <Flex mb="1px" alignItems="center" justifyContent="space-between">
              <Text bold>Cliff at:&nbsp;</Text>
              <Text>
                {new Date(amount.cliff).toLocaleDateString()}{" "}
                {new Date(amount.cliff).toLocaleTimeString()}
              </Text>
            </Flex>

            <Flex mb="1px" alignItems="center" justifyContent="space-between">
              <Text bold>Finish at:&nbsp;</Text>
              <Text>
                {new Date(amount.tge + amount.duration).toLocaleDateString()}{" "}
                {new Date(amount.tge + amount.duration).toLocaleTimeString()}
              </Text>
            </Flex>

          </Flex>

        </AutoColumn>
      )
    }
    return (
      <Text color="textSubtle" textAlign="center">
        {t('No wallet available.')}
      </Text>
    )
  }

  return (
    <Page>
      <AppBody>
        <AppHeader title={t('Claim your token')} subtitle={t('Unlock and claim token')} />

        <Wrapper id="swap-page">
          {renderBody()}
        </Wrapper>

        <CardFooter style={{ textAlign: 'center' }}>
          <Button disabled={pending} id="join-pool-button" onClick={claimAction} as={Link} to="#" width="100%" startIcon={<AddIcon color="white" />}>
            {pending ? t('processing...') : t('Claim')}
          </Button>
        </CardFooter>
        {txHash &&
          <Flex mb="1px" flexDirection="column" alignItems="center" justifyContent="center">
            <Text bold>Transaction:&nbsp;</Text>
            <Text>
              <a href={`${TX_SCANERS[chainId]}${txHash}`} target="__blank">
                {txHash}
              </a>
            </Text>
          </Flex>

        }


      </AppBody>
    </Page>
  )
}

const StyledTh = styled.th`
  background: #eff4f5;
  padding: 8px;
  font-size: 12px;
  color: #8f80ba;

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding-left: 16px;
    text-align: left;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-left-radius: 4px;
    padding-right: 16px;
    text-align: right;
  }
`;

const Table = ({ _data }: { _data: LockedItemInterface[] }) => {

  function compare(a, b) {
    if (a.releaseDate < b.releaseDate) {
      return -1;
    }
    if (a.releaseDate > b.releaseDate) {
      return 1;
    }
    return 0;
  }
  const data = _data.sort(compare);

  return (
    <table width='100%'>
      <thead>
        <tr>
          <StyledTh align='left' data-testid='column-unlock-date'>
            Unlock date
          </StyledTh>
          <StyledTh align='right' data-testid='column-unlock-amount'>
            Unlock amount
          </StyledTh>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr data-testid={`row-${index}`} key={index}>
            <td>{formatDate(new Date(row.releaseDate * 1000))}</td>
            <td align='right'>{row.amountLockIndex?.toLocaleString(undefined, { maximumFractionDigits: 6 })} SING</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


export function formatDate(date: Date) {

  return new Intl.DateTimeFormat('en-US',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
}

export function formatDateTime(date: Date) {

  return new Intl.DateTimeFormat('en-US',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date).replace(',', '');
}

export const shortStr = (str: string) => {
  const len = str.length;
  const first = str.substring(0, 10)
  const last = str.substring(len - 10, len)
  return first + "..." + last
}