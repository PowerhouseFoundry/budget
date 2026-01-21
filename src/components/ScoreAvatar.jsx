// src/components/ScoreAvatar.jsx
import React from 'react'

function clamp(val, min, max) {
  if (typeof val !== 'number' || Number.isNaN(val)) return min
  return Math.max(min, Math.min(max, val))
}

// Wellbeing → mood
// happy > 75, ok 35–75, sad < 35
function moodFromWellbeing(value) {
  const v = clamp(value, 0, 100)
  if (v > 75) return 'happy'
  if (v >= 35) return 'ok'
  return 'sad'
}

// Money → tier
function tierFromMoney(money) {
  const m = Number(money || 0)
  if (m >= 4000) return 'veryrich'
  if (m >= 2000) return 'rich'
  return null
}

function normGender(gender) {
  const g = (gender || localStorage.getItem('avatar_gender') || 'male')
    .toLowerCase()
  return g === 'female' ? 'female' : 'male'
}

export default function ScoreAvatar({
  gender,
  money = 0,
  wellbeing = 0,
  size = 260,
}) {
  const g = normGender(gender)
  const mood = moodFromWellbeing(wellbeing)
  const tier = tierFromMoney(money)

  /**
   * File naming (ALL HYPHENS):
   *
   * Normal:
   *   avatar-male-happy.png
   *
   * Rich:
   *   avatar-male-rich-happy.png
   *
   * Very rich:
   *   avatar-male-veryrich-happy.png
   */
  const fileName = tier
    ? `avatar-${g}-${tier}-${mood}.png`
    : `avatar-${g}-${mood}.png`

const src = `${import.meta.env.BASE_URL}avatars/${fileName}`


  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <img
        src={src}
        alt="Your character"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
        }}
        onError={(e) => {
          // Safety fallback: always fall back to normal "ok"
          e.currentTarget.src = `${import.meta.env.BASE_URL}avatars/avatar-${g}-ok.png`

        }}
      />
    </div>
  )
}
