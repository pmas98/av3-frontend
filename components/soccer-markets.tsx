"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Star } from "lucide-react"

export function SoccerMarketsComponent() {
  const [selectedOdds, setSelectedOdds] = useState<{ [key: string]: string }>({})
  const [stake, setStake] = useState<string>("10")

  const markets = [
    {
      name: "Match Result",
      options: [
        { name: "Home", odds: "2.10" },
        { name: "Draw", odds: "3.25" },
        { name: "Away", odds: "3.50" },
      ],
    },
    {
      name: "Both Teams to Score",
      options: [
        { name: "Yes", odds: "1.80" },
        { name: "No", odds: "2.00" },
      ],
    },
    {
      name: "Over/Under 2.5 Goals",
      options: [
        { name: "Over", odds: "1.95" },
        { name: "Under", odds: "1.85" },
      ],
    },
    {
      name: "First Goal Scorer",
      options: [
        { name: "Player 1", odds: "5.50" },
        { name: "Player 2", odds: "6.00" },
        { name: "Player 3", odds: "7.50" },
        { name: "No Goal", odds: "12.00" },
      ],
    },
  ]

  const handleOddSelection = (marketName: string, optionName: string, odds: string) => {
    setSelectedOdds(prev => ({
      ...prev,
      [marketName]: `${optionName} (${odds})`
    }))
  }

  const calculateTotalOdds = () => {
    return Object.values(selectedOdds).reduce((total, odd) => {
      const oddValue = parseFloat(odd.match(/$$(.*?)$$/)?.[1] || "1")
      return total * oddValue
    }, 1).toFixed(2)
  }

  const calculatePotentialWin = () => {
    const totalOdds = parseFloat(calculateTotalOdds())
    const stakeValue = parseFloat(stake)
    return isNaN(stakeValue) ? "0.00" : (totalOdds * stakeValue).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Sports
          </Button>
          <h1 className="text-2xl font-bold text-indigo-500">BetMaster</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-extrabold text-white mb-6">Futebol Markets</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All Markets</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                    {markets.map((market) => (
                      <Card key={market.name} className="mb-4 bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-indigo-400">{market.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {market.options.map((option) => (
                              <Button
                                key={option.name}
                                variant="outline"
                                className={`justify-between ${
                                  selectedOdds[market.name]?.includes(option.name)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                }`}
                                onClick={() => handleOddSelection(market.name, option.name, option.odds)}
                              >
                                <span>{option.name}</span>
                                <span className="font-bold">{option.odds}</span>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="popular">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-indigo-400">Popular Markets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">Popular markets will be displayed here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-indigo-400">Bet Slip</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-450px)] pr-4">
                    {Object.entries(selectedOdds).map(([market, selection]) => (
                      <div key={market} className="mb-2 p-2 bg-gray-700 rounded-md">
                        <p className="text-sm font-medium text-gray-300">{market}</p>
                        <p className="text-base font-semibold text-white">{selection}</p>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="mt-4">
                    <Label htmlFor="stake" className="text-gray-300">Stake</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-400 sm:text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        id="stake"
                        className="flex-1 rounded-none rounded-r-md bg-gray-700 border-gray-600 text-white"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Odds:</span>
                      <span className="font-semibold text-white">{calculateTotalOdds()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Win:</span>
                      <span className="font-semibold text-white">${calculatePotentialWin()}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Place Bet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}