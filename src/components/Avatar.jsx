// src/components/Avatar.jsx
import { useMemo } from 'react'
import { avatarUrl } from '../lib/avatar'

export default function Avatar({ size=42 }){
  const name = localStorage.getItem('playerName') || 'player'
  const seed = localStorage.getItem('playerAvatarSeed') || name
  const mood = localStorage.getItem('avatarMood') || 'happy'
  const src = useMemo(()=>avatarUrl(seed, mood, size), [seed, mood, size])
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} style={{ width:size, height:size, borderRadius:12 }} />
}
