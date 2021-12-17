/* eslint-disable no-alert */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable prefer-const */
/* eslint-disable class-methods-use-this */
/* eslint-disable array-callback-return */
import { parseEther } from "ethers/lib/utils";
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import { formatEther } from '@ethersproject/units';
import { HistoryTransaction, LockedItemInterface, OrderBookResponse, SmartContractInterface } from "types";
import APIBase from './apiBase';
import { HistoryTransfer, Metadata } from '../types';

export interface IContract {
    network?: number,
    abi?: any,
    contract?: string,
    address?: string,
    fileJson?: string
}

export default class API extends APIBase {

    sleep(ms: number): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public async getNumberOfLockedAddressesCurrently(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,): Promise<{ result: number }> {

        let result = 0
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                if (objContract != null) {
                    let contract = new web3.eth.Contract(
                        (objContract as IContract).abi as AbiItem[],
                        (objContract as IContract).address,
                        { from: account }
                    );

                    await contract.methods.getNumberOfLockedAddressesCurrently().call(
                        function (error: any, value: any) {
                            if (!error) {
                                console.log(`numberLockedAddr: ${value}`)
                                result = value
                            }
                            else console.error(error)
                        }
                    )

                }

            })
        }
        return { result: result }
    }

    public async getLockedAmountTotal(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,): Promise<{ result: number }> {

        let result = 0
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.getLockedAmountTotal().call(
                    function (error: any, value: any) {
                        if (!error) {
                            console.log(`lockedAmountTotal: ${value}`)
                            result = value
                        }
                        else console.error(error)
                    }
                )
            })
        }
        return { result: Number(formatEther(result)) }
    }

    public async owner(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,): Promise<{ result: string }> {

        let result = ""
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.owner().call(
                    function (error: any, value: any) {
                        if (!error) {
                            console.log(`ownerAddress: ${value}`)
                            result = value
                        }
                        else console.error(error)
                    }
                )
            })
        }
        return { result: result }
    }

    public async isLockerAddress(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,): Promise<{ result: boolean }> {

        let result = false
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.isLockerAddress(account).call(
                    function (error: any, success: any) {
                        if (!error) {
                            console.log(`isLockerAddress: ${success}`)
                            result = success
                        }
                        else console.error(error)
                    }
                )
            })
        }
        return { result: result }
    }

    public async postTransfer(
        hash: string | undefined,
        from_address: string | undefined,
        to_address: string | undefined,
        amount: number | undefined,
        network_id: number | undefined,
    ): Promise<any> {
        const result = await this.post(
            `${process.env.REACT_APP_BUY_API}/transfer`,
            {
                hash: hash,
                from_address: from_address,
                to_address: to_address,
                amount: amount,
                network_id: network_id,
            }
        )
        return result
    }

    public async getTransferHistory(address: string | undefined, network_id: number | undefined, page = 1): Promise<{ total: number, transactions: HistoryTransfer[] }> {
        const result = await this.get(
            `${process.env.REACT_APP_BUY_API}/transfer/history`,
            {
                address: address,
                network_id: network_id,
                page: page,
            }
        )
        return {
            total: result.total,
            transactions: result.transactions,
        }
    }

    public async getContractAddress(network_id: number, name: string): Promise<string> {
        const result = await this.get(
            `${process.env.REACT_APP_BUY_API}/sing/contract-address`,
            {
                network_id: network_id,
                name: name
            }
        )
        return result?.address
    }

    public async getSmartContract(network_id: number): Promise<SmartContractInterface[]> {
        const result = await this.get(
            `${process.env.REACT_APP_BUY_API}/sing/smart-contract`,
            {
                network_id: network_id
            }
        )
        return result as SmartContractInterface[]
    }

    public async postBuy(
        hash: string | undefined,
        from_address: string | undefined,
        to_address: string | undefined,
        amount: number | undefined,
        amount_sing: number | undefined,
        price_sing: number | undefined,
        payment_method: string | undefined,
        network_id: number | undefined,
    ): Promise<any> {
        const result = await this.post(
            `${process.env.REACT_APP_BUY_API}/buy`,
            {
                hash: hash,
                from_address: from_address,
                to_address: to_address,
                amount: amount,
                amount_sing: amount_sing,
                price_sing: price_sing,
                payment_method: payment_method,
                network_id: network_id,
            }
        )
        return result
    }

    public async getBuyHistory(address: string | undefined, network_id: number | undefined, page = 1): Promise<{ total: number, transactions: HistoryTransaction[] }> {
        const result = await this.get(
            `${process.env.REACT_APP_BUY_API}/buy/history`,
            {
                address: address,
                network_id: network_id,
                page: page,
            }
        )
        return {
            total: result.total,
            transactions: result.transactions,
        }
    }

    public async setLockAddress(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string,
        state: boolean): Promise<{
            hash: string | undefined
        }> {

        let hash = ""
        if (chainId !== undefined && account !== null && address.length > 0) {

            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.setLockerAddress(address, state).send(
                    function (error: any, transactionHash: any) {
                        if (!error) {
                            console.log(`send tx: ${transactionHash}`)
                            hash = transactionHash
                        }
                        else console.error(error)
                    }
                );

            })
        }
        if (hash.length > 0)
            return {
                hash: hash,
            }

        return {
            hash: undefined,
        }
    }

    public async transferAndLock(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string,
        amountSing: number,
        releaseDate: number): Promise<{
            hash: string | undefined
            sender: string | undefined,
            recipient: string | undefined,
            amount: number | undefined,
        }> {

        let hash = ""
        if (chainId !== undefined && account !== null && address.length > 0) {
            let sender: any; let recipient: any; let amount: any
            // convert to wei
            let totalBN = parseEther(amountSing.toString())

            let result: boolean = false

            console.log(`Total Allocation wei: ${totalBN.toString()} hex: ${totalBN.toHexString()} `)

            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                contract.events
                    .Transfer()
                    .on("data", (event: any) => {
                        console.log("Transfer success");
                        console.log(event);
                        sender = event.returnValues.from;
                        recipient = event.returnValues.to;
                        amount = event.returnValues.value;

                        result = true
                    })
                    .on("error", console.error);

                await contract.methods.transferAndLock(address, totalBN, releaseDate).send(
                    function (error: any, transactionHash: any) {
                        if (!error) {
                            console.log(`send tx: ${transactionHash}`)
                            hash = transactionHash
                        }
                        else {
                            console.error(error)
                            result = true
                        }
                    }
                );

                // check approval
                let tryCount = 0
                while (result === false) {
                    tryCount++
                    if (tryCount > 20) {
                        console.log("Wait for transaction too long")
                        break
                    }

                    await this.sleep(1000);
                }

            })
            if (amount)
                return {
                    hash: hash,
                    sender: sender,
                    recipient: recipient,
                    amount: Number(formatEther(amount)),
                }
        }
        return {
            hash: undefined,
            sender: undefined,
            recipient: undefined,
            amount: undefined,
        }
    }

    public async transferAndVesting(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        addressTo: string,
        amountTotal: number,
        amountTge: number,
        tgeDate: number,
        vestingDate: number,
        vestingMonths: number): Promise<{
            hash: string | undefined
            sender: string | undefined,
            recipient: string | undefined,
            amount: number | undefined,
        }> {

        let hash = ""
        if (chainId !== undefined && account !== null && addressTo.length > 0) {
            let sender; let recipient; let amount
            // convert to wei
            let totalBN = parseEther(amountTotal.toString())
            let totalTGE = parseEther(amountTge.toString())

            let result: boolean = false

            console.log(`Total Allocation wei: ${totalBN.toString()} Vesting: ${totalTGE.toString()} `)

            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                contract.events
                    .Transfer()
                    .on("data", (event: any) => {
                        console.log("Transfer success");
                        console.log(event);
                        sender = event.returnValues.from;
                        recipient = event.returnValues.to;
                        amount = event.returnValues.value;

                        result = true
                    })
                    .on("error", console.error);

                await contract.methods.transferAndVesting(addressTo, totalBN, totalTGE,
                    tgeDate, vestingDate, vestingMonths).send(
                        function (error: any, transactionHash: any) {
                            if (!error) {
                                console.log(`send tx: ${transactionHash}`)
                                hash = transactionHash
                            }
                            else {
                                console.error(error)
                                result = true
                            }
                        }
                    );

                // check approval
                let tryCount = 0
                while (result === false) {
                    tryCount++
                    if (tryCount > 20) {
                        console.log("Wait for transaction too long")
                        break
                    }

                    await this.sleep(1000);
                }

            })
            if (amount)
                return {
                    hash: hash,
                    sender: sender,
                    recipient: recipient,
                    amount: Number(formatEther(amount)),
                }
        }
        return {
            hash: undefined,
            sender: undefined,
            recipient: undefined,
            amount: undefined,
        }
    }

    public async transfer(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string,
        amountSing: number): Promise<{
            hash: string | undefined
            sender: string | undefined,
            recipient: string | undefined,
            amount: number | undefined,
        }> {

        let hash = ""
        if (chainId !== undefined && account !== null && address.length > 0) {
            let sender; let recipient; let amount
            // convert to wei
            let totalBN = parseEther(amountSing.toString())

            let result: boolean = false

            console.log(`Total Allocation wei: ${totalBN.toString()} hex: ${totalBN.toHexString()} `)

            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                contract.events
                    .Transfer()
                    .on("data", (event: any) => {
                        console.log("Transfer success");
                        console.log(event);
                        sender = event.returnValues.from;
                        recipient = event.returnValues.to;
                        amount = event.returnValues.value;

                        result = true
                    })
                    .on("error", console.error);

                await contract.methods.transfer(address, totalBN).send(
                    function (error: any, transactionHash: any) {
                        if (!error) {
                            console.log(`send tx: ${transactionHash}`)
                            hash = transactionHash
                        }
                        else {
                            console.error(error)
                            result = true
                        }
                    }
                );

                // check approval
                let tryCount = 0
                while (result === false) {
                    tryCount++
                    if (tryCount > 20) {
                        console.log("Wait for transaction too long")
                        break
                    }

                    await this.sleep(1000);
                }

            })
            if (sender)
                return {
                    hash: hash,
                    sender: sender,
                    recipient: recipient,
                    amount: amount ? Number(web3.utils.fromWei(amount, 'ether')) : undefined,
                }
        }

        return {
            hash: undefined,
            sender: undefined,
            recipient: undefined,
            amount: undefined,
        }
    }

    public async callBalanceOfSing(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,): Promise<{ balanceOf: number | undefined }> {

        let balance
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.balanceOf(account).call(
                    function (error: any, _amount: any) {
                        if (!error) {
                            console.log(`amount avalilable: ${_amount}`)
                            balance = _amount
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (balance) {
            return { balanceOf: Number(formatEther(balance)) }
        }
        return { balanceOf: undefined }
    }

    public async callBalanceOfErc721(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string | null): Promise<{ balanceOf: number | undefined }> {

        let balance
        if (chainId !== undefined && account !== null && address !== null) {
            await this.getContractErc721(chainId, address).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.balanceOf(account).call(
                    function (error: any, _amount: any) {
                        if (!error) {
                            console.log(`amount avalilable: ${_amount}`)
                            balance = _amount
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (balance) {
            return { balanceOf: Number(balance) }
        }
        return { balanceOf: undefined }
    }

    public async isApprovedForAllErc721(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string | null,
        operator: string | null): Promise<{ isApproved: boolean }> {

        let isApproved = false
        if (chainId !== undefined && account !== null && address !== null && operator) {
            await this.getContractErc721(chainId, address).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.isApprovedForAll(account, operator).call(
                    function (error: any, _isApproved: any) {
                        if (!error) {
                            console.log(`isAprroved value: ${_isApproved}`)
                            isApproved = _isApproved
                        }
                        else console.error(error)
                    }
                )
            })
        }
        return { isApproved: isApproved }
    }

    public async getTokenURIErc721(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string | null,
        tokenId: number): Promise<{ uri: string | undefined }> {

        let uri
        if (chainId !== undefined && account !== null && address !== null) {
            await this.getContractErc721(chainId, address).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.tokenURI(tokenId).call(
                    function (error: any, _uri: any) {
                        if (!error) {
                            console.log(`URI avalilable: ${_uri}`)
                            uri = _uri
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (uri) {
            return { uri: uri }
        }
        return { uri: undefined }
    }

    public async getTokenURIListErc721(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string | null,
        tokenIdList: number[]): Promise<{ uri: string[] }> {

        let uri: string[] = []
        if (chainId !== undefined && account !== null && address !== null) {
            await this.getContractErc721(chainId, address).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );
                for (let i = 0; i < tokenIdList.length; i++) {
                    await contract.methods.tokenURI(tokenIdList[i]).call(
                        // eslint-disable-next-line no-loop-func
                        function (error: any, _uri: any) {
                            if (!error) {
                                console.log(`URI avalilable: ${_uri}`)
                                uri = [...uri, _uri]
                            }
                            else console.error(error)
                        }
                    )
                }
            })
        }
        return { uri: uri }
    }

    public async getLockedAmount(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string): Promise<{ amount: number | undefined }> {

        let balance
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.getLockedAmount(address).call(
                    function (error: any, _amount: any) {
                        if (!error) {
                            console.log(`locked Amount avalilable: ${_amount}`)
                            balance = _amount
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (balance) {
            return { amount: Number(formatEther(balance)) }
        }
        return { amount: undefined }
    }


    public async getLockedItem(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string): Promise<{ item: LockedItemInterface[] }> {

        let item: LockedItemInterface[] = []
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.getLockedItem(address).call(
                    function (error: any, _amount: any[]) {
                        if (!error) {
                            console.log(`locked Item: ${_amount}`)
                            item = [..._amount]
                            console.log(item)
                        }
                        else console.error(error)
                    }
                )

                let temp: LockedItemInterface[] = []
                await Promise.all(
                    item.map(async (row, index) => {

                        await contract.methods.getLockedAmountByIndex(row.amountLockIndex).call(
                            function (error: any, _amount: any) {
                                if (!error) {
                                    console.log(`lockedAmountItemByIndex: ${_amount}`);
                                    const t: LockedItemInterface = {
                                        amountLockIndex: Number(formatEther(_amount)),
                                        releaseDate: row.releaseDate
                                    };
                                    temp.push(t)

                                }
                                else {
                                    console.error(error);
                                }

                            }
                        );
                    })
                )

                item = [...temp]
                console.log("item new", temp)

            })
        }

        return { item: item }
    }

    public async getLockedAmountByIndex(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        index: number): Promise<{ balanceAvailable: number | undefined }> {

        let balance
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.getLockedAmountByIndex(index).call(
                    function (error: any, _amount: any) {
                        if (!error) {
                            console.log(`amount : ${_amount}`)
                            balance = _amount
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (balance) {
            return { balanceAvailable: Number(formatEther(balance)) }
        }
        return { balanceAvailable: undefined }
    }

    public async getTokenOfOwnerByIndex(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string | null,
        totalIndex: number): Promise<{ tokenId: number[] }> {

        let tokenId: number[] = []
        if (chainId !== undefined && account !== null && address !== null) {
            await this.getContractErc721(chainId, address).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );
                for (let index = 0; index < totalIndex; index++) {
                    await contract.methods.tokenOfOwnerByIndex(account, index).call(
                        // eslint-disable-next-line no-loop-func
                        function (error: any, _tokenId: any) {
                            if (!error) {
                                console.log(`tokenId : ${_tokenId}`)
                                tokenId = [...tokenId, _tokenId]
                            }
                            else console.error("methods log", error)
                        }
                    )
                }

            })
        }
        return { tokenId: tokenId }
    }

    public async callBalanceAvailableSing(
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string): Promise<{ balanceAvailable: number | undefined }> {

        let balance
        if (chainId !== undefined && account !== null) {
            await this.getContract(chainId, "SingSing").then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                await contract.methods.getAvailableBalance(address).call(
                    function (error: any, _amount: any) {
                        if (!error) {
                            console.log(`amount avalilable: ${_amount}`)
                            balance = _amount
                        }
                        else console.error(error)
                    }
                )
            })
        }
        if (balance) {
            return { balanceAvailable: Number(formatEther(balance)) }
        }
        return { balanceAvailable: undefined }
    }

    public async crowdSale(
        smartcontract: SmartContractInterface,
        web3: Web3,
        chainId: number | undefined,
        account: string | null | undefined,
        address: string,
        valueBNB: number): Promise<{
            hash: string | undefined
            purchaser: string | undefined,
            beneficiary: string | undefined,
            weiAmount: number | undefined,
            tokens: number | undefined
        }> {

        let hash = ""
        if (chainId !== undefined && account !== null && address.length > 0) {
            let purchaser; let beneficiary; let weiAmount; let tokens
            // convert to wei
            let totalBN = parseEther(valueBNB.toString())

            let result: boolean = false

            console.log(`Total Allocation wei: ${totalBN.toString()} hex: ${totalBN.toHexString()} `)

            await this.getContractCrow(smartcontract).then(async (objContract) => {
                let contract = new web3.eth.Contract(
                    (objContract as IContract).abi as AbiItem[],
                    (objContract as IContract).address,
                    { from: account }
                );

                /* contract.events
                    .TokensPurchased()
                    .on("data", (event: any) => {
                        console.log("Buy success");
                        console.log(event);
                        purchaser = event.returnValues.purchaser;
                        beneficiary = event.returnValues.beneficiary;
                        weiAmount = event.returnValues.amount;
                        tokens = event.returnValues.value;

                        result = true

                    })
                    .on("error", console.error); */
                contract.once("TokensPurchased", {},
                    function (error, event) {
                        if (!error) {
                            console.log(event);
                            purchaser = event.returnValues.purchaser;
                            beneficiary = event.returnValues.beneficiary;
                            weiAmount = event.returnValues.amount;
                            tokens = event.returnValues.value;

                            result = true

                        }
                        else {
                            console.log(error)
                        }
                    }
                );


                await contract.methods.buyTokens(address).send(
                    {
                        value: totalBN,

                    }, function (error: any, transactionHash: any) {
                        if (!error) {
                            console.log(`send tx: ${transactionHash}`)
                            hash = transactionHash
                        }
                        else {
                            console.error(error)
                            result = true
                        }
                    }
                );


                // check approval
                let tryCount = 0
                while (result === false) {
                    tryCount++
                    if (tryCount > 20) {
                        console.log("Wait for transaction too long")
                        break
                    }

                    await this.sleep(1000);
                }

            })
            console.log(purchaser, beneficiary, weiAmount, tokens)
            if (purchaser)
                return {
                    hash: hash,
                    purchaser: purchaser,
                    beneficiary: beneficiary,
                    weiAmount: weiAmount ? Number(web3.utils.fromWei(weiAmount, 'ether')) : undefined,
                    tokens: tokens
                }
        }
        return {
            hash: undefined,
            purchaser: undefined,
            beneficiary: undefined,
            weiAmount: undefined,
            tokens: undefined
        }
    }

    // https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT
    public async getPriceBinace(symbol = "BNBUSDT"): Promise<any> {
        const result = await this.get(
            `${process.env.REACT_APP_BINANCE_API}/api/v3/ticker/price`,
            {
                symbol: symbol,
            }
        )
        return result
    }

    public async getPriceSing(symbol = "SINGUSDT"): Promise<any> {
        const result = await this.get(
            `${process.env.REACT_APP_SINGID_API}/queue/price`,
            {
                symbol: symbol,
            }
        )
        return result
    }

    public async getMetadata(url: string): Promise<Metadata> {
        const result = await this.get(
            `${url}`
        )
        return result
    }


    private async getContract(netId: number, contract: string): Promise<IContract | null> {
        let name = contract === "SingSing" ? "SingSingV4" : contract
        console.log("GetContract: %s with netId: %s => name: %s", contract, netId, name);

        let address = ""
        await this.getContractAddress(netId, name).then(
            (result) => {
                address = result
            },
            (error) => {
                console.log(error)
            }
        )
        if (address && address.length > 0) {
            // return 1st result only
            let objContract = {
                network: netId,
                abi: {},
                address: address,
                fileJson: `./contracts/${name}.json`,
            }
            await fetch(objContract.fileJson)
                .then((res) => {
                    return res.json()
                })
                .then((data) => {
                    // console.log (data)
                    objContract.abi = data.abi
                })
                .catch((error) => {
                    console.error('Error:', error)
                })
            return objContract
        } return null
    }

    private async getContractCrow(smartcontract: SmartContractInterface): Promise<IContract | null> {
        console.log("GetContractCrow");

        // return 1st result only
        let objContract = {
            network: smartcontract.network_id,
            abi: {},
            address: smartcontract.address,
            fileJson: `./contracts/${smartcontract.name}.json`,
        }
        await fetch(objContract.fileJson)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                // console.log (data)
                objContract.abi = data.abi
            })
            .catch((error) => {
                alert(error)
            })
        return objContract
    }

    private async getContractErc721(netId: number, address: string): Promise<IContract | null> {

        const name = "ERC721"

        if (address && address.length > 0) {
            // return 1st result only
            let objContract = {
                network: netId,
                abi: {},
                address: address,
                fileJson: `./contracts/${name}.json`,
            }
            await fetch(objContract.fileJson)
                .then((res) => {
                    return res.json()
                })
                .then((data) => {
                    // console.log (data)
                    objContract.abi = data.abi
                })
                .catch((error) => {
                    console.error('Error:', error)
                })
            return objContract
        } return null
    }

    public async postOrder(chainId: number | undefined, signedOrder: any): Promise<any> {
        const result = await this.post(
            `${process.env.REACT_APP_RSA_SERVER_API}/v3/order`,
            {
                chainId: chainId,
            },
            signedOrder
        )
        return result
    }

    public async postOrderConfig(chainId: number | undefined, orderConfigRequest: any): Promise<any> {
        const result = await this.post(
            `${process.env.REACT_APP_RSA_SERVER_API}/v3/order_config`,
            {
                chainId: chainId,
            },
            orderConfigRequest
        )
        return result
    }

    public async getOrderBook(chainId: number | undefined, orderbookRequest: any): Promise<any> {
        const result = await this.get(
            `${process.env.REACT_APP_RSA_SERVER_API}/v3/orderbook`,
            {
                chainId: chainId, ...orderbookRequest
            }
        )
        return result
    }

    public async getOrderBookAll(chainId: number | undefined): Promise<OrderBookResponse> {
        const result = await this.get(
            `${process.env.REACT_APP_RSA_SERVER_API}/v3/orders`,
            {
                chainId: chainId
            }
        )
        return result
    }

}


