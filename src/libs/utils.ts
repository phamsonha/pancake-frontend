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

export function formatUrlScan(chainId: number | undefined, hash: string | undefined) {
    let url = ""
    switch (chainId) {
        case 97: {
            url = "https://testnet.bscscan.com/tx/"
            break
        }
        case 1337: {
            url = "https://bscscan.com/tx/"
            break
        }
        default:
            url = ""
    }
    return url + hash
}
