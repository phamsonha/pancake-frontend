/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { AbiItem } from "web3-utils";
import Web3 from 'web3';
import VestingABI from "./abi/TokenVesting.json";


const factoryContract = (web3: Web3, abi: any, account: string, address: string) => {
	// @ts-ignore
	
	const contract = new web3.eth.Contract(
		abi as AbiItem[],
		address,
		{ from: account }
	);
	return contract;
};

export const useVestingContract = (web3: Web3, account: string, address: string) => {
	return useMemo(() => factoryContract(web3, VestingABI.abi, account, address), [account]);
};