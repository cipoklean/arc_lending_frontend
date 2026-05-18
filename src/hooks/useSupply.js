import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { CONTRACTS } from "../lib/contracts"
import { parseUSDC } from "../lib/utils"

export function useSupply() {
  const [txHash, setTxHash] = useState(null)
  const [lastTx, setLastTx] = useState(null)
  const publicClient = usePublicClient()

  const { writeContractAsync: approveAsync, isPending: isApprovePending } =
    useWriteContract()

  const { writeContractAsync: supplyAsync, isPending: isSupplyPending } =
    useWriteContract()

  const { writeContractAsync: withdrawAsync, isPending: isWithdrawPending } =
    useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: lastTx })

  async function approve(amount) {
    const hash = await approveAsync({
      address: CONTRACTS.MockUSDC.address,
      abi: CONTRACTS.MockUSDC.abi,
      functionName: "approve",
      args: [CONTRACTS.LendingPool.address, parseUSDC(amount)],
    })
    setTxHash(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function supply(amount) {
    const hash = await supplyAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "supply",
      args: [parseUSDC(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function withdraw(amount) {
    const hash = await withdrawAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "withdraw",
      args: [parseUSDC(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  return {
    approve,
    supply,
    withdraw,
    txHash,
    isApprovePending,
    isSupplyPending,
    isWithdrawPending,
    isConfirming,
    isConfirmed,
    isPending: isApprovePending || isSupplyPending || isWithdrawPending || isConfirming,
  }
}