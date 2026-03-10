import { useState } from 'react';

export default function SectionRating({ topic, currentScore, onRate }) {
  const [rated, setRated] = useState(false);

  const handleRate = (delta) => {
    onRate(topic, delta);
    setRated(true);
  };

  if (rated) {
    return (
      <span className="font-mono text-[10px] text-pulse-muted">
        Rated — thanks
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="font-mono text-[10px] text-pulse-muted mr-1">
        Useful?
      </span>
      <button
        onClick={() => handleRate(1)}
        className="px-2 py-0.5 text-xs rounded border border-pulse-border hover:border-green-500 hover:text-green-400 text-pulse-muted transition-colors"
        title="This section was useful"
      >
        +1
      </button>
      <button
        onClick={() => handleRate(-1)}
        className="px-2 py-0.5 text-xs rounded border border-pulse-border hover:border-pulse-danger hover:text-pulse-danger text-pulse-muted transition-colors"
        title="This section was not useful"
      >
        -1
      </button>
      <button
        onClick={() => handleRate(0)}
        className="px-2 py-0.5 text-[10px] rounded border border-pulse-border text-pulse-muted hover:text-pulse-secondary transition-colors"
      >
        Skip
      </button>
      {currentScore !== undefined && (
        <span className="font-mono text-[10px] text-pulse-muted ml-1">
          score: {currentScore}
        </span>
      )}
    </div>
  );
}
