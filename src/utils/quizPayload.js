// Turns the quiz builder's questions into the server's format (same mapping the
// teacher portal uses): multiple choice and yes/no become SINGLE_CHOICE, written
// answers become TEXT_FORMAT for the teacher to mark.
export const builderQuestionsToApi = (questions = []) =>
  questions.map((q) => {
    const text = (q.questionText || "").trim();
    const marks = Number(q.marks) || 1;
    if (q.type === "multiple_choice") {
      const correct = String(q.correctAnswer || "").trim();
      return {
        question_text: text,
        question_type: "SINGLE_CHOICE",
        max_marks: marks,
        options: (q.options || []).map((opt) => ({
          option_text: String(opt).trim(),
          is_correct: String(opt).trim() === correct,
        })),
      };
    }
    if (q.type === "yes_no") {
      const ans = String(q.correctAnswer || "").trim().toLowerCase();
      return {
        question_text: text,
        question_type: "SINGLE_CHOICE",
        max_marks: marks,
        options: [
          { option_text: "Yes", is_correct: ans === "yes" },
          { option_text: "No", is_correct: ans === "no" },
        ],
      };
    }
    return { question_text: text, question_type: "TEXT_FORMAT", max_marks: marks, options: [] };
  });
