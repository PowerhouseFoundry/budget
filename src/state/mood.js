// src/state/mood.js
// Standalone mood helper so we don't rely on store.js exporting it.
export function moodFromScores(health=100, wellbeing=100){
  // <=10% -> sad, <50% -> worried, else happy
  if (health <= 10 || wellbeing <= 10) return 'sad'
  if (health < 50 || wellbeing < 50) return 'worried'
  return 'happy'
}
