const axios = require("axios");
const retry = require("async-retry");
const endpoint = "https://fullnode.mainnet.aptoslabs.com";

export async function aQuery(api: string) {
  const query = await retry(
    async (_bail: any) => await axios.get(`${endpoint}${api}`)
  );
  return query;
}

export async function getResources(account: string, type?: string) {
  const resources = await retry(
    async (_bail: any) =>
      await axios.get(`${endpoint}/v1/accounts/${account}/resources`)
  );
  const data = resources.data;
  if (type) {
    return data.filter((obj: any) => obj.type === type)[0];
  }
  return data;
}

export async function getTotalSupply(account: string, type?: string) {
  const resources = await getResources(account, type);
  const decimals = resources?.data?.decimals;
  const supply = resources?.data?.supply?.vec?.[0].integer?.vec?.[0].value;
  return supply / 10 ** decimals;
}

export async function getTokenSupply(token: string) {
  const { data } = await axios.get(`${endpoint}/v1/accounts/${token}/resources`);

  if (token === '0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89') {
    const coinInfo = data.find((coin: any) => coin.type === '0x4de5876d8a8e2be7af6af9f3ca94d9e4fafb24b5f4a5848078d8eb08f08e808a::ds_token::TokenData')
    return coinInfo.data.total_issued / 1e6
  }
  const coinInfo = data.find((coin: any) => coin.type.startsWith('0x1::coin::CoinInfo'));

  return coinInfo.data.supply.vec[0].integer.vec[0].value / 10 ** coinInfo.data.decimals;
}