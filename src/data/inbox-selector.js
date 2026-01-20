// src/data/inbox-selector.js
import { SCENARIOS } from './scenarios'

function appliesToLifestyle(appliesTo, lifestyle) {
  if (!appliesTo || appliesTo === 'all') return true
  const l = (lifestyle || '').toLowerCase()
  if (appliesTo === 'benefit') return l.includes('benefit')
  if (appliesTo === 'full|part') return l.includes('full') || l.includes('part')
  return l.includes(appliesTo)
}

function seededShuffle(arr, seed) {
  let r = [...arr]
  let s = (seed * 9301 + 49297) % 233280
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// Scenarios that should NEVER be “shuffled out” once they trigger.
// (You already have these ids in scenarios.js)
const PRIORITY_IDS = [
  'benefits_support_assessment',
  'benefits_jsa_application',

  // 🚨 FRAUD – must NEVER be dropped
  'bank-warning-scam-activity',
  'bank-warning-how-to-spot-smishing',
];


export function buildInboxForMonth(ctx) {
  // Skip month 0 entirely (let players settle in)
  if ((ctx.month ?? 0) < 1) {
    localStorage.setItem(`inbox_events_m${ctx.month}`, JSON.stringify([]))
    localStorage.setItem(`inbox_all_read_m${ctx.month}`, 'true')
    return []
  }

  const followKey = `followups_m${ctx.month}`
  const scheduledIds = JSON.parse(localStorage.getItem(followKey) || '[]')

  // Pull scheduled items (only those whose ids exist)
  const scheduled = scheduledIds
    .map(id => SCENARIOS.find(s => s.id === id))
    .filter(Boolean)

  // Base candidates from live triggers (exclude items that are marked scheduledOnly)
  const triggered = SCENARIOS.filter(
    s =>
      !s.scheduledOnly &&
      appliesToLifestyle(s.appliesTo, ctx.lifestyle) &&
      typeof s.trigger === 'function' &&
      s.trigger(ctx)
  )

  // Merge + unique
  const candidates = [...scheduled, ...triggered]
  const unique = []
  const seen = new Set()
  for (const s of candidates) {
    if (!s || seen.has(s.id)) continue
    seen.add(s.id)
    unique.push(s)
  }

  if (!unique.length) {
    localStorage.setItem(`inbox_events_m${ctx.month}`, JSON.stringify([]))
    localStorage.setItem(`inbox_all_read_m${ctx.month}`, 'true')
    return []
  }

  // Deterministic shuffle
  const shuffled = seededShuffle(
    unique,
    ctx.month + Math.floor(ctx.balanceAfterBills || 0)
  )

  // PRIORITY: always keep key benefits scenarios if they’re present this month
  const priority = shuffled.filter(s => PRIORITY_IDS.includes(s.id))
  const nonPriority = shuffled.filter(s => !PRIORITY_IDS.includes(s.id))

  // Overall cap 1–3 messages per month
  const max = Math.min(3, Math.max(1, shuffled.length))

  // Fill with priority first, then top-up with other random events
  const remainingSlots = Math.max(0, max - priority.length)
  const picked = [
    ...priority,
    ...nonPriority.slice(0, remainingSlots)
  ]

  localStorage.setItem(
    `inbox_events_m${ctx.month}`,
    JSON.stringify(picked.map(s => s.id))
  )

  // consume scheduled so they don't repeat next refresh
  if (scheduledIds.length) {
    localStorage.removeItem(followKey)
  }

  // If nothing got picked (very unlikely), mark month as “all read”
  if (!picked.length) {
    localStorage.setItem(`inbox_all_read_m${ctx.month}`, 'true')
  } else {
    localStorage.setItem(`inbox_all_read_m${ctx.month}`, 'false')
  }

  return picked
}

export function handleScenarioChoice(ctx, scenario, choice) {
  // Flags
  const flags = JSON.parse(localStorage.getItem('ph_flags') || '{}')
  Object.assign(flags, choice.flags || {})
  localStorage.setItem('ph_flags', JSON.stringify(flags))


  // Follow-ups
  const toSchedule = []
  if (
    scenario.next?.followUpId &&
    typeof scenario.next.afterMonths === 'number'
  ) {
    toSchedule.push({
      id: scenario.next.followUpId,
      offset: scenario.next.afterMonths,
    })
  }
  if (choice.next?.followUpId && typeof choice.next.afterMonths === 'number') {
    toSchedule.push({
      id: choice.next.followUpId,
      offset: choice.next.afterMonths,
    })
  }
  toSchedule.forEach(({ id, offset }) => {
    const target = ctx.month + offset
    const key = `followups_m${target}`
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    if (!list.includes(id)) list.push(id)
    localStorage.setItem(key, JSON.stringify(list))
  })

  // Effects stored for monthly totals
  const effKey = `inbox_effects_m${ctx.month}`
  const list = JSON.parse(localStorage.getItem(effKey) || '[]')
  const eff = choice.effects || {}
  list.push({
    label: `[Inbox] ${scenario.subject} → ${choice.label}`,
    money: eff.money || 0,
    health: eff.health || 0,
    wellbeing: eff.wellbeing || 0,
  })
  localStorage.setItem(effKey, JSON.stringify(list))
}
