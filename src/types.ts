/* eslint-disable camelcase */
export interface APIConfig {
    apiUrl?: string
    apiKey?: string
}

export interface HistoryTransaction {
    hash: string | undefined,
    from_address: string | undefined,
    to_address: string | undefined,
    amount: number | undefined,
    amount_sing: number | undefined,
    price_sing: number | undefined,
    payment_method: string | undefined,
    network_id: number | undefined,
    created_at?: string,
}
export interface HistoryTransfer {
    hash: string | undefined,
    from_address: string | undefined,
    to_address: string | undefined,
    amount: number | undefined,
    network_id: number | undefined,
    created_at?: string,
}
export interface SmartContractInterface {
    sing_rate: number,
    time_lock: number,
    name: string,
    address: string,
    start_date: string,
    end_date: string,
    network_id: number,
    term: string
}

export interface LockedItemInterface {
    amountLockIndex: number,
    releaseDate: number,
}

export interface Metadata {
    name: string
    image: string
    description: string
}

export interface Order {
    chainId: number;
    salt: any;
    exchangeAddress: any;
    makerAddress: any;
    takerAddress: any;
    senderAddress: any;
    feeRecipientAddress: any;
    expirationTimeSeconds: any;
    makerAssetAmount: any;
    takerAssetAmount: any;
    makerAssetData: any;
    takerAssetData: any;
    makerFeeAssetData: any;
    takerFeeAssetData: any;
    makerFee: any;
    takerFee: any;
    signature: any;
}

export interface OrderBook {
    metaData: Metadata;
    order: Order;
}

export interface OrderBookResponse {
    records: OrderBook[];
    page: number;
    perPage: number;
    total: number;
}
