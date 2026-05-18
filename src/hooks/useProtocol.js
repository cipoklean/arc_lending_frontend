import { useReadContracts } from "wagmi"
import { CONTRACTS } from "../lib/contracts"

const lendingPoolConfig = {
  address: CONTRACTS.LendingPool.address,
  abi: CONTRACTS.LendingPool.abi,
}

export function useProtocol() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...lendingPoolConfig, functionName: "totalSupplied" },
      { ...lendingPoolConfig, functionName: "totalBorrowed" },
      { ...lendingPoolConfig, functionName: "getCurrentSupplyRate" },
      { ...lendingPoolConfig, functionName: "getCurrentBorrowRate" },
    ],
    query: {
      refetchInterval: 5000,
    },
  })

  const totalSupplied = data?.[0]?.result || 0n
  const totalBorrowed = data?.[1]?.result || 0n
  const supplyRate = data?.[2]?.result || 0n
  const borrowRate = data?.[3]?.result || 0n

  const utilization =
    totalSupplied > 0n
      ? Number((totalBorrowed * 10000n) / totalSupplied) / 100
      : 0

  // Format rates as readable percentages for display
  const supplyAPY = Number(supplyRate) / 1e16
  const borrowAPY = Number(borrowRate) / 1e16

  return {
    totalSupplied,
    totalBorrowed,
    supplyRate,
    borrowRate,
    supplyAPY,
    borrowAPY,
    utilization,
    isLoading,
    refetch,
  }
}