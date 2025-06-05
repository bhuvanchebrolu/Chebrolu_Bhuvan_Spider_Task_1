# 🔨 Hammer Strength Test

A fun browser-based 2-player precision game where each player must stop a swinging needle as close to 90° as possible to measure their "strength."

---

## 🎮 Gameplay

- The needle continuously swings back and forth across a semicircle (0° to 180°).
- **Player 1** starts. Click `Start`, then `Stop!` to stop the needle.
- The closer you stop to **90°**, the higher your score (max: 100).
- A hammer animation and vertical fill bar visually reflect your power.
- Then it's **Player 2**’s turn.
- After both players take their turn, the game compares scores and declares a winner.

---

## 🧠 Scoring Formula
Score = 100 - |90 - currentAngle|


- Example: Stopping at 92.3° yields a score of 97.7.
- Perfect stop at 90° = 100.

---

## 🕹️ Controls

| Button      | Action                                |
|-------------|----------------------------------------|
| `Start`     | Begins the needle swing                |
| `Stop!`     | Stops the needle and calculates score  |
| `Replay`    | Resets needle, hammer, score bar, and table |

---

## 📦 Assets

- `strength_meter.png` — Background for the strength meter
- `hammer.png` — Hammer image that animates when you stop
- Assets are rendered on top of HTML canvas for visual effects.

---
## 🧪 Features

- Real-time angle tracking using trigonometry
- Hammer bounce animation
- Strength meter with gradient fill
- Game state with turn tracking
- Scoreboard with player results



