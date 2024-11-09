"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Soccer, Basketball } from "lucide-react"

export function SportSelectionComponent() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null)

  const handleSportSelection = (sport: string) => {
    setSelectedSport(sport)
    // Here you would typically navigate to the next page or update the UI
    console.log(`Selected sport: ${sport}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-500">BetMaster</h1>
          <nav>
            <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
            <Button variant="outline" className="ml-4 text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white">Sign Up</Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold text-white">Choose Your Game</h2>
            <p className="mt-2 text-sm text-gray-400">Select a sport to start betting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['futebol', 'basquete'].map((sport) => (
              <Card 
                key={sport}
                className={`bg-gray-800 border-2 transition-all cursor-pointer overflow-hidden ${
                  selectedSport === sport 
                    ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' 
                    : 'border-transparent hover:border-indigo-500'
                }`}
                onClick={() => handleSportSelection(sport)}
              >
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${sport === 'futebol' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {sport === 'futebol' ? (
                      <Soccer className="w-8 h-8 text-white" />
                    ) : (
                      <Basketball className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{sport === 'futebol' ? 'Futebol' : 'Basquete'}</h3>
                    <p className="text-sm text-gray-400">
                      {sport === 'futebol' ? 'Soccer matches' : 'Basketball games'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSport && (
            <div className="text-center">
              <Button 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md text-lg transition-colors duration-300"
                onClick={() => console.log(`Proceeding with ${selectedSport}`)}
              >
                Start Betting on {selectedSport === 'futebol' ? 'Futebol' : 'Basquete'}
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          &copy; 2024 BetMaster. All rights reserved.
        </div>
      </footer>
    </div>
  )
}