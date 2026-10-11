import { store } from "../store";

// Admin → Platform Settings → "Default marks per question". New quiz questions
// start with this value; the teacher can still change it per question.
export const defaultQuizMarks = () => {
  const n = Number(store.getState()?.platformSettings?.data?.quiz_marks_per_question);
  return n > 0 ? n : 1;
};

// "Submission window (days)": default gap between a quiz opening and its deadline.
export const defaultQuizWindowDays = () => {
  const n = Number(store.getState()?.platformSettings?.data?.quiz_submission_days);
  return n > 0 ? n : 2;
};

// "Open new quizzes straight away": whether the quiz form starts with "now" as the opening time.
export const quizOpensImmediately = () =>
  store.getState()?.platformSettings?.data?.quiz_publish_immediately !== false;
