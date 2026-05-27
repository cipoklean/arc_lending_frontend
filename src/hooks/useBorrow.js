import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { CONTRACTS } from "../lib/contracts"
import { parseUSDC, parseWETH, formatUSDC } from "../lib/utils"


function parseContractError(error) {
  const message = error?.message || error?.toString() || ""


  if (message.includes("Insufficient pool liquidity"))
    return "Insufficient pool liquidity — not enough USDC available to borrow"
  if (message.includes("Exceeds borrow limit"))
    return "Exceeds borrow limit — you cannot borrow more than your collateral allows"
  if (message.includes("Exceeds per-user borrow limit"))
    return "Exceeds per-user borrow limit — maximum borrow per user is 50,000 USDC"
  if (message.includes("No collateral deposited"))
    return "No collateral deposited — please deposit WETH first before borrowing"
  if (message.includes("Insufficient balance"))
    return "Insufficient balance — you don't have enough to complete this action"
  if (message.includes("Insufficient allowance"))
    return "Approval required — please approve the token first"
  if (message.includes("Must repay all debt first"))
    return "You must repay all debt before withdrawing collateral"
  if (message.includes("No debt to repay"))
    return "You have no outstanding debt to repay"
  if (message.includes("Already have different collateral"))
    return "You already have a different collateral asset deposited"
  if (message.includes("Asset not supported"))
    return "This asset is not supported as collateral"
  if (message.includes("Amount must be greater than 0"))
    return "Amount must be greater than zero"
  if (message.includes("User rejected") || message.includes("user rejected"))
    return "Transaction cancelled — you rejected the request in your wallet"
  if (message.includes("insufficient funds"))
    return "Insufficient USDC for gas fees — make sure you have enough USDC for gas"

  // Generic fallback
  return "Transaction failed — please try again"
}

export function useBorrow() {
  const [txHash, setTxHash] = useState(null)
  const [lastTx, setLastTx] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const publicClient = usePublicClient()

  const { writeContractAsync: approveWethAsync, isPending: isApproveWethPending } =
    useWriteContract()

  const { writeContractAsync: depositCollateralAsync, isPending: isDepositPending } =
    useWriteContract()

  const { writeContractAsync: borrowAsync, isPending: isBorrowPending } =
    useWriteContract()

  const { writeContractAsync: repayApproveAsync, isPending: isRepayApprovePending } =
    useWriteContract()

  const { writeContractAsync: repayAsync, isPending: isRepayPending } =
    useWriteContract()

  const { writeContractAsync: withdrawCollateralAsync, isPending: isWithdrawCollateralPending } =
    useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: lastTx })

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  async function approveWeth(amount) {
    clearMessages()
    try {
      const hash = await approveWethAsync({
        address: CONTRACTS.MockWETH.address,
        abi: CONTRACTS.MockWETH.abi,
        functionName: "approve",
        args: [CONTRACTS.LendingPool.address, parseWETH(amount)],
      })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function depositCollateral(amount) {
    clearMessages()
    try {
      const hash = await depositCollateralAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "depositCollateral",
        args: [CONTRACTS.MockWETH.address, parseWETH(amount)],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully deposited ${amount} WETH as collateral`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function borrow(amount, maxBorrow) {
    clearMessages()
    try {
      
      const borrowAmount = parseUSDC(amount)
      if (borrowAmount === 0n) {
        setError("Amount must be greater than zero")
        return
      }
      if (maxBorrow && borrowAmount > maxBorrow) {
        setError(
          `Exceeds borrow limit — maximum you can borrow is ${formatUSDC(maxBorrow)} USDC based on your collateral`
        )
        return
      }

      const hash = await borrowAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "borrow",
        args: [borrowAmount],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully borrowed ${amount} USDC`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function approveRepay(amount) {
    clearMessages()
    try {
      const hash = await repayApproveAsync({
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

  async function repay(amount) {
    clearMessages()
    try {
      const hash = await repayAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "repay",
        args: [parseUSDC(amount)],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully repaid ${amount} USDC`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  async function withdrawCollateral(amount) {
    clearMessages()
    try {
      const hash = await withdrawCollateralAsync({
        address: CONTRACTS.LendingPool.address,
        abi: CONTRACTS.LendingPool.abi,
        functionName: "withdrawCollateral",
        args: [parseWETH(amount)],
      })
      setTxHash(hash)
      setLastTx(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setSuccess(`Successfully withdrew ${amount} WETH collateral`)
      return hash
    } catch (err) {
      setError(parseContractError(err))
      throw err
    }
  }

  return {
    approveWeth,
    depositCollateral,
    borrow,
    approveRepay,
    repay,
    withdrawCollateral,
    txHash,
    error,
    success,
    clearMessages,
    isPending:
      isApproveWethPending ||
      isDepositPending ||
      isBorrowPending ||
      isRepayApprovePending ||
      isRepayPending ||
      isWithdrawCollateralPending ||
      isConfirming,
    isConfirmed,
  }
}
