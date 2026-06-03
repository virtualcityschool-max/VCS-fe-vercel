import React, { useState } from "react";
import { Button } from "../ui";

const DistinctionsEditor = ({ distinctions, onChange }) => {
  const [newDistinction, setNewDistinction] = useState({
    title: "",
    org: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDistinction = () => {
    if (newDistinction.title.trim() && newDistinction.org.trim()) {
      const updatedDistinctions = [
        ...distinctions,
        {
          title: newDistinction.title.trim(),
          org: newDistinction.org.trim(),
        },
      ];
      onChange(updatedDistinctions);
      setNewDistinction({ title: "", org: "" });
      setIsAdding(false);
    }
  };

  const handleRemoveDistinction = (index) => {
    const updatedDistinctions = distinctions.filter((_, i) => i !== index);
    onChange(updatedDistinctions);
  };

  const handleCancelAdd = () => {
    setNewDistinction({ title: "", org: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Existing Distinctions */}
      {distinctions && distinctions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {distinctions.map((distinction, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm"
            >
              <span>
                {distinction.title} - {distinction.org}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveDistinction(index)}
                className="text-indigo-400 hover:text-red-400 transition"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Distinction */}
      {!isAdding ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="border-dashed border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Distinction
        </Button>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium text-white">
            Add New Distinction
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newDistinction.title}
                onChange={(e) =>
                  setNewDistinction((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Best Tutor"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={newDistinction.org}
                onChange={(e) =>
                  setNewDistinction((prev) => ({
                    ...prev,
                    org: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., MIT"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddDistinction}
              disabled={
                !newDistinction.title.trim() || !newDistinction.org.trim()
              }
            >
              <i className="fas fa-check mr-1"></i>
              Add
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancelAdd}
            >
              <i className="fas fa-times mr-1"></i>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!distinctions ||
        (distinctions.length === 0 && !isAdding && (
          <div className="text-center py-8 text-slate-500">
            <i className="fas fa-award text-2xl mb-2"></i>
            <p className="text-sm">No distinctions added yet</p>
            <p className="text-xs mt-1">
              Click "Add Distinction" to get started
            </p>
          </div>
        ))}
    </div>
  );
};

export default DistinctionsEditor;
