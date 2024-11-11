"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { soccerBall, basketball } from "@lucide/lab";
import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const Modal = ({ isOpen, onClose, markets, selectedSport }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const filteredMarkets = markets.filter(market => {
    if (selectedSport === "futebol") {
      return market.group === "Soccer";
    } else if (selectedSport === "basquete") {
      return market.group === "Basketball";
    }
    return true;
  });

  const handleMarketSelection = (market) => {
    router.push(`/betting?market=${encodeURIComponent(market.key)}&sport=${encodeURIComponent(selectedSport)}`);
  };
  console.log(filteredMarkets)
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
    
      <div className="relative bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-white">Selecione um mercado</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-4">
            {filteredMarkets.map((market) => (
              <Card
                key={market.key}
                className="bg-gray-900 border-gray-700 hover:border-indigo-300 transition-colors duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">
                        {market.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {market.description}
                      </p>
                    </div>
                    <Button 
                      className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold"
                      onClick={() => handleMarketSelection(market)}
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-900">
        </div>
      </div>
    </div>
  );
};

export default function SportSelection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedSport, setSelectedSport] = useState(""); 

  const handleSportSelection = (sport) => {
    setSelectedSport(sport); 
    setIsModalOpen(true);
  };
  
  useEffect(() => {
    if (isModalOpen) {
      fetch("http://127.0.0.1:8000/mercados", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched markets data:", data);
          setMarkets(data);
        })
        .catch((error) => console.error("Error fetching markets:", error));
    }
  }, [isModalOpen]);

  const IconRenderer = ({ icon, size = 96, color = "currentColor", strokeWidth = 2 }) => {
    return (
      <svg
        width={84}
        height={84}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.map((node, index) => {
          const [Element, attributes] = node;
          return React.createElement(Element, { key: index, ...attributes });
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <h1 className="text-2xl font-bold text-indigo-200">BetMaster</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold text-white">Escolha o esporte</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["futebol", "basquete"].map((sport) => (
              <Card
                key={sport}
                className={`bg-gray-800 border-2 transition-all cursor-pointer overflow-hidden ${
                  "border-transparent hover:border-indigo-500"
                }`}
                onClick={() => handleSportSelection(sport)}
              >
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${sport === "futebol" ? "bg-green-500" : "bg-orange-500"}`}>
                    {sport === "futebol" ? (
                      <IconRenderer icon={soccerBall} size={24} color="white" strokeWidth={2} />
                    ) : (
                      <IconRenderer icon={basketball} size={24} color="white" strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {sport === "futebol" ? "Futebol" : "Basquete"}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} markets={markets} selectedSport={selectedSport} />
    </div>
  );
}
