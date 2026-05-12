import React, { useState } from "react";

const GradingForm = ({ selectedSubmission, onSubmit, onCancel, assignmentMaxScore }) => {
  // Use the selectedSubmission.id as key to force component reset
  const [score, setScore] = useState(
    () => selectedSubmission?.grade?.score?.toString() || "",
  );
  const [feedback, setFeedback] = useState(
    () => selectedSubmission?.grade?.feedback || "",
  );
  const [scoreError, setScoreError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (score === "" || score === null || score === undefined) {
      setScoreError("Score is required — enter 0 or higher");
      return;
    }
    const numeric = parseFloat(score);
    if (isNaN(numeric) || numeric < 0) {
      setScoreError("Score must be 0 or greater");
      return;
    }
    if (assignmentMaxScore !== undefined && assignmentMaxScore !== null && numeric > parseFloat(assignmentMaxScore)) {
      setScoreError(`Score cannot exceed max marks (${assignmentMaxScore})`);
      return;
    }

    setScoreError("");
    onSubmit({ score: numeric, feedback });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      key={selectedSubmission?.id}
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Score: (<span className="mb-6 text-sm text-slate-400">Max Score: {assignmentMaxScore}</span>)
        </label>
        <input
          type="number"
          placeholder="Score"
          value={selectedSubmission ? score : ""}
          onChange={(e) => { setScore(e.target.value); setScoreError(""); }}
          className={`w-full p-3 rounded-xl bg-slate-800 border text-white ${scoreError ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-700"}`}
          max={assignmentMaxScore}
          min={0}
          step="0.1"
        />
        {scoreError && (
          <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1.5">
            <i className="fas fa-exclamation-circle" />
            {scoreError}
          </p>
        )}
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
