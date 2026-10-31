import { useState } from "react";
import { shareLink } from "../../../data/playArea/teasers";
import { GameOver, GhostButton, PrimaryButton, Stat, Status } from "../shared";

const ITEMS = {
  wolf: { emoji: "🐺", name: "Wolf" },
  goat: { emoji: "🐐", name: "Goat" },
  cabbage: { emoji: "🥬", name: "Cabbage" },
};
const START = { farmer: "L", wolf: "L", goat: "L", cabbage: "L" };
const BEST = 7;

// What goes wrong on a bank the farmer has left.
const trouble = (s) => {
  const away = (x) => s[x] !== s.farmer;
  if (away("wolf") && away("goat") && s.wolf === s.goat) return "Oh no! The wolf ate the goat.";
  if (away("goat") && away("cabbage") && s.goat === s.cabbage) return "Oh no! The goat ate the cabbage.";
  return null;
};

const RiverCrossing = ({ best, onResult, onExit }) => {
  const [side, setSide] = useState(START);
  const [boat, setBoat] = useState(null); // item riding with the farmer
  const [trips, setTrips] = useState(0);
  const [lost, setLost] = useState(null);
  const [result, setResult] = useState(null);

  const reset = () => {
    setSide(START);
    setBoat(null);
    setTrips(0);
    setLost(null);
    setResult(null);
  };

  const toggle = (item) => {
    if (lost || side[item] !== side.farmer) return;
    setBoat(boat === item ? null : item);
  };

  const cross = () => {
    if (lost) return;
    const to = side.farmer === "L" ? "R" : "L";
    const next = { ...side, farmer: to };
    if (boat) next[boat] = to;
    const t = trips + 1;
    setSide(next);
    setBoat(null);
    setTrips(t);
    const bad = trouble(next);
    if (bad) {
      setLost(bad);
      return;
    }
    if (Object.values(next).every((v) => v === "R")) {
      const isNewBest = onResult(t);
      setResult({ trips: t, isNewBest });
    }
  };

  if (result) {
    return (
      <GameOver
        title="Everyone crossed safely in"
        score={result.trips}
        unit="trips"
        best={Math.min(best || 99, result.trips)}
        isNewBest={result.isNewBest}
        note={result.trips === BEST ? "Perfect — 7 is the fewest possible, just as Alcuin worked out about 1,200 years ago." : `The fewest possible is ${BEST}. Can you do it?`}
        shareText={`I solved Alcuin's 1,200-year-old river puzzle in ${result.trips} trips on VCS Brain Teasers!`}
        shareLink={shareLink}
        onAgain={reset}
        onExit={onExit}
      />
    );
  }

  const bank = (id, label) => (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4 min-h-[220px] flex flex-col items-center gap-2">
      <p className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-1">{label}</p>
      {side.farmer === id && !boat && <span className="text-4xl" role="img" aria-label="Farmer">👨‍🌾</span>}
      {Object.entries(ITEMS).map(([k, it]) =>
        side[k] === id && boat !== k ? (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            disabled={side.farmer !== id || Boolean(lost)}
            aria-label={`${it.name}${side.farmer === id ? " — tap to put in the boat" : ""}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${side.farmer === id ? "border-white/20 hover:border-amber-300 hover:bg-amber-500/10" : "border-transparent"}`}
          >
            <span className="text-3xl sm:text-4xl" aria-hidden="true">{it.emoji}</span>
            <span className="hidden sm:inline text-sm font-bold text-slate-200">{it.name}</span>
          </button>
        ) : null,
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
        <Stat label="Trips" value={trips} color="text-cyan-300" />
        <Stat label="Fewest" value={BEST} color="text-emerald-300" />
        <Stat label="Best" value={best || "–"} color="text-amber-300" />
      </div>
      <Status tone={lost ? "bad" : "info"}>
        {lost || "Get everyone across. Never leave the wolf with the goat, or the goat with the cabbage!"}
      </Status>
      <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-2 sm:gap-4 max-w-3xl mx-auto mt-4">
        {bank("L", "This side")}
        <div className="rounded-2xl bg-gradient-to-b from-sky-500/30 to-blue-600/30 border border-sky-400/30 p-2 flex flex-col justify-center">
          <div className={`flex ${side.farmer === "L" ? "justify-start" : "justify-end"}`}>
            <button
              type="button"
              onClick={() => boat && toggle(boat)}
              aria-label={boat ? `Boat with farmer and ${ITEMS[boat].name} — tap to unload` : "Boat with farmer"}
              className="flex flex-col items-center px-2 py-2 rounded-xl bg-amber-900/60 border border-amber-600/60"
            >
              <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">👨‍🌾{boat ? ITEMS[boat].emoji : ""}</span>
              <span className="text-xs font-bold text-amber-200 mt-1">⛵ boat</span>
            </button>
          </div>
        </div>
        {bank("R", "Other side")}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {lost ? (
          <PrimaryButton onClick={reset}><i className="fas fa-rotate-right mr-2" aria-hidden="true" />Try again</PrimaryButton>
        ) : (
          <PrimaryButton onClick={cross}>
            Cross the river {boat ? `with the ${ITEMS[boat].name.toLowerCase()}` : "alone"} <i className="fas fa-arrow-right-arrow-left ml-2" aria-hidden="true" />
          </PrimaryButton>
        )}
        <GhostButton onClick={reset}>Start over</GhostButton>
      </div>
      <p className="text-center text-sm text-slate-300 mt-3">Tap an animal or the cabbage on the farmer's side to put it in the boat. The boat holds the farmer and one more.</p>
    </div>
  );
};

export default RiverCrossing;
