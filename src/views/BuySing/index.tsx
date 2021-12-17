/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable camelcase */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, Pair } from '@pancakeswap/sdk'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import API from 'libs/api'
import { SmartContractInterface } from 'types'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { Field } from 'state/swap/actions'
import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePairs } from '../../hooks/usePairs'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import Dots from '../../components/Loader/Dots'
import { AppHeader, AppBody } from '../../components/App'
import Page from '../Page'

const Body = styled(CardBody)`
  background-color: ${({ theme }) => theme.colors.dropdownDeep};
`

export default function Pool() {
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

  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])


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
  const [indexContract, setIndexContract] = useState(0)
  const [contractList, setContractList] = useState<SmartContractInterface[]>()
  const [balance, setBalance] = React.useState<number>()
  const [amountSing, setAmountSing] = useState<number>()
  const [amountBNB, setAmountBNB] = useState<number>()
  const [ratio, setRatio] = useState<number>(0)
  const [priceSing, setPriceSing] = useState<number>()

  const getSmartContractList = async (network_id: number) => {
    setPending(true)
    await api.getSmartContract(network_id).then(
      (result) => {
        console.log("get Smart Contract success", result)
        setContractList(result)
      },
      (error) => {
        console.log(error?.message)
      }
    )
    setPending(false)
  }
  const ratioBNBSING = async () => {
    let bnbusdt = 0
    let singusdt = 0
    // setLoading(true)
    if (contractList && contractList.length > 0) {
      setPriceSing(contractList[indexContract].sing_rate)
      singusdt = contractList[indexContract].sing_rate
    } else {
      setPriceSing(0)
      singusdt = 0
    }

    await api.getPriceBinace("BNBUSDT").then(
      (result) => {
        bnbusdt = Number(result.price)
      },
      (error) => {
        console.log(error.message)
      }
    )

    console.log(bnbusdt, singusdt)
    if (bnbusdt > 0 && singusdt > 0) {
      setRatio(bnbusdt / singusdt)
    } else {
      setRatio(0)
    }
    // setLoading(false)
  }

  const getBalance = async () => {
    if (maxAmountInput) {
      setBalance(parseFloat(maxAmountInput.toExact()))
    }
  }

  React.useEffect((): any => {

    if (chainId) {
      getSmartContractList(chainId)
    } else {
      setContractList(undefined)
    }

    if (!!account && !!library) {

      getBalance()
    }
  }, [account, library, chainId])

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to view your liquidity.')}
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
    if (contractList) {
      return (
        <>
          <Text>
            {t('ChainID:')}{chainId}
          </Text>
        </>
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
        <AppHeader title={t('Buy Sing Token')} subtitle={t('Get Sing Token on token sale round')} />
        <Body>
          {renderBody()}
        </Body>
        <CardFooter style={{ textAlign: 'center' }}>
          <Button id="join-pool-button" as={Link} to="#" width="100%" startIcon={<AddIcon color="white" />}>
            {t('Buy Sing Token')}
          </Button>
        </CardFooter>
      </AppBody>
    </Page>
  )
}
