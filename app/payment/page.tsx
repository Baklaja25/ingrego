"use client"

import { useState } from "react"

type PlanId = "starter" | "pro"
type CryptoType = "USDT" | "BTC" | "ETH"
type PaymentMethod = "crypto" | "card" | "paypal"

interface Plan {
  id: PlanId
  name: string
  description: string
  price: number
  period: string
  features: string[]
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for home cooking and basic meal planning.",
    price: 4.99,
    period: "month",
    features: [
      "AI-powered recipe suggestions",
      "Basic meal planning",
      "Ingredient scanning",
      "Recipe saving"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For advanced users, families, and frequent cooks.",
    price: 9.99,
    period: "month",
    features: [
      "Everything in Starter",
      "Advanced meal planning",
      "Shopping list generation",
      "Priority support",
      "Unlimited recipe saves"
    ]
  }
]

const cryptoOptions = [
  { symbol: "USDT", name: "Tether", network: "TRC20" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", network: "ERC20" }
] as const

const walletAddresses: Record<CryptoType, string> = {
  USDT: "TVa...YOUR_TRC20_USDT_WALLET",
  BTC: "bc1...YOUR_BITCOIN_WALLET",
  ETH: "0x...YOUR_ETH_WALLET"
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("starter")
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("USDT")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto")
  const [copied, setCopied] = useState(false)

  const currentPlan = plans.find((p) => p.id === selectedPlan)!

  const handleCopyAddress = async () => {
    const address = walletAddresses[selectedCrypto]
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handlePaymentConfirmation = () => {
    // TODO: Implement backend API call to verify payment
    // This will check the blockchain for the transaction
    // and activate the user's account upon confirmation
    console.log("Payment confirmation placeholder")
    console.log({
      plan: selectedPlan,
      crypto: selectedCrypto,
      amount: currentPlan.price,
      wallet: walletAddresses[selectedCrypto]
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBEED7] via-white to-[#FBEED7]/50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT SIDE - Pricing Plans */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
              <p className="text-gray-600">
                Select the perfect plan for your cooking needs.
              </p>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                    selectedPlan === plan.id
                      ? "border-[#FF8C42] bg-[#FF8C42]/5 shadow-xl"
                      : "border-gray-200 bg-white hover:border-[#FF8C42]/50 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-[#FF8C42]">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 text-sm">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg
                          className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 italic">
                Note: Prices are examples. They will later be connected to the backend.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - Payment Box */}
          <div className="space-y-6">
            {/* Payment Method Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setPaymentMethod("crypto")}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  paymentMethod === "crypto"
                    ? "text-[#FF8C42] border-b-2 border-[#FF8C42]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                disabled
                className="px-4 py-2 font-medium text-sm text-gray-400 cursor-not-allowed"
              >
                Card
              </button>
              <button
                onClick={() => setPaymentMethod("paypal")}
                disabled
                className="px-4 py-2 font-medium text-sm text-gray-400 cursor-not-allowed"
              >
                PayPal
              </button>
            </div>

            {/* Payment Content */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              {paymentMethod === "crypto" ? (
                <div className="space-y-6">
                  {/* Heading & Description */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Crypto Payment
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Choose a plan, select a cryptocurrency, send the exact amount to the
                      wallet address below, and click the confirmation button once your
                      payment is sent.
                    </p>
                  </div>

                  {/* Selected Plan Summary */}
                  <div className="bg-[#FF8C42]/5 rounded-xl p-4 border border-[#FF8C42]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Selected Plan</p>
                        <p className="text-lg font-bold text-gray-900">{currentPlan.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-lg font-bold text-[#FF8C42]">
                          ${currentPlan.price} USD
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cryptocurrency Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {cryptoOptions.map((crypto) => (
                        <button
                          key={crypto.symbol}
                          onClick={() => setSelectedCrypto(crypto.symbol)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedCrypto === crypto.symbol
                              ? "border-[#FF8C42] bg-[#FF8C42]/5"
                              : "border-gray-200 bg-white hover:border-[#FF8C42]/50"
                          }`}
                        >
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{crypto.symbol}</p>
                            <p className="text-xs text-gray-600 mt-1">{crypto.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {crypto.network}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wallet Address + Copy Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={walletAddresses[selectedCrypto]}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
                      />
                      <button
                        onClick={handleCopyAddress}
                        className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-[#FF8C42] text-white hover:bg-[#E55A2B]"
                        }`}
                      >
                        {copied ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                      <p className="text-xs text-gray-500 text-center px-2">
                        QR CODE
                        <br />
                        (coming soon)
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      QR code will be implemented later
                    </p>
                  </div>

                  {/* Step-by-step Instructions */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Payment Instructions
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="font-bold text-[#FF8C42]">1.</span>
                        <span>
                          Select your plan and cryptocurrency.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-[#FF8C42]">2.</span>
                        <span>
                          Copy the wallet address and send the exact amount.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-[#FF8C42]">3.</span>
                        <span>
                          Click "I have paid" after sending the payment.
                        </span>
                      </li>
                    </ol>
                  </div>

                  {/* Confirmation Button */}
                  <button
                    onClick={handlePaymentConfirmation}
                    className="w-full bg-[#FF8C42] hover:bg-[#E55A2B] text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    I have paid • Activate my account
                  </button>

                  {/* Info Text */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <strong>Note:</strong> The backend will later verify the transaction
                      through integration with a crypto payment provider. After confirmation,
                      your user account will be activated automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                    <p className="text-gray-600">
                      This payment method will be available soon.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


