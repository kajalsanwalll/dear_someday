
export const journalPrompts = [
  "What are three things I am grateful for today?",
  "What would my future self thank me for doing today?",
  "What am I currently calling into my life?",
  "What would my life look like if I trusted the timing of everything?",
  "What little moment made me smile today?",
  "What am I ready to release?",
  "How can I show myself more love today?",
  "What is something I once wished for that I have now?",
  "What does the version of me I am becoming believe?",
  "What would I do today if I knew everything would work out?",
  "What am I proud of myself for lately?",
  "What does abundance mean to me beyond money?",
  "What thoughts deserve more of my attention?",
  "What am I learning about myself in this season?",
  "What would my dream ordinary day look like?",
  "What is one small action I can take toward my dream?",
  "What do I want to feel more often in my life?",
  "What am I grateful for that I usually take for granted?",
  "What belief about myself am I outgrowing?",
  "If I could write a letter to my future self, what would I say?",
  "What has life been teaching me lately?",
  "What makes me feel most like myself?",
  "What would I choose if I weren't afraid of judgment?",
  "What beautiful possibilities am I open to?",
  "How have I grown over the last year?",
  "What does peace look like in my life right now?",
  "What is something I want to experience at least once?",
  "What can I celebrate about today, no matter how small?",
  "What do I need to hear right now?",
  "Describe the life I am creating as if I am already living it.",
];

export function getDailyPrompt() {
  const now = new Date();

  // Use the local calendar date so the prompt changes at local midnight.
  const dateKey =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();

  return journalPrompts[dateKey % journalPrompts.length];
}
