import React, { useState } from "react";

const GradingForm = ({ selectedSubmission, onSubmit, onCancel }) => {
  // Use the selectedSubmission.id as key to force component reset
  const [score, setScore] = useState(
    () => selectedSubmission?.grade?.score?.toString() || "",
  );
  const [feedback, setFeedback] = useState(
    () => selectedSubmission?.grade?.feedback || "",
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      score: parseFloat(score) || 0,
      feedback,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      key={selectedSubmission?.id}
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Score
        </label>
        <input
          type="number"
          placeholder="Score"
          value={selectedSubmission ? score || "" : ""}
          onChange={(e) => setScore(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
          max={100}
          min={0}
          step="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Feedback
        </label>
        <textarea
          placeholder="Feedback"
          value={selectedSubmission ? feedback || "" : ""}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
          rows="4"
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 bg-slate-700 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          {selectedSubmission?.grade ? "Update Grade" : "Grade Submission"}
        </button>
      </div>
    </form>
  );
};

export default GradingForm;
