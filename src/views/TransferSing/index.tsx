/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon, Radio, Tag, Checkbox, Box } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import API from 'libs/api'
import { HistoryTransaction, HistoryTransfer, SmartContractInterface } from 'types'
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

export default function TransferSing() {
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

  let myDate = new Date();

  const [balance, setBalance] = React.useState<number>()
  const [balanceAvailable, setBalanceAvailable] = React.useState<number>()
  const [locker, setLocker] = React.useState(false)

  const [amountSing, setAmountSing] = useState("0")
  const [unlock, setUnlock] = useState(false)
  const [dateUnlock, setDateUnlock] = useState(myDate)

  const [info, setInfo] = useState(" ")
  const [option, setOption] = useState<"Days" | "Months" | "Timestamp">()
  const [benefi, setBenefi] = React.useState<string>("")
  const [isDateValid, setIsDateValid] = useState(true)

  const handleDateChange = (value: number, option: any) => {
    if (value <= 0) {
      setIsDateValid(false)
      return
    }

    setIsDateValid(true)

    let my_date = new Date()
    setOption(option)
    switch (option) {
      case "Days": {
        my_date.setDate(my_date.getDate() + value)
        break;
      }
      case "Months": {
        my_date.setMonth(my_date.getMonth() + value)
        break;
      }
      case "Timestamp": {
        my_date = new Date(value * 1000)
        break;
      }
      default:
        break;
    }
    setDateUnlock(my_date)
  }

  const handleCheck = () => {
    setUnlock(!unlock)
    setOption("Months")
    setIsDateValid(true)
    myDate.setMonth(myDate.getMonth() + 6);
    setDateUnlock(myDate)
  }

  const handleAmountChange = (val) => {
    console.log(val)
    setAmountSing(val === "" ? "0" : val)
    if (parseFloat(val) > balanceAvailable) {
      setInfo("Amount is over available balance")
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
    // setAmountBNB(formatBigNumber(balance, 6))
  }

  const logTransaction = async (hi: HistoryTransfer) => {
    await api.postTransfer(hi.hash, hi.from_address, hi.to_address,
      hi.amount, hi.network_id).then(
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

  const handleSummit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!isDateValid) {
      return
    }
    setPending(true)
    if (web3 != null && benefi.length > 0 && amountSing && balanceAvailable && (parseFloat(amountSing) <= balanceAvailable)) {

      if (unlock && locker) {
        const releaseDate = Math.floor(+dateUnlock / 1000)
        console.log("releaseDay", releaseDate)
        await api.transferAndLock(web3, chainId, account, benefi, parseFloat(amountSing), releaseDate).then(
          (value) => {
            console.log(`transferAndLock return: ${value?.hash}`)

            // log transaction
            let hi: HistoryTransfer = {
              hash: value?.hash,
              from_address: value?.sender,
              to_address: value?.recipient,
              amount: value?.amount,
              network_id: chainId,

            }

            logTransaction(hi)

          }).catch((error) => {
            console.error(error)
          })
      } else if (!unlock) {
        await api.transfer(web3, chainId, account, benefi, parseFloat(amountSing)).then(
          (value) => {
            console.log(`transfer return: ${value?.hash}`)

            // log transaction
            let hi: HistoryTransfer = {
              hash: value?.hash,
              from_address: value?.sender,
              to_address: value?.recipient,
              amount: value?.amount,
              network_id: chainId,

            }

            logTransaction(hi)

            getBalanceAvailable()

          }).catch((error) => {
            console.error(error)
          })
      }
    }
    setPending(false)
  }

  const [sing_address, setSingAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const getBalanceAvailable = async () => {
    setLoading(true)

    if (chainId) {
      await api.getContractAddress(chainId, "SingSingV4").then(
        (result) => {
          setSingAddress(result)
        },
        (error) => {
          console.log(error)
        }
      )
    }

    if (web3 != null && account) {
      await api.callBalanceOfSing(web3, chainId, account).then(
        (value) => {
          // console.log(`crowSale return: ${value?.balanceOf}`)
          setBalance(value?.balanceOf)
        }).catch((error) => {
          console.error(error)
        })

      await api.callBalanceAvailableSing(web3, chainId, account, account).then(
        (value) => {
          // console.log(`crowSale return: ${value?.balanceAvailable}`)
          setBalanceAvailable(value?.balanceAvailable)
        }).catch((error) => {
          console.error(error)
        })

      await api.isLockerAddress(web3, chainId, account).then(
        (value) => {
          // console.log(`isLockerAddress: ${value?.result}`)
          setLocker(value?.result)
        }).catch((error) => {
          console.error(error)
        })


    } else {
      setBalance(0)
      setBalanceAvailable(0)
    }
    setLoading(false)
  }


  useEffect(() => {
    // connectToWeb3()
    console.log("initValue", balanceAvailable, balance, loading)
    if (!loading) {
      getBalanceAvailable()
    }

    console.log("useEffect render")
  }, [account]) // eslint-disable-line react-hooks/exhaustive-deps

  const isValidTransfer = (parseFloat(amountSing) > 0
    && benefi !== ""
    && !pending && balanceAvailable > 0
    && isDateValid
  )

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          {t('Connect to a wallet to transfer Token.')}
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
          <Flex mb="1px" alignItems="flex-start" flexDirection="column" justifyContent="space-between">
            <Text bold>
              {t('Total balance')}:&nbsp;{balance ? `${balance.toFixed(6)} SING` : "loading"}
            </Text>
            <Text color="textSubtle">
              {t('Balance avaliable')}:&nbsp;{balanceAvailable ? `${balanceAvailable.toFixed(6)} SING` : "loading"}
            </Text>
          </Flex>

          <Flex mb="1px" alignItems="center" justifyContent="space-between">
            <Text bold>
              {t('Transfer amount:')}
            </Text>
          </Flex>
          <InputPanel>
            <Container>
              <LabelRow>
                <RowBetween>
                  <NumericalInput
                    className="token-amount-input"
                    value={amountSing}
                    onUserInput={(val) => {
                      handleAmountChange(val)
                    }}
                  />
                </RowBetween>
              </LabelRow>
              <InputRow selected>
                <Text color="red" fontSize='12px'>{info}</Text>
                {account && parseFloat(amountSing) < balance && (
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

          {!loading && locker &&
            <div>
              <div className="d-flex mb-3 mt-2">
                <Flex mb="1px" alignItems="center">
                  <Checkbox scale="sm" onChange={handleCheck} checked={unlock} />
                  <Text bold>&nbsp;Set Unlock date</Text>
                </Flex>
                {unlock &&
                  <Text bold textAlign="center">
                    {option === "Timestamp" ? formatDateTime(dateUnlock) : formatDate(dateUnlock)}
                  </Text>
                }

              </div>
              {unlock &&
                <UnlockDate handleDateChange={handleDateChange} />
              }
            </div>
          }


          <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mt="8px" mb="8px">
            {t('Contract Address')}
          </Text>
          <CopyAddress account={sing_address} mb="24px" />


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
        <AppHeader title={t('Transfer Sing Token')} subtitle={t('Lock and Transfer Sing Token')} />
        <Wrapper id="swap-page">
          {renderBody()}
        </Wrapper>
        <CardFooter style={{ textAlign: 'center' }}>
          <Button disabled={!isValidTransfer} id="join-pool-button" onClick={handleSummit} as={Link} to="#" width="100%" startIcon={<AddIcon color="white" />}>
            {pending ? t('processing...') : t('Transfer Sing Token')}
          </Button>
        </CardFooter>
      </AppBody>
    </Page>
  )
}

const Wrapper2 = styled(Flex)`
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  border-radius: 16px;
  position: relative;
`

const InputWrap = styled.div`
  flex: 1;
  position: relative;
  padding-left: 16px;

  & > input {
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.text};
    display: block;
    font-weight: 600;
    font-size: 16px;
    padding: 0;
    width: 100%;

    &:focus {
      outline: 0;
    }
  }
`

const SelectWrap = styled.div`
  flex: 1;
  position: relative;
  padding-left: 16px;

  & > select {
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.text};
    display: block;
    font-weight: 600;
    font-size: 16px;
    padding: 0;
    width: 100%;

    &:focus {
      outline: 0;
    }
  }
  
`
const OptionWrap = styled.option`
  
  box-shadow: ${({ theme }) => theme.shadows.inset};
  background-color: ${({ theme }) => theme.colors.input};
  border: 0;
  color: ${({ theme }) => theme.colors.text};
  display: block;
  font-weight: 600;
  font-size: 16px;
  padding: 0;
  width: 100%;

  &:focus {
    outline: 0;
  }
  
`

const UnlockDate = ({ handleDateChange }: { handleDateChange: (arg0: any, arg1: any) => void }) => {
  const options = [
    { title: "Days", id: 0 },
    { title: "Months", id: 1 },
    { title: "Timestamp", id: 2 }
  ]

  const [option, setOption] = React.useState('Months');
  const [value, setValue] = useState(6)

  const handleChange = (event) => {
    setOption(event.target.value);
    handleDateChange(value, event.target.value)
  };

  const handleChangeValue = (event) => {
    const value = Number(event.target.value);
    if (value <= 0) {
      setMessage("Value must be greater zero")
    } else {
      setMessage(" ")
    }
    setValue(value);
    handleDateChange(value, option)
  };

  const [message, setMessage] = useState(" ")

  return (

    <Box position="relative">
      <Wrapper2>
        <InputWrap>
          <input onChange={handleChangeValue} value={value} type="number" min="0" id="value" placeholder="60" />
          <Text color="red">{message}</Text>
        </InputWrap>
        <SelectWrap>
          <select
            id="standard-select-currency"
            value={option}
            onChange={handleChange}
          >
            {options.map((option) => (
              <OptionWrap key={option.id} value={option.title}>
                {option.title}
              </OptionWrap >
            ))}
          </select >
        </SelectWrap>
      </Wrapper2>


    </Box>

  )
}

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