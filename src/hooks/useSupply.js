import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { CONTRACTS } from "../lib/contracts"
import { parseUSDC, formatUSDC } from "../lib/utils"

// Extract clean error message from contract revert
function parseContractError(error) {
  const message = error?.message || error?.toString() || ""

  if (message.includes("Insufficient balance"))
    return "Insufficient balance — you don't have enough USDC to supply this amount"
  if (message.includes("Insufficient pool liquidity"))
    return "Insufficient pool liquidity — not enough USDC available to withdraw"
  if (message.includes("Amount must be greater than 0"))
    return "Amount must be greater than zero"
  if (message.includes("TransferFrom failed"))
    return "Transfer failed — please approve USDC spending first"
  if (message.includes("User rejected") || message.includes("user rejected"))
    return "Transaction cancelled — you rejected the request in your wallet"
  if (message.includes("insufficient funds"))
    return "Insufficient USDC for gas fees"

  return "Transaction failed — please try again"
}

export function useSupply() {
  const [txHash, setTxHash] = useState(null)
  const [lastTx, setLastTx] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const publicClient = usePublicClient()

  const { writeContractAsync: approveAsync, isPending: isApprovePending } =
    useWriteContract()

  const { writeContractAsync: supplyAsync, isPending: isSupplyPending } =
    useWriteContract()

  const { writeContractAsync: withdrawAsync, isPending: isWithdrawPending } =
    useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: lastTx })

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  async function approve(amount) {
    clearMessages()
    try {
      const hash = await approveAsync({
        address: CONTRACTS.MockUSDC.address,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "approve",
        args: [CONTRACTS.LendingPool.address, parseUSDC(amount)],
      })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function supply(amount, usdcBalance) {
    clearMessages()
    try {
      const supplyAmount = parseUSDC(amount)

      // Pre-flight check
      if (supplyAmount === 0n) {
        setError("Amount must be greater than zero")
        return
      }
      if (usdcBalance && supplyAmount > usdcBalance) {
        setError(
          `Insufficient balance — you only have ${formatUSDC(usdcBalance)} USDC in your wallet`
        )
        return
      }

      const hash = await supplyAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "supply",
        args: [supplyAmount],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully supplied ${amount} USDC to the pool`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function withdraw(amount, supplyBalance) {
    clearMessages()
    try {
      const withdrawAmount = parseUSDC(amount)

      // Pre-flight check
      if (withdrawAmount === 0n) {
        setError("Amount must be greater than zero")
        return
      }
      if (supplyBalance && withdrawAmount > supplyBalance) {
        setError(
          `Exceeds supply balance — you can only withdraw up to ${formatUSDC(supplyBalance)} USDC`
        )
        return
      }

      const hash = await withdrawAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "withdraw",
        args: [withdrawAmount],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully withdrew ${amount} USDC from the pool`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  return {
    approve,
    supply,
    withdraw,
    txHash,
    error,
    success,
    clearMessages,
    isApprovePending,
    isSupplyPending,
    isWithdrawPending,
    isConfirming,
    isConfirmed,
    isPending: isApprovePending || isSupplyPending || isWithdrawPending || isConfirming,
  }
}
