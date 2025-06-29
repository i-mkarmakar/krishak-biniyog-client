"use client";

import { useEffect, useState } from "react";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import { isAddressEqual } from "viem";

import { farmTokenAbi } from "@/contracts/abi/farmToken";
import { SiteConfigContracts } from "@/config/site";
import EntityList from "./entity-list";
import { TokenCard } from "./token-card";

const LIMIT = 42;

export function TokenInvestmentsList(props: {
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | undefined>();
  const [tokens, setTokens] = useState<string[]>([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteReadContracts({
    cacheKey: `token_investments_list_${props.contracts.chain.id}`,
    contracts: ({ pageParam = 0 }) =>
      Array.from({ length: LIMIT }, (_, i) => ({
        address: props.contracts.farmToken,
        abi: farmTokenAbi,
        functionName: "getParams",
        args: [BigInt(pageParam + i)],
        chainId: props.contracts.chain.id,
      })),

    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage: any, _allPages: any, lastPageParam: number) =>
        lastPageParam + LIMIT,
    },
  });

  useEffect(() => {
    setSmartAccountAddress(undefined);
    if (address) {
      if (props.contracts.accountAbstractionSuported) {
        // TODO: Implement smart account abstraction support
      } else {
        setSmartAccountAddress(address);
      }
    }
  }, [address, props.contracts]);

  useEffect(() => {
    if (address && data && smartAccountAddress) {
      const foundTokens: string[] = [];

      data.pages.forEach((page: any[], pageIndex: number) => {
        page.forEach((contractResult: any, index: number) => {
          const investor = contractResult?.result?.investor;
          if (investor && isAddressEqual(investor, smartAccountAddress)) {
            const tokenId = String(pageIndex * LIMIT + index);
            foundTokens.push(tokenId);
          }
        });
      });

      setTokens(foundTokens);
    } else {
      setTokens([]);
    }
  }, [address, data, smartAccountAddress]);

  return (
    <EntityList
      entities={[...tokens].reverse()}
      renderEntityCard={(token, index) => (
        <TokenCard token={token} contracts={props.contracts} />
      )}
      noEntitiesText={`No tokens on ${props.contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
