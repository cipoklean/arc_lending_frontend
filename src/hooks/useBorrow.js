import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { CONTRACTS } from "../lib/contracts"
import { parseUSDC, parseWETH } from "../lib/utils"

export function useBorrow() {
  const [txHash, setTxHash] = useState(null)
  const [lastTx, setLastTx] = useState(null)
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

  async function approveWeth(amount) {
    const hash = await approveWethAsync({
      address: CONTRACTS.MockWETH.address,
      abi: CONTRACTS.MockWETH.abi,
      functionName: "approve",
      args: [CONTRACTS.LendingPool.address, parseWETH(amount)],
    })
    setTxHash(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function depositCollateral(amount) {
    const hash = await depositCollateralAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "depositCollateral",
      args: [CONTRACTS.MockWETH.address, parseWETH(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function borrow(amount) {
    const hash = await borrowAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "borrow",
      args: [parseUSDC(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function approveRepay(amount) {
    const hash = await repayApproveAsync({
      address: CONTRACTS.MockUSDC.address,
      abi: CONTRACTS.MockUSDC.abi,
      functionName: "approve",
      args: [CONTRACTS.LendingPool.address, parseUSDC(amount)],
    })
    setTxHash(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function repay(amount) {
    const hash = await repayAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "repay",
      args: [parseUSDC(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  async function withdrawCollateral(amount) {
    const hash = await withdrawCollateralAsync({
      address: CONTRACTS.LendingPool.address,
      abi: CONTRACTS.LendingPool.abi,
      functionName: "withdrawCollateral",
      args: [parseWETH(amount)],
    })
    setTxHash(hash)
    setLastTx(hash)
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  }

  return {
    approveWeth,
    depositCollateral,
    borrow,
    approveRepay,
    repay,
    withdrawCollateral,
    txHash,
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