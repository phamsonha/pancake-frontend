/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable camelcase */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon, Radio, Tag } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import API from 'libs/api'
import { HistoryTransaction, SmartContractInterface } from 'types'
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

export default function BuyToken() {
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

  const { balance, fetchStatus } = useGetBnbBalance()

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
  const [contractList, setContractList] = useState<SmartContractInterface[]>([])
  const [amountSing, setAmountSing] = useState<number>(0)
  const [amountBNB, setAmountBNB] = useState<string>("0")
  const [ratio, setRatio] = useState<number>(0)
  const [priceSing, setPriceSing] = useState<number>()
  const [info, setInfo] = useState(" ")

  const [benefi, setBenefi] = React.useState<string>("")

  const getSmartContractList = async (network_id: number) => {
    setPending(true)
    await api.getSmartContract(network_id).then(
      (result) => {
        console.log("get Smart Contract success", result)
        setContractList(result)
        if (result.length > 0)
          setIndexContract(0)
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

  React.useEffect((): any => {

    if (chainId) {
      getSmartContractList(chainId)
    } else {
      setContractList(undefined)
    }

  }, [account, library, chainId])

  React.useEffect(() => {
    if (amountBNB !== undefined) {
      setAmountSing(parseFloat(amountBNB) * ratio)
      console.log("counting amount SING")
    }
  }, [amountBNB, ratio])

  React.useEffect(() => {

    ratioBNBSING()
    console.log("update Ratio BNBSING")

  }, [indexContract, contractList])


  const handleContractChange = (e) => {
    console.log(e.target.value)
    setIndexContract(e.target.value)
  }

  const handleAmountChange = (val) => {
    console.log(val)
    setAmountBNB(val === "" ? "0" : val)
    if (parseFloat(val) > parseFloat(formatBigNumber(balance, 6))) {
      setInfo("Amount is over balance")
    }
    else {
      setInfo(" ")
    }

  }

  const handleAddressChange = (val) => {
    console.log(val)
    setBenefi(val)

  }

  const onMax = () => {
    setAmountBNB(formatBigNumber(balance, 6))
  }

  const logTransaction = async (hi: HistoryTransaction) => {
    await api.postBuy(hi.hash, hi.from_address, hi.to_address,
      hi.amount, hi.amount_sing, hi.price_sing, hi.payment_method, hi.network_id).then(
        (result) => {
          if ("error" in result) {
            console.log("error", result)
            return
          }
          console.log("log transaction success", result)
        },
        (error) => {
          console.log(error?.message)
        }
      )
  }

  const isValidBuy = (benefi.length > 0
    && parseFloat(amountBNB) > 0
    && ratio && parseFloat(amountBNB) < parseFloat(formatBigNumber(balance, 6)))

  const handleSummit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setPending(true)
    if (web3 !== null && chainId !== undefined && account !== null && amountBNB && contractList) {
      await api.crowdSale(contractList[indexContract], web3, chainId, account, benefi, parseFloat(amountBNB)).then(
        (value) => {
          console.log(`crowSale return: ${value?.hash}`)
          // setType("success")
          // setMessage("Buy Success, please check your wallet")
          if (value?.hash === undefined) {
            console.log("Transaction failed, please try again.")
            return
          }

          // log transaction
          const hi: HistoryTransaction = {
            hash: value?.hash,
            from_address: value?.purchaser,
            to_address: value?.beneficiary,
            amount: parseFloat(amountBNB),
            amount_sing: value?.weiAmount,
            price_sing: priceSing,
            payment_method: "BNB",
            network_id: chainId,

          }

          logTransaction(hi)


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
          {t('Connect to a wallet to buy Sing token.')}
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
    if (contractList.length > 0) {
      return (
        <AutoColumn gap="md">
          <Flex mb="1px" alignItems="center" justifyContent="space-between">
            <Text bold>
              {t('Enter your BNB:')}
            </Text>
            <Text color="textSubtle">
              Balance: {balance ? formatBigNumber(balance, 6) : "loading"}
            </Text>
          </Flex>
          <InputPanel>
            <Container>
              <LabelRow>
                <RowBetween>
                  <NumericalInput
                    className="token-amount-input"
                    value={amountBNB}
                    onUserInput={(val) => {
                      handleAmountChange(val)
                    }}
                  />
                </RowBetween>
              </LabelRow>
              <InputRow selected>
                <Text color="red" fontSize='12px'>{info}</Text>
                {account && parseFloat(amountBNB) < parseFloat(formatBigNumber(balance, 6)) && (
                  <Button onClick={onMax} scale="xs" variant="secondary">
                    MAX
                  </Button>
                )}
              </InputRow>
            </Container>
          </InputPanel>

          <Flex mb="1px" alignItems="center" justifyContent="space-between">
            <Text bold>
              {t('Beneficiary:')}
            </Text>
          </Flex>
          <InputPanel>
            <Container>
              <LabelRow>
                <RowBetween>
                  <AddressInput
                    className="token-amount-input"
                    value={benefi}
                    onUserInput={(val) => {
                      handleAddressChange(val)
                    }}
                  />
                </RowBetween>
              </LabelRow>
            </Container>
          </InputPanel>

          <Flex mt="6px" alignItems="center" justifyContent="flex-start">
            <Text bold>
              {t('Beneficiary will get: ')}
            </Text>
            <Text color="textSubtle">
              {amountSing.toFixed(6)}&nbsp;SING
            </Text>
          </Flex>

          <Flex mb="6px" alignItems="center" justifyContent="flex-start">
            <Text bold>
              {t('Ratio: ')}
            </Text>
            <Text color="textSubtle">
              1&nbsp;BNB ≈ {ratio.toFixed(6)}&nbsp;SING
            </Text>
          </Flex>
          <div>
            <Text mb="6px" textAlign="center" bold>Invest at round</Text>
            {contractList && contractList.length > 0 && contractList.map((item, index) => (
              <Flex mb="6px" alignItems="center" justifyContent="flex-start">
                <Radio scale="sm" name="sm" value={index} onChange={handleContractChange} checked={indexContract === index} />
                <Tag variant="primary" outline ml="10px">
                  {item.name}
                </Tag>
              </Flex>
            ))}
            {indexContract !== undefined &&
              <div>
                <Text bold>SmartContract Address:&nbsp;</Text>
                <Text>{contractList[indexContract].address}</Text>
                <Text bold>Term:&nbsp;</Text>
                <Text color="red" fontSize='12px' style={{ whiteSpace: "pre-wrap", textAlign: 'left' }}>{contractList[indexContract].term}</Text>
              </div>
            }

          </div>
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
        <AppHeader title={t('Buy Sing Token')} subtitle={t('Get Sing Token on token sale round')} />
        <Wrapper id="swap-page">
          {renderBody()}
        </Wrapper>
        <CardFooter style={{ textAlign: 'center' }}>
          <Button disabled={!isValidBuy} id="join-pool-button" onClick={handleSummit} as={Link} to="#" width="100%" startIcon={<AddIcon color="white" />}>
            {t('Buy Sing Token')}
          </Button>
        </CardFooter>
      </AppBody>
    </Page>
  )
} 
