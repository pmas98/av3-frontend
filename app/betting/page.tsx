"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast"

export default function SoccerMarkets() {
  const searchParams = useSearchParams();
  const marketKey = searchParams.get("market");
  const sport = searchParams.get("sport");
  const [balance, setBalance] = useState(null);
  const [depositAmount, setDepositAmount] = useState(10);

  const [selectedBets, setSelectedBets] = useState<
    Array<{
      marketId: string;
      marketName: string;
      selection: string;
      odds: string;
      stake: string;
    }>
  >([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [betsMade, setBetsMade] = useState([]);
  const [triggerUpdate, setTriggerUpdate] = useState(false);

  useEffect(() => {
    // Fetch the bets when the component mounts
    fetch("http://127.0.0.1:8000/apostas")
      .then((response) => response.json())
      .then((data) => setBetsMade(data))
      .catch((error) => console.error("Error fetching bets:", error));
  }, [triggerUpdate]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/saldo");
        if (!response.ok) throw new Error("Failed to fetch balance");
        const data = await response.json();
        setBalance(data.saldo); // Use `saldo` based on the API response format
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [triggerUpdate]);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!marketKey) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/eventos?market=${encodeURIComponent(
            marketKey
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch market data");
        const data = await response.json();
        setMarketData(Array.isArray(data) ? data : [data]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [marketKey]);

  const handleOddSelection = (
    marketId: string,
    marketName: string,
    optionName: string,
    odds: string
  ) => {
    setSelectedBets((prev) => [
      ...prev,
      {
        marketId,
        marketName,
        selection: optionName,
        odds,
        stake: "10",
      },
    ]);
  };

  const removeBet = (index: number) => {
    setSelectedBets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStake = (index: number, value: string) => {
    const numericValue = parseFloat(value);
    setSelectedBets((prev) =>
      prev.map((bet, i) =>
        i === index ? { ...bet, stake: numericValue >= 0 ? value : "0" } : bet
      )
    );
  };

  const calculateTotalStake = () => {
    return selectedBets
      .reduce((total, bet) => total + (parseFloat(bet.stake) || 0), 0)
      .toFixed(2);
  };

  const calculatePotentialWin = (stake: string, odds: string) => {
    const stakeValue = parseFloat(stake);
    const oddsValue = parseFloat(odds);
    return isNaN(stakeValue) || isNaN(oddsValue)
      ? "0.00"
      : (stakeValue * oddsValue).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const transformMarketData = (): Market[] => {
    if (!marketData?.length) return [];

    return marketData.map((event: any) => {
      const homeTeam = event.home_team;
      const awayTeam = event.away_team;

      // Get the best odds and corresponding point from the same market and bookmaker
      const getBestOddsAndPoint = (outcomeName: string, marketType: string) => {
        let bestOdds = 0;
        let point = 0;

        event.bookmakers.forEach((bookmaker: any) => {
          const market = bookmaker.markets.find(
            (m: any) => m.key === marketType
          );
          if (market) {
            const outcome = market.outcomes.find(
              (o: any) => o.name === outcomeName
            );
            if (outcome && outcome.price > bestOdds) {
              bestOdds = outcome.price;
              bookmaker = outcome.bookmaker;
              if (marketType === "totals") {
                point = outcome.point;
              }
            }
          }
        });
        return { bestOdds, point };
      };

      const getBestOdds = (outcomeName: string, marketType: string) => {
        const { bestOdds } = getBestOddsAndPoint(outcomeName, marketType);
        return bestOdds.toFixed(2);
      };

      // Get the point for "totals" option
      const { bestOdds: _, point } = getBestOddsAndPoint("Over", "totals"); // Use "Over" to get the point

      // Separate options by type
      const h2hOptions = [
        {
          name: homeTeam,
          odds: getBestOdds(homeTeam, "h2h"),
          kind: "h2h" as const,
        },
        // Only show "Draw" if sport is "futebol"
        ...(sport === "futebol"
          ? [
              {
                name: "Draw",
                odds: getBestOdds("Draw", "h2h"),
                kind: "h2h" as const,
              },
            ]
          : []),
        {
          name: awayTeam,
          odds: getBestOdds(awayTeam, "h2h"),
          kind: "h2h" as const,
        },
      ];

      const totalsOptions =
        point > 0
          ? [
              {
                name: `Mais do que ${point} ${sport === "futebol" ? "gols" : "pontos"}`, // Change "gols" to "pontos"
                odds: getBestOdds("Over", "totals"),
                kind: "totals" as const,
              },
              {
                name: `Menos do que ${point} ${sport === "futebol" ? "gols" : "pontos"}`, // Change "gols" to "pontos"
                odds: getBestOdds("Under", "totals"),
                kind: "totals" as const,
              },
            ]
          : [];

      return {
        id: event.id,
        name: "Match Result",
        title: `${homeTeam} vs ${awayTeam}`,
        commence_time: event.commence_time,
        h2hOptions,
        totalsOptions,
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const markets = transformMarketData();

  const handleDeposit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/saldo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valor: depositAmount }),
      });

      if (!response.ok){
        toast.error("Erro ao depositar fundos");
        throw new Error("Failed to deposit funds");
      }
      const data = await response.json();
      setBalance(data.saldo); // Update balance after deposit
      setIsModalOpen(false);
      toast.success("Depósito realizado com sucesso!");
    } catch (err) {
      console.error("Error depositing funds:", err);
    }
  };
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleBetPlacement = async () => {
    // Loop through selectedBets and send requests for each bet
    for (const bet of selectedBets) {
      // Find the corresponding market data for this bet
      const market = markets.find((m) => m.id === bet.marketId);
      if (!market) continue;

      // Find the corresponding option (either in h2hOptions or totalsOptions)
      const option = [...market.h2hOptions, ...market.totalsOptions].find(
        (opt) => opt.name === bet.selection
      );
      if (!option) continue;

      const body = {
        id: bet.marketId,
        bookmaker: option.bookmaker || "betmgm", // Use the bookmaker from the option if available
        market: option.kind, // 'h2h' or 'totals'
        outcome: bet.selection,
        multiplier: parseFloat(bet.odds),
        valor: parseFloat(bet.stake),
        sport: marketKey, // Use the sport from URL params or default
      };

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/apostas/registrar",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          toast.error(`Erro ao apostar em ${bet.selection}: ${data.message}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success(`Aposta feita em ${bet.selection}`);
        // Optionally refresh the balance after successful bet
        const balanceResponse = await fetch("http://127.0.0.1:8000/saldo");
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData.saldo);
        }
        setTriggerUpdate((prev) => !prev);
      } catch (error) {
        console.error(`Error placing bet for ${bet.selection}:`, error);
        // You might want to show an error message to the user here
      }
    }

    // Clear selected bets after all bets are placed
    setSelectedBets([]);
  };

  const handleLiquidateBet = async (betId) => {
    try {
    const response = await fetch("http://127.0.0.1:8000/apostas/liquidar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "id-aposta": betId }), 
        });
    

      if (!response.ok) throw new Error("Failed to deposit funds");

      const data = await response.json();
      if(data.status === "erro") {
        toast.error("Erro ao liquidar aposta: " + data.message);
      }
      setIsModalOpen(false);
      setTriggerUpdate((prev) => !prev);
    } catch (err) {
      console.error("Error depositing funds:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Toaster />
      <header className="bg-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-indigo-500">BetMaster</h1>
            </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white">
              Balance: ${balance !== null ? balance.toFixed(2) : "Loading..."}
            </span>
            <Button
              variant="solid"
              className="bg-indigo-500 text-white"
              onClick={toggleModal}
            >
              Depositar
            </Button>
          </div>
        </div>
      </header>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-md w-80">
            <h2 className="text-xl font-semibold mb-4 text-white">Depósito</h2>
            <Label
              htmlFor="depositAmount"
              className="text-sm font-medium text-gray-300"
            >
              Valor do depósito
            </Label>
            <div className="flex items-center mt-2 mb-4">
              <span className="font-semibold text-white mr-2">R$</span>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Digite o valor"
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                className="text-gray-500"
                onClick={toggleModal}
              >
                Cancelar
              </Button>
              <Button
                variant="solid"
                className="bg-indigo-500 text-white"
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-extrabold text-white mb-6">
            {marketData?.sport_title ||
              (sport === "futebol"
                ? "Eventos para Futebol"
                : "Eventos para Basquete")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                {markets.map((market) => {
                  // Format commence_time into a readable string
                  const formattedTime = new Date(
                    market.commence_time
                  ).toLocaleString();

                  return (
                    <Card
                      key={market.id}
                      className="mb-4 bg-gray-800 border-gray-700"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-indigo-400">
                          {market.title}
                        </CardTitle>
                        <div className="text-sm text-gray-300">
                          {/* Display the commence_time */}
                          <span>A partida começa às: {formattedTime}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* H2H Section */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Confronto Direto
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {market.h2hOptions.map((option) => (
                              <Button
                                key={option.name}
                                variant="outline"
                                className={`justify-between ${
                                  selectedBets.some(
                                    (bet) =>
                                      bet.marketId === market.id &&
                                      bet.selection === option.name
                                  )
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                }`}
                                onClick={() =>
                                  handleOddSelection(
                                    market.id,
                                    market.title,
                                    option.name,
                                    option.odds
                                  )
                                }
                              >
                                <span>{option.name}</span>
                                <span className="font-bold">{option.odds}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Totals Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Totais
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {market.totalsOptions.map((option) => (
                              <Button
                                key={option.name}
                                variant="outline"
                                className={`justify-between ${
                                  selectedBets.some(
                                    (bet) =>
                                      bet.marketId === market.id &&
                                      bet.selection === option.name
                                  )
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                }`}
                                onClick={() =>
                                  handleOddSelection(
                                    market.id,
                                    market.title,
                                    option.name,
                                    option.odds
                                  )
                                }
                              >
                                <span>{option.name}</span>
                                <span className="font-bold">{option.odds}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </div>
            {/* Bet Slip Section */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-indigo-400">
                    Apostas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedBets.map((bet, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-700 rounded-lg relative"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeBet(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-sm font-medium text-gray-300">
                          {bet.marketName}
                        </p>
                        <p className="text-base font-semibold text-white mb-2">
                          {bet.selection} @ {bet.odds}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor={`stake-${index}`}
                            className="text-sm text-gray-300"
                          >
                            Aposta R$
                          </Label>
                          <Input
                            id={`stake-${index}`}
                            type="number"
                            className="w-24 h-8 bg-gray-600 border-gray-500 text-white"
                            value={bet.stake}
                            onChange={(e) => updateStake(index, e.target.value)}
                          />
                          <span className="text-sm text-gray-300">
                            Ganho potencial: R$
                            {calculatePotentialWin(bet.stake, bet.odds)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedBets.length > 0 && (
                    <>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">
                            Total a ser apostado:
                          </span>
                          <span className="font-semibold text-white">
                            R$ {calculateTotalStake()}
                          </span>
                        </div>
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={handleBetPlacement}
                        >
                          Fazer {selectedBets.length} aposta
                          {selectedBets.length !== 1 ? "s" : ""}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-indigo-400">
                    Apostas feitas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {betsMade.map((bet, index) => (
                      <div
                        key={bet.id}
                        className="p-3 bg-gray-700 rounded-lg relative"
                      >
                        <p className="text-sm font-medium text-gray-300">
                          {bet.market}
                        </p>
                        <p className="text-base font-semibold text-white mb-2">
                          {bet.outcome} @ {bet.multiplier}
                        </p>
                        <p className="text-sm text-gray-300">
                          Valor apostado: R$ {bet.valor}
                        </p>
                        <p className="text-sm text-gray-300">
                          Status: {bet.status}
                        </p>
                        <Button
                          className="w-full bg-indigo-600 text-white mt-2"
                          onClick={() => handleLiquidateBet(bet.id)}
                          disabled={bet.status !== "pendente"}
                        >
                          Liquidar Aposta
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
