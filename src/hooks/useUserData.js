import { useReadContracts, useAccount } from "wagmi"
import { CONTRACTS } from "../lib/contracts"

export function useUserData() {
  const { address, isConnected } = useAccount()

  const lendingPoolConfig = {
    address: CONTRACTS.LendingPool.address,
    abi: CONTRACTS.LendingPool.abi,
  }

  const usdcConfig = {
    address: CONTRACTS.MockUSDC.address,
    abi: CONTRACTS.MockUSDC.abi,
  }

  const wethConfig = {
    address: CONTRACTS.MockWETH.address,
    abi: CONTRACTS.MockWETH.abi,
  }

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        ...lendingPoolConfig,
        functionName: "getSupplyBalance",
        args: [address],
      },
      {
        ...lendingPoolConfig,
        functionName: "getTotalDebt",
        args: [address],
      },
      {
        ...lendingPoolConfig,
        functionName: "getHealthFactor",
        args: [address],
      },
      {
        ...lendingPoolConfig,
        functionName: "getMaxBorrow",
        args: [address],
      },
      {
        ...lendingPoolConfig,
        functionName: "borrows",
        args: [address],
      },
      {
        ...usdcConfig,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...wethConfig,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...usdcConfig,
        functionName: "allowance",
        args: [address, CONTRACTS.LendingPool.address],
      },
      {
        ...wethConfig,
        functionName: "allowance",
        args: [address, CONTRACTS.LendingPool.address],
      },
      {
        ...lendingPoolConfig,
        functionName: "supplies",
        args: [address],
      },
    ],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  })

  const supplyBalance = data?.[0]?.result || 0n
  const totalDebt = data?.[1]?.result || 0n
  const healthFactor = data?.[2]?.result || 0n
  const maxBorrow = data?.[3]?.result || 0n
  const borrowPosition = data?.[4]?.result
  const usdcBalance = data?.[5]?.result || 0n
  const wethBalance = data?.[6]?.result || 0n
  const usdcAllowance = data?.[7]?.result || 0n
  const wethAllowance = data?.[8]?.result || 0n
  const supplyPosition = data?.[9]?.result

  const collateralAmount = borrowPosition?.[0] || 0n
  const collateralAsset = borrowPosition?.[1] || ""
  const borrowedAmount = borrowPosition?.[2] || 0n
  const supplyAmount = supplyPosition?.[0] || 0n

  return {
    address,
    isConnected,
    supplyBalance,
    supplyAmount,
    totalDebt,
    healthFactor,
    maxBorrow,
    collateralAmount,
    collateralAsset,
    borrowedAmount,
    usdcBalance,
    wethBalance,
    usdcAllowance,
    wethAllowance,
    isLoading,
    refetch,
  }
}