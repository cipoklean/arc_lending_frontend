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

  // Call 1 — LendingPool data
  const { data: poolData, isLoading: poolLoading, refetch: refetchPool } = useReadContracts({
    contracts: [
      { ...lendingPoolConfig, functionName: "getSupplyBalance", args: [address] },
      { ...lendingPoolConfig, functionName: "getTotalDebt",     args: [address] },
      { ...lendingPoolConfig, functionName: "getHealthFactor",  args: [address] },
      { ...lendingPoolConfig, functionName: "getMaxBorrow",     args: [address] },
      { ...lendingPoolConfig, functionName: "borrows",          args: [address] },
      { ...lendingPoolConfig, functionName: "supplies",         args: [address] },
    ],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  })

  // Call 2 — Token balances and allowances
  const { data: tokenData, isLoading: tokenLoading } = useReadContracts({
    contracts: [
      { ...usdcConfig, functionName: "balanceOf",  args: [address] },
      { ...wethConfig, functionName: "balanceOf",  args: [address] },
      { ...wethConfig, functionName: "allowance",  args: [address, CONTRACTS.LendingPool.address] },
      { ...usdcConfig, functionName: "allowance",  args: [address, CONTRACTS.LendingPool.address] },
    ],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  })

  // Map results
  const supplyBalance    = poolData?.[0]?.result || 0n
  const totalDebt        = poolData?.[1]?.result || 0n
  const healthFactor     = poolData?.[2]?.result || 0n
  const maxBorrow        = poolData?.[3]?.result || 0n
  const borrowPosition   = poolData?.[4]?.result
  const supplyPosition   = poolData?.[5]?.result

  const usdcBalance      = tokenData?.[0]?.result || 0n
  const wethBalance      = tokenData?.[1]?.result || 0n
  const wethAllowance    = tokenData?.[2]?.result || 0n
  const usdcAllowance    = tokenData?.[3]?.result || 0n

  const collateralAmount = borrowPosition?.[0] || 0n
  const collateralAsset  = borrowPosition?.[1] || ""
  const borrowedAmount   = borrowPosition?.[2] || 0n
  const supplyAmount     = supplyPosition?.[0] || 0n

  const isLoading = poolLoading || tokenLoading
  const refetch = () => { refetchPool() }

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
