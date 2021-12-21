/* eslint-disable prefer-template */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon, Radio, Tag, Checkbox, Box, useTable, ColumnType } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import API from 'libs/api'
import { HistoryTransaction, HistoryTransfer, LockedItemInterface, SmartContractInterface } from 'types'
import { AutoColumn } from 'components/Layout/Column'
import { RowBetween } from 'components/Layout/Row'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { formatBigNumber } from 'utils/formatBalance'
import Web3 from 'web3';
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePairs } from '../../hooks/usePairs'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import Dots from '../../components/Loader/Dots'
import { AppHeader, AppBody } from '../../components/App'
import Page from '../Page'
import { Input as NumericalInput, AddressInput } from './NumericalInput'
import CopyAddress from './CopyAddress'

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

export default function CheckSing() {
  const { account, chainId, library } = useActiveWeb3React()
  const { t } = useTranslation()
  const api = new API()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs],
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)


  // get smartcontract list from Server SING
  const [pending, setPending] = useState(false)
  const [address, setAddress] = useState("")

  const [type, setType] = useState<"error" | "warning" | "info" | "success">("success")
  const [message, setMessage] = useState("")
  const [_open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }


  const [lockedAmount, setLockedAmount] = useState<number>()
  const [availableBalance, setAvailableBalance] = useState<number>()
  const [numLockAddress, setNumLockAddress] = useState<number>()
  const [totalLockAmount, setTotalLockAmount] = useState<number>()
  const [lockItem, setLockedItem] = useState<LockedItemInterface[]>([])

  useEffect(() => {

    if (account) {
      setAddress(account)
    }

  }, [account])

  const handleAddressChange = (val) => {
    console.log(val)
    setAddress(val)

  }

  const handleSummit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (chainId === undefined || account === null) {
      return
    }
    if (address.length === 0) {
      setType("error")
      setMessage("Address null")
      setOpen(true)
      return
    }
    setPending(true)
    if (web3 != null && account) {
      await api.getLockedAmount(web3, chainId, account, address).then(
        (value) => {
          setLockedAmount(value?.amount)
        }).catch((error) => {
          console.error(error)
        })
      await api.callBalanceAvailableSing(web3, chainId, account, address).then(
        (value) => {
          setAvailableBalance(value?.balanceAvailable)
        }).catch((error) => {
          console.error(error)
        })
      await api.getNumberOfLockedAddressesCurrently(web3, chainId, account).then(
        (value) => {
          setNumLockAddress(value?.result)
        }).catch((error) => {
          console.error(error)
        })
      await api.getLockedAmountTotal(web3, chainId, account).then(
        (value) => {
          setTotalLockAmount(value?.result)
        }).catch((error) => {
          console.error(error)
        })
      await api.getLockedItem(web3, chainId, account, address).then(
        (value) => {
          console.log("value", value)
          setLockedItem(value?.item)
        }).catch((error) => {
          console.error(error)
        })

    }
    setPending(false)

  }

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to Check Token.')}
        </Text>
      )
    }
    if (v2IsLoading) {
      return (
        <Text color="textSubtle" textAlign="center">
          <Dots>{t('Loading')}</Dots>
        </Text>
      )
    }
    if (account) {
      return (
        <AutoColumn gap="md">
          <Flex mb="1px" alignItems="center" justifyContent="space-between">
            <Text bold>
              {t('Address:')}
            </Text>
          </Flex>
          <InputPanel>
            <Container>
              <LabelRow>
                <RowBetween>
                  <AddressInput
                    className="token-amount-input"
                    value={address}
                    onUserInput={(val) => {
                      handleAddressChange(val)
                    }}
                  />
                </RowBetween>
              </LabelRow>
            </Container>
          </InputPanel>

          <Flex alignItems="flex-start" flexDirection="column">
            {lockedAmount !== undefined &&
              <Flex mb="1px" alignItems="center" justifyContent="space-between">
                <Text bold>Lock amount:&nbsp;</Text>
                <Text>{lockedAmount?.toLocaleString(undefined, { maximumFractionDigits: 6 })} SING</Text>
              </Flex>
            }
            {availableBalance !== undefined &&
              <Flex mb="1px" alignItems="center" justifyContent="space-between">
                <Text bold>Available balance:&nbsp;</Text>
                <Text>{availableBalance?.toLocaleString(undefined, { maximumFractionDigits: 6 })} SING</Text>
              </Flex>
            }

            {(lockItem && lockItem.length > 0) &&
              <Flex alignItems="center" width='100%' flexDirection="column">
                <Text bold>Locked list of {shortStr(address)}</Text>
                <Table _data={lockItem} />;
              </Flex>
            }

            {numLockAddress !== undefined &&
              <span>System: Total number of locked addresses: {numLockAddress?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>

            }
            {totalLockAmount !== undefined &&
              <span>System: Total locked amount: {totalLockAmount?.toLocaleString(undefined, { maximumFractionDigits: 6 })} SING</span>

            }

          </Flex>

        </AutoColumn>
      )
    }
    return (
      <Text color="textSubtle" textAlign="center">
        {t('No token sale round found.')}
      </Text>
    )
  }

  return (
    <Page>
      <AppBody>
        <AppHeader title={t('Check lock address')} subtitle={t('Check Sing Token status')} />

        <Wrapper id="swap-page">
          {renderBody()}
        </Wrapper>

        <CardFooter style={{ textAlign: 'center' }}>
          <Button disabled={pending || address===""} id="join-pool-button" onClick={handleSummit} as={Link} to="#" width="100%" startIcon={<AddIcon color="white" />}>
            {pending ? t('processing...') : t('Check')}
          </Button>
        </CardFooter>

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
  
  function compare( a, b ) {
    if ( a.releaseDate < b.releaseDate ){
      return -1;
    }
    if ( a.releaseDate > b.releaseDate ){
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