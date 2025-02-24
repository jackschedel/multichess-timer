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
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

interface Player {
  id: number;
  timeLeft: number;
  isActive: boolean;
  isOut: boolean;
}

export default function HomePage() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [playerLost, setPlayerLost] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [selectedCount, setSelectedCount] = React.useState<string>("2");
  const [timePerPlayer, setTimePerPlayer] = React.useState<number>(300);
  const [increment, setIncrement] = React.useState<number>(5);
  const [eliminationMode, setEliminationMode] = React.useState(true);

  const intervalRef = React.useRef<number | null>(null);

  const initializePlayers = () => {
    const count = parseInt(selectedCount);
    const newPlayers = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      timeLeft: timePerPlayer,
      isActive: index === 0,
      isOut: false,
    }));
    setPlayers(newPlayers);
    setIsInitialized(true);
    setIsRunning(false);
  };

  const resetGame = () => {
    setPlayerLost(false);
    setHasStarted(false);
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

      const newPlayers = currentPlayers.map((player, index) => {
        if (index === activePlayerIndex && player.timeLeft > 0) {
          return {
            ...player,
            timeLeft: player.timeLeft - 1,
          };
        }
        return player;
      });

      const activePlayer = newPlayers[activePlayerIndex];
      if (activePlayer && activePlayer.timeLeft <= 0) {
        setIsRunning(false);
        setPlayerLost(true);
        newPlayers[activePlayerIndex] = {
          ...activePlayer,
          isOut: eliminationMode,
        };
      }

      return newPlayers;
    });
  }, [eliminationMode]);

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

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Lost";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const nextPlayer = () => {
    setPlayerLost(false);
    setPlayers((currentPlayers) => {
      const activePlayerIndex = currentPlayers.findIndex(
        (player) => player.isActive,
      );

      // Find the next valid player
      let nextPlayerIndex = (activePlayerIndex + 1) % currentPlayers.length;
      let loopCount = 0;

      // Add a check for remaining players
      const hasRemainingPlayers = currentPlayers.some(
        (player) =>
          !player.isOut || player.id === currentPlayers[activePlayerIndex]?.id,
      );

      if (!hasRemainingPlayers) {
        // If no players remain, stop the game
        setIsRunning(false);
        return currentPlayers;
      }

      // Find next non-eliminated player
      while (
        eliminationMode &&
        currentPlayers[nextPlayerIndex]?.isOut &&
        loopCount < currentPlayers.length
      ) {
        nextPlayerIndex = (nextPlayerIndex + 1) % currentPlayers.length;
        loopCount++;
      }

      return currentPlayers.map((player, index) => {
        var newTimeLeft = player.timeLeft;
        if (index === activePlayerIndex) {
          if (player.timeLeft > 0) {
            newTimeLeft = player.timeLeft + increment;
          } else if (!eliminationMode) {
            newTimeLeft = timePerPlayer;
          }
        }
        return {
          ...player,
          isActive: index === nextPlayerIndex,
          timeLeft: newTimeLeft,
        };
      });
    });
    setIsRunning(true);
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

            <div className="flex items-center space-x-2">
              <Switch
                id="elimination-mode"
                checked={eliminationMode}
                onCheckedChange={setEliminationMode}
                disabled={isInitialized}
              />
              <Label htmlFor="elimination-mode">
                Eliminate players when time runs out
              </Label>
            </div>
          </div>

          {!isInitialized ? (
            <Button onClick={initializePlayers} className="w-full">
              Initialize Game
            </Button>
          ) : (
            <div className="flex gap-2">
              {isRunning && (
                <Button
                  onClick={() => setIsRunning(false)}
                  className="w-full"
                  variant="destructive"
                >
                  Pause
                </Button>
              )}
              {(!isRunning || !hasStarted) && !playerLost && (
                <Button
                  onClick={() => {
                    setIsRunning(true);
                    setHasStarted(true);
                  }}
                  className="w-full"
                  variant="default"
                >
                  Play
                </Button>
              )}
              {hasStarted && (
                <Button onClick={nextPlayer} className="w-full">
                  Next Player
                </Button>
              )}
              {!isRunning && (
                <Button
                  onClick={resetGame}
                  className="w-full"
                  variant="outline"
                >
                  Reset
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {players.map((player) => (
            <Card
              key={player.id}
              className={`${
                player.isActive ? "border-2 border-green-500" : ""
              } ${player.timeLeft <= 0 ? "border-2 border-red-500" : ""}`}
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
