"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Player {
  id: number;
  timeLeft: number;
  isActive: boolean;
}

export default function HomePage() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [selectedCount, setSelectedCount] = React.useState<string>("2");
  const [timePerPlayer, setTimePerPlayer] = React.useState<number>(300);
  const [increment, setIncrement] = React.useState<number>(5);

  // Ref to store the interval ID
  const intervalRef = React.useRef<number | null>(null);

  const initializePlayers = () => {
    const count = parseInt(selectedCount);
    const newPlayers = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      timeLeft: timePerPlayer,
      isActive: index === 0,
    }));
    setPlayers(newPlayers);
    setIsInitialized(true);
    setIsRunning(false);
  };

  const resetGame = () => {
    setPlayers([]);
    setIsRunning(false);
    setIsInitialized(false);
  };

  const tick = React.useCallback(() => {
    setPlayers((currentPlayers) => {
      const activePlayerIndex = currentPlayers.findIndex(
        (player) => player.isActive,
      );

      if (activePlayerIndex === -1) return currentPlayers;

      // Create a new array to avoid mutating state
      const newPlayers = currentPlayers.map((player, index) => {
        if (index === activePlayerIndex) {
          return {
            ...player,
            timeLeft: player.timeLeft - 1,
          };
        }
        return player;
      });

      // Check if the active player's time has run out
      const activePlayer = newPlayers[activePlayerIndex];
      if (activePlayer && activePlayer.timeLeft <= 0) {
        const nextPlayerIndex = (activePlayerIndex + 1) % newPlayers.length;
        // Deactivate the current player
        newPlayers[activePlayerIndex] = {
          ...activePlayer,
          isActive: false,
        };
        // Activate the next player
        if (newPlayers[nextPlayerIndex]) {
          newPlayers[nextPlayerIndex].isActive = true;
        }
      }

      return newPlayers;
    });
  }, []);

  React.useEffect(() => {
    if (isRunning) {
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(tick, 1000);
      }
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]); // Include tick in dependencies

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const nextPlayer = () => {
    setPlayers((currentPlayers) => {
      const activePlayerIndex = currentPlayers.findIndex(
        (player) => player.isActive,
      );
      const nextPlayerIndex = (activePlayerIndex + 1) % currentPlayers.length;

      return currentPlayers.map((player, index) => {
        if (index === activePlayerIndex) {
          // Add increment to the player who just finished their turn
          return {
            ...player,
            isActive: false,
            timeLeft: player.timeLeft + increment, // Add increment here
          };
        }
        return {
          ...player,
          isActive: index === nextPlayerIndex,
        };
      });
    });
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-center text-2xl font-bold">Player Timer</h1>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label
                htmlFor="playerCount"
                className="block text-sm font-medium"
              >
                Number of Players
              </label>
              <Select
                value={selectedCount}
                onValueChange={(value) => setSelectedCount(value)}
                disabled={isInitialized}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Number of players" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Players
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="timePerPlayer"
                className="block text-sm font-medium"
              >
                Time per Player ({Math.floor(timePerPlayer / 60)}min{" "}
                {timePerPlayer % 60}s)
              </label>
              <Input
                id="timePerPlayer"
                type="number"
                placeholder="Time per player (seconds)"
                value={timePerPlayer}
                onChange={(e) =>
                  setTimePerPlayer(parseInt(e.target.value) || 0)
                }
                className="w-full"
                disabled={isInitialized}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="increment" className="block text-sm font-medium">
                Increment Time (seconds)
              </label>
              <Input
                id="increment"
                type="number"
                placeholder="Increment (seconds)"
                value={increment}
                onChange={(e) => setIncrement(parseInt(e.target.value) || 0)}
                className="w-full"
                disabled={isInitialized}
              />
            </div>
          </div>

          {!isInitialized ? (
            <Button onClick={initializePlayers} className="w-full">
              Initialize Game
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning((prev) => !prev)}
                className="w-full"
                variant={isRunning ? "destructive" : "default"}
              >
                {isRunning ? "Pause" : "Play"}
              </Button>
              {isRunning && (
                <Button onClick={nextPlayer} className="w-full">
                  Next Player
                </Button>
              )}
              <Button onClick={resetGame} className="w-full" variant="outline">
                Reset
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {players.map((player) => (
            <Card
              key={player.id}
              className={`${
                player.isActive ? "border-2 border-green-500" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Player {player.id}</h2>
                  <p className="text-3xl font-bold">
                    {formatTime(player.timeLeft)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
