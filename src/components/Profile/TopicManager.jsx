import { useState } from 'react';
import { DEFAULT_TOPICS } from '../../constants/topics.js';

export default function TopicManager({ selectedTopics, onChange }) {
  const [customTopic, setCustomTopic] = useState('');

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      onChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onChange([...selectedTopics, topic]);
    }
  };

  const addCustomTopic = () => {
    const trimmed = customTopic.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      onChange([...selectedTopics, trimmed]);
      setCustomTopic('');
    }
  };

  const allTopics = [
    ...DEFAULT_TOPICS,
    ...selectedTopics.filter((t) => !DEFAULT_TOPICS.includes(t)),
  ];

  return (
    <div>
      <label className="block font-mono text-xs text-pulse-secondary mb-2">
        Topics
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {allTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => toggleTopic(topic)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              selectedTopics.includes(topic)
                ? 'bg-pulse-accent/20 border border-pulse-accent text-pulse-accent'
                : 'bg-pulse-surface border border-pulse-border text-pulse-muted hover:border-pulse-secondary'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
          placeholder="Add custom topic..."
          className="flex-1 bg-pulse-surface border border-pulse-border rounded px-3 py-1.5 text-pulse-text font-mono text-xs focus:border-pulse-accent focus:outline-none"
        />
        <button
          onClick={addCustomTopic}
          className="px-3 py-1.5 bg-pulse-accent/20 text-pulse-accent font-mono text-xs rounded hover:bg-pulse-accent/30 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
