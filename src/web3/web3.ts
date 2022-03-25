import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { useMemo } from "react";

export const useWeb3Provider = () => {
	const { active, library } = useWeb3React();
	return active ? library.provider : null;
};

export const useWeb3 = (): Web3 => {
	const provider = useWeb3Provider();
	return useMemo(() => (provider ? new Web3(provider) : (undefined as any)), [provider]);
};

export const hexifyMessage = (msg: string): string =>
	`0x${Buffer.from(msg, "utf8").toString("hex")}`;
