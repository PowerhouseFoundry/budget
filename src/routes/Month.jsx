// src/routes/Month.jsx
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect, useCallback } from 'react'

import {
  HOUSING,
  FOOD,
  FOOD_EXTRAS,
  TRANSPORT,
  LEISURE_ACTIVITIES,
  LEISURE_UPGRADES,
  STREAMING_SUBS,
  PHONE,
  BROADBAND,
  BILLS,
  BILL_LABELS
} from '../data/options'
import MonthEndSummary from '../components/MonthEndSummary'
import './Month.css'
import ScoreAvatar from '../components/ScoreAvatar'
import WhatsAppPhone from "../components/WhatsAppPhone";



// ---------------------------------------------------------------------------
// Display font used for titles / headings (you add this font in assets/fonts)
const DISPLAY_FONT = "'PowerhouseDisplay', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// CLICK SAFETY: never let parent overlays/links swallow the click.
const safeOnClick = (fn) => (e) => {
  if (e && typeof e.preventDefault === 'function') e.preventDefault()
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
  if (typeof fn === 'function') fn()
}

// IMAGES: if you’re serving from /public/images
const IMG = (file) => `/images/${file}`

const IMG_MAP = {
  // --- Housing ---
  housing_shared:    IMG('housing_shared.png'),
  housing_studio:    IMG('housing_studio.png'),
  housing_onebed:    IMG('housing_onebed.png'),

  // --- Food (main) ---
  food_budget:       IMG('food_budget.png'),
  food_balanced:     IMG('food_balanced.png'),
  food_luxury:       IMG('food_luxury.png'),

  // --- Food extras ---
  takeaway:          IMG('takeaway.png'),
  eat_out:           IMG('eat_out.png'),

  // --- Transport ---
  walk:              IMG('transport_walk.png'),
  bus_pass:          IMG('transport_bus_pass.png'),
  bike:              IMG('transport_bike.png'),
winter_walking_dip: IMG('winter_walking_dip.png'),

  // --- Phone plans ---
  sim_only:          IMG('phone_sim_only.png'),
  mid_plan:          IMG('phone_mid_plan.png'),
  unlimited:         IMG('phone_unlimited.png'),

  // --- Broadband plans ---
  bb_basic:          IMG('broadband_bb_basic.png'),
  bb_fibre:          IMG('broadband_bb_fibre.png'),
  bb_fast:           IMG('broadband_fast.png'),
  // --- Income ---
  income_benefits:   IMG('income_benefits.png'),
  income_parttime:   IMG('income_parttime.png'),
  income_fulltime:   IMG('income_fulltime.png'),

  // --- Bills (for when/if you hook them up) ---
  bill_council_tax:  IMG('bills_council_tax.png'),
  bill_gas_electric: IMG('bills_energy.png'),
  bill_tv_licence:   IMG('bills_tv_license.png'),
  bill_water:        IMG('bills_water.png'),

  // --- Leisure one-offs ---
  leisure_cinema:      IMG('leisure_cinema.png'),
  leisure_concert:     IMG('leisure_concert.png'),
  leisure_shortbreak:  IMG('leisure_shortbreak.png'),
  leisure_stay_in:     IMG('leis_stay_in.png'),

  // --- Upgrades ---
  upgrade_tv:          IMG('upgrade_tv.png'),
  upgrade_console:     IMG('upgrade_console.png'),
  upgrade_bike:        IMG('upgrade_bike.png'),
  upgrade_gym:         IMG('upgrade_gym.png'),
  upgrade_instrument:  IMG('upgrade_instrument.png'),

  // --- Streaming subscriptions ---
  sub_netflix:       IMG('sub_netflix.png'),
  sub_prime:         IMG('sub_prime.png'),
  sub_spotify:       IMG('sub_spotify.png'),
  sub_disney:        IMG('sub_disney.png'),
  sub_sky:           IMG('sub_sky.png'),
  sub_apple:         IMG('sub_apple.png'),
}

// Fallbacks
const FALLBACK_BY_CAT = {
  housing:   IMG('housing_shared.png'),
  food:      IMG('food_budget.png'),
  transport: IMG('transport_walk.png'),
  phone:     IMG('phone_mid_plan.png'),
  broadband: IMG('broadband_bb_basic.png'),
  leisure:   IMG('leisure_cinema.png'),
  sub:       IMG('sub_netflix.png'),
  extra:     IMG('takeaway.png'),
  bill:      IMG('bills_council_tax.png'),
  default:   IMG('food_balanced.png'),
}
// --- Housing photo galleries (Rightmove-ish) ---
const HOUSING_GALLERY = {
  housing_shared: {
    subtitle: "Shared house • Bills included",
    keyFacts: ["Furnished room", "Shared kitchen & lounge", "10 min to shops"],
    photos: [
      IMG("housing/shared/1.jpg"),
      IMG("housing/shared/2.jpg"),
      IMG("housing/shared/3.jpg"),
      IMG("housing/shared/4.jpg"),
      IMG("housing/shared/5.jpg"),
    ],
  },
  housing_studio: {
    subtitle: "Studio flat • Your own space",
    keyFacts: ["Private kitchenette", "Short commute", "Council tax extra"],
    photos: [
      IMG("housing/studio/1.jpg"),
      IMG("housing/studio/2.jpg"),
      IMG("housing/studio/3.jpg"),
      IMG("housing/studio/4.jpg"),
      IMG("housing/studio/5.jpg"),
    ],
  },
  housing_onebed: {
    subtitle: "1-bed flat • More room",
    keyFacts: ["Separate bedroom", "Good for routine", "Higher monthly costs"],
    photos: [
      IMG("housing/onebed/1.jpg"),
      IMG("housing/onebed/2.jpg"),
      IMG("housing/onebed/3.jpg"),
      IMG("housing/onebed/4.jpg"),
      IMG("housing/onebed/5.jpg"),
    ],
  },
};


function withImg(item, categoryKey = 'default') {
  const id = String(item?.id ?? '')
  const src = item?.img || IMG_MAP[id] || FALLBACK_BY_CAT[categoryKey] || FALLBACK_BY_CAT.default
  return { ...item, img: src }
}
function injectImages(arr, categoryKey = 'default') {
  return (arr || []).map(it => withImg(it, categoryKey))
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const INFO = {
  // Housing
  housing_shared: { title: 'Shared House', body: 'Cheapest option. You share with housemates. Lower privacy may reduce well-being slightly. Bills are split but you still budget monthly.' },
  housing_studio: { title: 'Studio Flat', body: 'Private space in one room. Moderate rent with personal space. Balanced impact on well-being and routine.' },
  housing_onebed: { title: '1-Bed House', body: 'More space and privacy, often with a small garden. Higher rent and bills; better routine and comfort for well-being.' },

  // Food
  food_budget:   { title: 'Budget Shop', body: 'Focus on lowest-price items, value brands, and batch-cooking cheap meals. Saves money, but poorer nutrition can lower health and well-being.' },
  food_balanced: { title: 'Balanced Shop', body: 'Mix of value and fresh food. Cooking at home with fruit/veg and basic proteins. Small positive effect on health; neutral on well-being.' },
  food_luxury:   { title: 'Premium Shop', body: 'More branded items, treats, and convenience options. Higher weekly cost. Boosts well-being slightly (treat factor).' },

  // Phone
  sim_only:  { title: 'SIM Only', body: 'Keep your handset, pay for minutes/data only. Lowest cost.' },
  mid_plan:  { title: 'Mid Plan', body: 'Balanced minutes/data. Mid-range monthly cost.' },
  unlimited: { title: 'Unlimited Plan', body: 'Unlimited data/minutes. Highest monthly cost—good for heavy users.' },

  // Broadband
  bb_basic: { title: 'Basic Broadband', body: 'Entry speed suitable for light browsing.' },
  bb_fibre: { title: 'Fibre', body: 'Faster speeds for streaming and work-from-home.' },
  bb_fast:  { title: 'Superfast Fibre', body: 'High-speed for multiple devices and gaming.' },

  // Transport
  walk:      { title: 'Walking', body: 'Free, healthy option. Winter months can reduce health and well-being due to weather/time.' },
  bus_pass:  { title: 'Bus Pass', body: 'Unlimited local bus travel.' },
  bike:      { title: 'Bike', body: 'Great for fitness. Requires owning a bike as a one-off. Small upkeep each month once owned.' },

  // Food Extras
  takeaway: { title: 'Takeaway', body: 'One-off treat. Costs money; small well-being boost.' },
  eat_out:  { title: 'Eating Out', body: 'Meal out with friends. Higher cost; boosts well-being and a little health.' }
}

// Bigger, more visual score pill with icons
function EffectPill({ type, val }){
  const cls = 'pill ' + (val < 0 ? 'neg' : 'pos')
  const icon = type === 'money' ? '💷' : type === 'health' ? '❤️' : '😊'
  const base =
    type === 'money'
      ? `£${val}`
      : type === 'health'
      ? `H ${val >= 0 ? '+' : ''}${val}`
      : `W ${val >= 0 ? '+' : ''}${val}`

  return (
    <span
      className={cls}
      style={{
        minWidth: type === 'money' ? 90 : 80,
        textAlign: 'center',
        padding: '8px 12px',
        borderRadius: '999px',
        fontWeight: 800,
        fontSize: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <span aria-hidden>{icon}</span>
      <span>{base}</span>
    </span>
  )
}

// ---------- NEW: pendingChoices fallback (localStorage) ----------
const PENDING_KEY = 'pendingChoices'
const readPending = () => {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '{}') } catch { return {} }
}
const writePending = (obj) => localStorage.setItem(PENDING_KEY, JSON.stringify(obj || {}))
const getPending = (cat) => {
  const s = readPending()
  return s?.[cat]
}
const setPending = (cat, id) => {
  const s = readPending()
  s[cat] = id
  writePending(s)
}
// ---------------------------------------------------------------

// (Now effectively unused – housing well-being comes from HOUSING data)
function sharedWellbeingPenalty(housingId){
  return 0
}

// MAIN card used on housing/food/phone/broadband/transport
function ChoiceCard({ item, selected, onPick, onInfo, onGallery }){

  const m = (item.effects?.money ?? item.cost ?? 0)
  const h = item.effects?.health || 0
  const w = item.effects?.wellbeing || 0
const canInfo = typeof onInfo === "function";
const canGallery = typeof onGallery === "function";

const handlePick = safeOnClick(onPick);
const handleInfo = safeOnClick(onInfo);
const handleGallery = safeOnClick(onGallery);


  const baseStyle = {
    borderRadius: 20,
    padding: 16,
    background: selected
      ? 'linear-gradient(135deg, rgba(34,197,94,0.14), #ffffff)'

      : 'linear-gradient(135deg, #ffffff, #f7f7fb)',
    boxShadow: selected
      ? '0 8px 20px rgba(0,0,0,0.22)'
      : '0 4px 12px rgba(0,0,0,0.12)',
    border: selected
      ? '2px solid rgba(34,197,94,0.95)'

      : '1px solid rgba(0,0,0,0.12)',
    transition:
      'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease',
    fontSize: '1rem',
  };

  return (
    <div
      className={'choiceCard' + (selected ? ' selected' : '')}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = selected
          ? '0 14px 34px rgba(34,197,94,0.28)'

          : '0 8px 18px rgba(0,0,0,0.18)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = selected
          ? '0 8px 20px rgba(0,0,0,0.22)'
          : '0 4px 12px rgba(0,0,0,0.12)'
      }}
    >
      {/* Title centred at top */}
      <div
        className="title"
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          marginBottom: 10,
          textAlign: 'center',
          fontFamily: DISPLAY_FONT,
        }}
      >
        {item.title}
      </div>

      {/* Row: big image on left, info on right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
        }}
      >
        <div
          className="img"
          style={{
            flex: '0 0 150px',
            height: 150,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#e9ecf3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.img ? (
            <img
              className="fit-img"
              src={item.img}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span className="img-ph" style={{fontSize:'1rem'}}>Image</span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div
            className="scores"
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 4,
            }}
          >
            <EffectPill type="money" val={m} />
            <EffectPill type="health" val={h} />
            <EffectPill type="wellbeing" val={w} />
          </div>

          <div
            className="muted"
            style={{ fontSize: '1rem', marginBottom: 4 }}
          >
            {m < 0
              ? `Costs £${Math.abs(m)} / month`
              : m > 0
              ? `Adds £${m} this month`
              : 'No cost'}
          </div>

<div
  className="row"
  style={{
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  }}
>
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {canInfo && (
      <button
        type="button"
        className="btn secondary"
        onClick={handleInfo}
        style={{ fontSize: "1rem" }}
      >
        Find out more
      </button>
    )}

    {canGallery && (
      <button
        type="button"
        className="btn secondary"
        onClick={handleGallery}
        style={{ fontSize: "1rem" }}
      >
        View photos
      </button>
    )}
  </div>

  <button
    type="button"
    className="btn primary"
    onClick={handlePick}
    style={{ fontSize: "1rem" }}
  >
    {selected ? "Selected" : "Choose"}
  </button>
</div>

        </div>
      </div>
    </div>
  )
}

// UPDATED LeisureCard: now uses the same layout pattern (title top, big image left)
function LeisureCard({ name, img, costLabel, effects = [], chosen, onToggle }){
  const handleToggle = safeOnClick(onToggle)

  const baseStyle = {
    borderRadius: 20,
    padding: 16,
    background: chosen
      ? 'linear-gradient(135deg, #f0f7ff, #ffffff)'
      : 'linear-gradient(135deg, #ffffff, #f7f7fb)',
    boxShadow: chosen
      ? '0 8px 20px rgba(0,0,0,0.2)'
      : '0 4px 12px rgba(0,0,0,0.1)',
    border: chosen
      ? '2px solid rgba(34,197,94,0.95)'

      : '1px solid rgba(0,0,0,0.12)',
    transition:
      'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease',
    fontSize: '1rem',
  }

  return (
    <div
      className="leisure-card"
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = chosen
          ? '0 14px 34px rgba(34,197,94,0.28)'

          : '0 8px 18px rgba(0,0,0,0.16)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = chosen
          ? '0 8px 20px rgba(0,0,0,0.2)'
          : '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {/* Title at top */}
      <div
        className="name"
        style={{
          fontWeight: 800,
          marginBottom: 10,
          fontSize: '1.25rem',
          textAlign: 'center',
          fontFamily: DISPLAY_FONT,
        }}
      >
        {name}
      </div>

      {/* Row: image left, content right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
        }}
      >
        <div
          className="art"
          style={{
            flex: '0 0 150px',
            height: 150,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#e9ecf3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {img ? (
            <img className="fit-img" src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <span className="tag-img-ph" />
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          {/* Scores row */}
          <div
            className="row"
            style={{ alignItems:'flex-start', gap: 8, marginBottom: 4, flexWrap:'wrap' }}
          >
            {effects.map((e, i) => {
              const icon = e.type === 'money' ? '💷' : e.type === 'health' ? '❤️' : '😊'
              const base =
                e.type === 'money'
                  ? `£${e.val}`
                  : `${e.abbr} ${e.val >= 0 ? '+' : ''}${e.val}`
              return (
                <span
                  key={i}
                  className={
                    'pill ' +
                    (e.type === 'money' && e.val < 0 ? 'neg' : 'pos')
                  }
                  style={{
                    minWidth: e.type === 'money' ? 90 : 80,
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span aria-hidden>{icon}</span>
                  <span>{base}</span>
                </span>
              )
            })}
          </div>

          {/* Cost text */}
          <div className="muted" style={{ fontSize: '1rem' }}>
            {costLabel}
          </div>

          {/* Choose / Remove button */}
{/* Choose / Remove button */}
<div className="row" style={{ marginTop: 4, display: "flex", alignItems: "center" }}>
  <button
    type="button"
    className={"btn " + (chosen ? "secondary" : "primary")}
    onClick={handleToggle}
    style={{ fontSize: "1rem", marginLeft: "auto" }}
  >
    {chosen ? "Remove" : "Choose"}
  </button>
</div>


        </div>
      </div>
    </div>
  )
}

function FoodExtraCard({ extra, onToggle, on }){
  const m = extra.effects?.money || 0
  const h = extra.effects?.health || 0
  const w = extra.effects?.wellbeing || 0
  const handleToggle = safeOnClick(onToggle)

  const baseStyle = {
    borderRadius: 20,
    padding: 12,
    background: on
      ? 'linear-gradient(135deg, #f0f7ff, #ffffff)'
      : 'linear-gradient(135deg, #ffffff, #f7f7fb)',
    boxShadow: on
      ? '0 8px 20px rgba(0,0,0,0.2)'
      : '0 4px 12px rgba(0,0,0,0.1)',
    border: on
      ? '2px solid rgba(34,197,94,0.95)'

      : '1px solid rgba(0,0,0,0.12)',
    transition:
      'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease',
    fontSize: '1rem',
  }

  const moneyIcon = '💷'
  const healthIcon = '❤️'
  const wellIcon = '😊'

  return (
    <div
      className="leisure-card"
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = on
          ? '0 14px 34px rgba(34,197,94,0.28)'

          : '0 8px 18px rgba(0,0,0,0.16)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = on
          ? '0 8px 20px rgba(0,0,0,0.2)'
          : '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <div className="art">
        {extra.img ? (
          <img className="fit-img" src={extra.img} alt="" />
        ) : (
          <span className="tag-img-ph" />
        )}
      </div>
      <div
        className="name"
        style={{
          fontWeight: 800,
          marginTop: 6,
          marginBottom: 6,
          fontSize: '1.05rem',
          fontFamily: DISPLAY_FONT,
        }}
      >
        {extra.label.split(' (')[0]}
      </div>
      <div className="row" style={{alignItems:'flex-start', gap:8}}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span
            className={'pill ' + (m < 0 ? 'neg' : 'pos')}
            style={{
              minWidth: 90,
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden>{moneyIcon}</span>
            <span>£{m}</span>
          </span>
          {h !== 0 && (
            <span
              className={'pill ' + (h < 0 ? 'neg' : 'pos')}
              style={{
                minWidth: 80,
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span aria-hidden>{healthIcon}</span>
              <span>
                H {h >= 0 ? '+' : ''}
                {h}
              </span>
            </span>
          )}
          {w !== 0 && (
            <span
              className={'pill ' + (w < 0 ? 'neg' : 'pos')}
              style={{
                minWidth: 80,
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span aria-hidden>{wellIcon}</span>
              <span>
                W {w >= 0 ? '+' : ''}
                {w}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          className={'btn ' + (on ? 'secondary' : 'primary')}
          onClick={handleToggle}
          style={{ fontSize: '1rem', marginLeft:'auto' }}
        >
          {on ? 'Remove' : 'Choose'}
        </button>
      </div>
      <div className="muted" style={{ fontSize: '1rem', marginTop: 6 }}>
        {m < 0 ? `Costs £${Math.abs(m)} this month` : 'No cost'}
      </div>
    </div>
  )
}

// ---------- helper for final score / stars ----------
function buildEndGamePayload(reason, money, health, wellbeing) {
  const safeMoney = Number.isFinite(money) ? money : 0
  const safeHealth = Number.isFinite(health) ? health : 0
  const safeWell = Number.isFinite(wellbeing) ? wellbeing : 0

  const moneyScore =
    safeMoney <= 0 ? 0 :
    safeMoney >= 1500 ? 100 :
    Math.round(safeMoney / 15)

  const healthScore = Math.max(0, Math.min(100, safeHealth))
  const wellScore   = Math.max(0, Math.min(100, safeWell))

  const totalScore = moneyScore + healthScore + wellScore

  let stars = 1
  if (totalScore >= 240) stars = 5
  else if (totalScore >= 200) stars = 4
  else if (totalScore >= 150) stars = 3
  else if (totalScore >= 90) stars = 2

  const starString = '★★★★★'.slice(0, stars) + '☆☆☆☆☆'.slice(stars)

  let title = 'Year Complete'
  let advice = 'You made it to the end of the year. Look at where your scores dipped and think about what you might change next time.'

  if (reason === 'bankrupt') {
    title = 'Game Over – Bankrupt'
    advice = 'Your account stayed in overdraft for too long. In real life this can lead to missed bill payments and debt problems. Next time, try cheaper housing, food, transport or cancel subscriptions earlier.'
  } else if (reason === 'health') {
    title = 'Game Over – Health Crash'
    advice = 'Your health dropped too low. In real life this might mean being too unwell to work or needing medical help. Next time, look for small healthy routines – food, sleep, exercise – even if money is tight.'
  } else if (reason === 'wellbeing') {
    title = 'Game Over – Well-being Crash'
    advice = 'Your well-being dropped too low. Real life might feel very stressful or lonely. Next time, balance saving money with some low-cost activities that keep you connected and happy.'
  } else if (reason === 'year_complete') {
    title = 'Year Complete!'
    if (moneyScore < 40) {
      advice = 'You got through the year, but money was very tight. Try different housing, bills or transport choices next time.'
    } else if (healthScore < 40) {
      advice = 'You made it, but your health took a hit. Can you spot months where a different food or transport choice might keep health higher?'
    } else if (wellScore < 40) {
      advice = 'You finished the year, but well-being stayed low. Think about building in small treats and social time while still staying on budget.'
    }
  }

  return {
    reason,
    title,
    advice,
    money: safeMoney,
    health: safeHealth,
    wellbeing: safeWell,
    moneyScore,
    healthScore,
    wellScore,
    totalScore,
    stars,
    starString,
  }
}

// --------- HISTORY + GRAPHS FOR SUMMARY TAB ---------
const HISTORY_KEY = 'month_history_v1'

function saveHistoryEntry(monthIndex, money, health, wellbeing) {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const base = Array.isArray(raw) ? raw : []
    const filtered = base.filter((entry) => entry && entry.month !== monthIndex)
    filtered.push({ month: monthIndex, money, health, wellbeing })
    filtered.sort((a, b) => a.month - b.month)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
  } catch (e) {
    // ignore
  }
}

function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

// (kept, in case you still want the combined graph somewhere else)
function SummaryGraphs({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="card block" style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 4 }}>Progress over the year</h3>
        <p className="muted">No finished months yet. Your graphs will appear here once you’ve completed Month 1.</p>
      </div>
    )
  }

  const months = history.map((h) => h.month)
  const labels = months.map((m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m % 12])

  const mVals = history.map((h) => h.money)
  const hVals = history.map((h) => h.health)
  const wVals = history.map((h) => h.wellbeing)

  function makeScale(vals, padding = 0.1) {
    const valid = vals.filter((v) => typeof v === 'number' && !Number.isNaN(v))
    if (valid.length === 0) return { min: 0, max: 1 }
    let min = Math.min(...valid)
    let max = Math.max(...valid)
    if (min === max) {
      min = min - 1
      max = max + 1
    } else {
      const range = max - min
      min = min - range * padding
      max = max + range * padding
    }
    return { min, max }
  }

  const mScale = makeScale(mVals)
  const hScale = makeScale(hVals)
  const wScale = makeScale(wVals)

  const width = 320
  const height = 160
  const leftPad = 20
  const rightPad = 10
  const topPad = 10
  const bottomPad = 20
  const innerW = width - leftPad - rightPad
  const innerH = height - topPad - bottomPad

  const n = history.length
  const stepX = n > 1 ? innerW / (n - 1) : 0

  function makePoints(vals, scale) {
    const { min, max } = scale
    const range = max - min || 1
    return vals
      .map((v, i) => {
        const x = leftPad + (n === 1 ? innerW / 2 : stepX * i)
        const ratio = (v - min) / range
        const y = topPad + innerH - ratio * innerH
        return `${x},${y}`
      })
      .join(' ')
  }

  const moneyPoints = makePoints(mVals, mScale)
  const healthPoints = makePoints(hVals, hScale)
  const wellPoints = makePoints(wVals, wScale)

  return (
    <div className="card block" style={{ marginBottom: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Progress over the year</h3>
      <svg width={width} height={height} style={{ maxWidth: '100%' }}>
        {/* axes */}
        <line
          x1={leftPad}
          y1={topPad}
          x2={leftPad}
          y2={height - bottomPad}
          stroke="#d4d4d8"
          strokeWidth="1"
        />
        <line
          x1={leftPad}
          y1={height - bottomPad}
          x2={width - rightPad}
          y2={height - bottomPad}
          stroke="#d4d4d8"
          strokeWidth="1"
        />

        {/* money line (blue) */}
        <polyline
          points={moneyPoints}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
        />
        {/* health line (red) */}
        <polyline
          points={healthPoints}
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
        />
        {/* well-being line (green) */}
        <polyline
          points={wellPoints}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
        />

        {/* month labels */}
        {labels.map((lab, i) => {
          const x = leftPad + (n === 1 ? innerW / 2 : stepX * i)
          const y = height - 4
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="10"
              textAnchor="middle"
              fill="#4b5563"
            >
              {lab}
            </text>
          )
        })}
      </svg>
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 6,
          fontSize: '0.9rem',
          flexWrap: 'wrap',
        }}
      >
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: '#0ea5e9', marginRight: 4 }} />Money</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: '#ef4444', marginRight: 4 }} />Health</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: '#22c55e', marginRight: 4 }} />Well-being</span>
      </div>
    </div>
  )
}
function MiniLineChart({ label, color, points }) {
  // Empty state
  if (!points || points.length === 0) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div className="ph-trendLabel">{label}</div>
        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Play a few months to see your {label.toLowerCase()} change over time.
        </div>
      </div>
    );
  }

  // Chart sizing
  const width = 520;   // virtual SVG width (scales to container)
  const height = 110;  // taller so the line looks clearer
  const padX = 14;
  const padY = 14;

  // Use the numeric values in points.y
  const vals = points.map((p) => Number(p.y ?? 0));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;

  const n = points.length;

  // Build scaled X/Y
  const xs = vals.map((_, idx) =>
    padX + (idx * (width - padX * 2)) / Math.max(1, n - 1)
  );

  const ys = vals.map((v) => {
    const norm = (v - min) / span; // 0..1
    return height - padY - norm * (height - padY * 2);
  });

  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  return (
    <div className="ph-trendRow" style={{ marginBottom: 18 }}>
      {/* ✅ This now uses your CSS class (big text) */}
      <div className="ph-trendLabel">{label}</div>

      <svg
        className="ph-miniSvg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* subtle baseline */}
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />

        {/* main line (thicker) */}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points (bigger) */}
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={6} fill={color} opacity="0.25" />
            <circle cx={x} cy={ys[i]} r={3.5} fill={color} />
          </g>
        ))}
      </svg>
    </div>
  );
}


export default function Month(){
  const { state, dispatch } = useOutletContext()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const finishParam = params.get('finish')
const requestedFinish = finishParam === '1'

  const month = state.month || 0
const chatThisMonth = useMemo(() => {
  const all = Array.isArray(state.chat) ? state.chat : [];
  return all.filter((m) =>
    typeof m.month === "number" ? m.month === month : true
  );
}, [state.chat, month]);

const handleChatDraft = (messageId, option) => {
  // draft = user can still change their mind
  dispatch({
    type: "CHAT_DRAFT_OPTION",
    id: messageId,
    option, // full option object
  });
};

const handleChatSend = (messageId) => {
  // send = lock choice + show green bubble
  dispatch({
    type: "CHAT_SEND_OPTION",
    id: messageId,
  });
};

const [infoOpen, setInfoOpen] = useState(false)
  const [infoData, setInfoData] = useState({ title:'', body:'' })
  const [endGame, setEndGame] = useState(null)
  const [showStatement, setShowStatement] = useState(false)
    const [showSummary, setShowSummary] = useState(false)
  const [summaryItems, setSummaryItems] = useState([])
  const [tick, setTick] = useState(0)
const bump = () => setTick(t => t + 1)

  // ===== Housing photo gallery (Rightmove-style modal) =====
const [galleryOpen, setGalleryOpen] = useState(false);
const [galleryId, setGalleryId] = useState("");          // ✅ ADD
const [galleryTitle, setGalleryTitle] = useState("");
const [galleryImages, setGalleryImages] = useState([]);
const [galleryIndex, setGalleryIndex] = useState(0);


const closeGallery = () => {
  setGalleryOpen(false);
  setGalleryId("");          // ✅ ADD
  setGalleryIndex(0);
};


// Gets 5 image paths for a housing option.
// You can change these filenames later to match what you add.
const getHousingGalleryImages = (housingId) => {
  // Convention: put images in /public/images/housing/<housingId>/1.jpg ... 5.jpg
  // Example: /public/images/housing/housing_shared/1.jpg
  const base = `/images/housing/${housingId}`;
  return [1, 2, 3, 4, 5].map((n) => `${base}/${n}.jpg`);
};

const openGalleryFor = (housingId) => {
  // Find the item for title (works whether HOUSING is raw or injectImages output)
  const allHousing = injectImages(HOUSING, "housing");
  const it = allHousing.find((x) => x.id === housingId);

  setGalleryTitle(it?.title || "Property photos");
  setGalleryId(housingId); // ✅ ADD


  // If you later store explicit arrays in data (e.g. it.gallery),
  // this will use those; otherwise falls back to the convention above.
  const imgs =
    (Array.isArray(it?.gallery) && it.gallery.length ? it.gallery : null) ??
    getHousingGalleryImages(housingId);

  setGalleryImages(imgs);
  setGalleryIndex(0);
  setGalleryOpen(true);
};


  const openInfo = (id, fallbackTitle) => {
    const entry = INFO[id] || { title: fallbackTitle || 'More info', body: 'Details coming soon.' }
    setInfoData(entry); setInfoOpen(true)
  }

// ---------- REQUIRED TABS (single source of truth) ----------
// ---------- REQUIRED TABS (single source of truth) ----------
const hasChatThisMonth = chatThisMonth.length > 0;

const required = useMemo(() => {
  const base = ["housing", "food", "transport", "leisure"];
  if (month === 0) base.push("phone", "broadband");
  if (hasChatThisMonth) base.push("chat");
  return base;
}, [month, hasChatThisMonth]);

const currentTab = useMemo(() => {
  const want = tabParam || "housing";

  // Always allow chat tab to be opened, even if there are no messages this month.
  const allowed = new Set([...required, "summary", "chat"]);

  return allowed.has(want) ? want : "housing";
}, [tabParam, required]);


const isPhoneTab = currentTab === "chat";

const chosen = (cat) => (state.pendingChoices?.[cat]) ?? getPending(cat);

const choicesComplete = useMemo(() => {
  return required.every((k) => {
    if (k === "housing") return !!(chosen("housing") || state.contracts?.housing);
    if (k === "food") return !!chosen("food");
    if (k === "transport") return !!chosen("transport");
    if (k === "leisure") return true; // avoid fragile "done" marker
    if (k === "phone" || k === "broadband") return true; // locked after month 0
    if (k === "chat") return true; // validated by chatAllRead()
    return true;
  });
}, [required, state.contracts, state.pendingChoices, tick]);
// -----------------------------------------------------------

  // Each new month: clear one-off monthly choices for food, transport, leisure
  useEffect(() => {
    if (month <= 0) return;
    try {
      const raw = readPending() || {};
      let changed = false;
      ['food', 'transport', 'leisure'].forEach(cat => {
        if (raw[cat]) {
          delete raw[cat];
          changed = true;
        }
      });
      if (changed) {
        writePending(raw);
        bump();
      }
    } catch {
      // ignore
    }
  }, [month]);

  const pick = (cat, id) => {
    try { dispatch({ type:'SET_PENDING_CHOICE', key:cat, value:id }) } catch {}
    setPending(cat, id)
    bump()
  }
 

  const extrasKey = 'food_extras'
  const actsKey = `leis_activities_m${month}`
  const upgradesKey = 'leis_upgrades'
  const subsKey = 'subs_streaming'

  const getSet = (key) => new Set(JSON.parse(localStorage.getItem(key) || '[]'))
  const setSet = (key, set) => localStorage.setItem(key, JSON.stringify([...set]))
  const toggleInSet = (key, id) => { const s = getSet(key); if(s.has(id)) s.delete(id); else s.add(id); setSet(key,s); bump(); }

  useEffect(()=>{
    if(currentTab === 'leisure'){
      try { dispatch({ type:'SET_PENDING_CHOICE', key:'leisure', value:'done' }) } catch {}
      setPending('leisure', 'done')
    }
  }, [currentTab, dispatch])

  useEffect(() => {
  dispatch({ type: "INBOX_SEED_IF_EMPTY" });
}, [dispatch]);


function lifestyleIncome(){
  // ✅ If learner accepted a new job, apply the new monthly income from the start month onward
  const jobPay = Number(state?.flags?.job_monthly_income || 0);
  const jobStart = Number.isFinite(state?.flags?.job_income_start_month)
    ? Number(state.flags.job_income_start_month)
    : 999;

  if (jobPay > 0 && month >= jobStart) return jobPay;

  const life = (localStorage.getItem('lifestyle') || '').toLowerCase();
  if(life.includes('full')) return 1400;
  if(life.includes('part')) return 900;
  if(life.includes('benefit')) return 0;
  return state.income || 1200;
}
// ✅ Food bank voucher active for a limited window
function foodbankActiveThisMonth() {
  const f = state?.flags || {};
  const start = Number.isFinite(f.foodbank_voucher_start_month)
    ? Number(f.foodbank_voucher_start_month)
    : 999;
  const end = Number.isFinite(f.foodbank_voucher_end_month)
    ? Number(f.foodbank_voucher_end_month)
    : -1;

  return month >= start && month <= end;
}

// ✅ Counselling active (monthly wellbeing boost handled in store.js COMMIT_MONTH)
function counsellingActive() {
  const f = state?.flags || {};
  return f.counselling_active === true;
}

  function councilTaxWithSupport(){
    const base = Math.abs(BILLS?.council_tax ?? -120)
    const pct = Number(localStorage.getItem('council_tax_support_pct') || '0')
    const reduced = Math.round(base * (1 - pct))
    return -reduced
  }
  function ownsBike(){
    return localStorage.getItem('owns_bike') === '1'
  }

  function addInboxEffects(totals, items, withItems){
    const effKey = `inbox_effects_m${month}`
    const list = JSON.parse(localStorage.getItem(effKey) || '[]')
    list.forEach(e=>{
      totals.money += (e.money||0)
      totals.health += (e.health||0)
      totals.wellbeing += (e.wellbeing||0)
      if(withItems){
        items.push({
          label: e.label || '[Inbox choice]',
          amount: (e.money||0), h:(e.health||0), w:(e.wellbeing||0),
          img:null, kind:'withdrawal'
        })
      }
    })
    return totals
  }

  function sumMonthTotals(withItems = false){
    let money = 0, health = 0, wellbeing = 0
    const items = []

    const wage = lifestyleIncome()
    money += wage
  if (withItems) {
  const life = (localStorage.getItem('lifestyle') || '').toLowerCase();
  const incomeImg =
    life.includes('benefit') ? IMG_MAP.income_benefits :
    life.includes('part') ? IMG_MAP.income_parttime :
    IMG_MAP.income_fulltime;

  items.push({ label:'Wage', amount:+wage, h:0, w:0, img: incomeImg, kind:'deposit' });
}


    const contracts = JSON.parse(localStorage.getItem('contracts') || '{}')
    const housingId = contracts.housing || chosen('housing')
    const rentMap = { housing_shared:-350, housing_studio:-550, housing_onebed:-700 }
    if(housingId){
      const r = rentMap[housingId] || 0
      const def = HOUSING.find(h => h.id === housingId) || {}
      const hEff = def.effects?.health || 0
      const wEff = def.effects?.wellbeing || 0
      money += r
      health += hEff
      wellbeing += wEff
      if(withItems) items.push({
        label:'Rent',
        amount:r,
        h:hEff,
        w:wEff,
        img: IMG_MAP[housingId] || null,

        kind:'withdrawal'
      })
    }

    if(month >= 1 && housingId){
      const supportPct = Number(localStorage.getItem('council_tax_support_pct') || '0')
      const councilAmt = supportPct > 0 ? councilTaxWithSupport() : (BILLS?.council_tax ?? -120)
      const bills = [
        { key:'council_tax',   label:BILL_LABELS?.council_tax   || 'Council Tax',      amount:councilAmt },
        { key:'gas_electric',  label:BILL_LABELS?.gas_electric  || 'Gas & Electric',   amount:BILLS?.gas_electric ?? -110 },
        { key:'water',         label:BILL_LABELS?.water         || 'Water',            amount:BILLS?.water ?? -25 },
        { key:'tv_licence',    label:BILL_LABELS?.tv_licence    || 'TV Licence',       amount:BILLS?.tv_licence ?? -14 },
      ]
      bills.forEach(b=>{
        money += b.amount
        if (withItems) {
  const billImg =
    b.key === 'council_tax'  ? IMG_MAP.bill_council_tax :
    b.key === 'gas_electric' ? IMG_MAP.bill_gas_electric :
    b.key === 'water'        ? IMG_MAP.bill_water :
    b.key === 'tv_licence'   ? IMG_MAP.bill_tv_licence :
    null;

  items.push({ label:b.label, amount:b.amount, h:0, w:0, img: billImg, kind:'withdrawal' });
}

      })
    }

    if(month >= 1){
      const contracts2 = JSON.parse(localStorage.getItem('contracts') || '{}')
      if(contracts2.phone || chosen('phone')){
        const phoneId = contracts2.phone || chosen('phone')
        const phoneOpt = PHONE.find(p => p.id === phoneId)
        const phoneCost = phoneOpt?.effects?.money || 0
        const phoneWell = phoneOpt?.effects?.wellbeing || 0
        money += phoneCost
        wellbeing += phoneWell
        if(withItems) items.push({
          label:`Phone: ${phoneId}`,
          amount:phoneCost,
          h:0,
          w:phoneWell,
          img: IMG_MAP[phoneId] || null,
          kind:'withdrawal'
        })
      }
      if(contracts2.broadband || chosen('broadband')){
        const bbId = contracts2.broadband || chosen('broadband')
        const bbCost = { bb_basic:18, bb_fibre:28, bb_fast:38 }[bbId] || 0
        const signed = -Math.abs(bbCost)
        money += signed
       if(withItems) items.push({ label:`Broadband: ${bbId}`, amount:signed, h:0, w:0, img: IMG_MAP[bbId] || null, kind:'withdrawal' })

      }
    }

// ✅ Food selection (including food bank voucher)
const foodChoice = chosen("food");

// If voucher is chosen, no cost and small wellbeing/health benefit handled by the check-up email already
if (foodChoice === "foodbank_voucher") {
  // nothing to subtract
  if (withItems)
    items.push({
      label: "Food: Food bank voucher",
      amount: 0,
      h: 0,
      w: 0,
      img: FALLBACK_BY_CAT.food,

      kind: "info",
    });
} else {
  const food = FOOD.find((x) => x.id === foodChoice);
  if (food) {
    const hEff = food.effects?.health || 0;
    const wEff = food.effects?.wellbeing || 0;
    const mEff = food.effects?.money || 0;
    money += mEff;
    health += hEff;
    wellbeing += wEff;
    if (withItems)
      items.push({
        label: `Food: ${food.title}`,
        amount: mEff,
        h: hEff,
        w: wEff,
        img: food.img || IMG_MAP[food.id] || FALLBACK_BY_CAT.food,

        kind: "withdrawal",
      });
  }
}


    const ex = getSet(extrasKey)
    FOOD_EXTRAS.forEach(x=>{
      if(ex.has(x.id)){
        const m=(x.effects.money||0), h=(x.effects.health||0), w=(x.effects.wellbeing||0)
        money += m; health += h; wellbeing += w
        if(withItems) items.push({ label:`Extra: ${x.label.split(' (')[0]}`, amount:m, h, w, img:x.img||null, kind:'withdrawal' })
      }
    })

const t = chosen('transport')
if (t === 'bus_pass') {
  money -= 60
  wellbeing -= 1

  if (withItems) {
    items.push({
      label: 'Bus pass',
      amount: -60,
      h: 0,
      w: -1,
      img: IMG_MAP.transport_bus_pass || IMG_MAP.bus_pass || FALLBACK_BY_CAT.transport,
      kind: 'withdrawal',
    })
  }
}

    if(t === 'bike'){
      if(ownsBike()){
        money -= 5
        health += 3
        wellbeing += 1
        if(withItems) items.push({
          label:'Bike upkeep',
          amount:-5,
          h:+3,
          w:+1,
          img:null,
          kind:'withdrawal'
        })
      }else{
        if(withItems) items.push({ label:'No bike owned (walking used)', amount:0, h:0, w:0, img:null, kind:'info' })
      }
    }
    if(t === 'walk'){
      const winter = [10,11,0,1]
      if(winter.includes(month)){
        health -= 2
        wellbeing -= 4
        if(withItems) items.push({
          label:'Winter walking dip',
          amount:0,
          h:-2,
          w:-4,
          img: IMG_MAP.winter_walking_dip,

          kind:'info'
        })
      }
    }

    const acts = getSet(actsKey)
    LEISURE_ACTIVITIES.forEach(a=>{
      if(acts.has(a.id)){
        const m=a.cost, h=(a.effects.health||0), w=(a.effects.wellbeing||0)
        money += m; health += h; wellbeing += w
        if(withItems) items.push({ label:`Leisure: ${a.title}`, amount:m, h, w, img:a.img||null, kind:'withdrawal' })
      }
    })

    const upg = getSet(upgradesKey)
    LEISURE_UPGRADES.forEach(u=>{
      if(upg.has(u.id)){
        const recur = u.recur||{}
        const rm=(recur.money||0), rh=(recur.health||0), rw=(recur.wellbeing||0)
        money += rm; health += rh; wellbeing += rw
        if(withItems) items.push({ label:`Upgrade benefit: ${u.title}`, amount:rm, h:rh, w:rw, img:u.img||null, kind:'withdrawal' })
      }
    })

    const subs = getSet(subsKey)
    STREAMING_SUBS.forEach(s=>{
      if(subs.has(s.id)){
        const w = s.effects?.wellbeing || 0
        money += s.cost
        wellbeing += w
        if(withItems) items.push({
          label:`Subscription: ${s.title}`,
          amount:s.cost,
          h:0,
          w:w,
          img:s.img||null,
          kind:'withdrawal'
        })
      }
    })


// 1) Apply inbox effects first
let totals = addInboxEffects({ money, health, wellbeing }, items, withItems);

// Keep working values in sync with totals
money = totals.money;
health = totals.health;
wellbeing = totals.wellbeing;
// ✅ Fraud transaction (appears on statement + affects totals)
// ✅ Fraud transaction (appears on statement + affects totals)
try {
  const f = state.flags || {};
  const start = Number(f.fraud_start_month || 0);
  const stage = Number(f.fraud_stage || 0);

  const hasFraudThisMonth =
    !!(f.fraud_active && !f.fraud_resolved && month >= start && stage >= 1);

  if (hasFraudThisMonth) {
    const txn =
      stage === 1
        ? { label: "Apple Pay", amount: -0.45 }
        : stage === 2
        ? { label: "Sports Direct", amount: -59.99 }
        : { label: "International Transfer 034500001", amount: -2500 };

    money += txn.amount;

    if (withItems) {
      items.push({
        label: txn.label,
        amount: txn.amount,
        h: 0,
        w: 0,
        img: null,
        kind: "withdrawal",
      });
    }
  }
} catch {
  // ignore
}

// 3) Return final totals INCLUDING fraud
return { money, health, wellbeing, items };

  }

  const totals = useMemo(()=> sumMonthTotals(false), [state.pendingChoices, state.month, tick])
  
  const statementItems = useMemo(()=> sumMonthTotals(true).items, [state.pendingChoices, state.month, tick])



  
function chatAllRead() {
  const chat = Array.isArray(state.chat) ? state.chat : [];
  const thisMonth = chat.filter((m) =>
    typeof m.month === "number" ? m.month === (state.month ?? 0) : true
  );

  // If no chat this month, treat as complete
  if (thisMonth.length === 0) return true;

  return thisMonth.every((m) => {
    const needsChoice = Array.isArray(m?.options) && m.options.length > 0;
    const hasChoice = !needsChoice || !!m.chosenOptionId;
    return !!m.read && hasChoice;
  });
}



function inboxAllRead() {
  const allMsgs = Array.isArray(state.inbox) ? state.inbox : [];

  // Only messages for THIS month
  const msgs = allMsgs.filter(
    (m) => typeof m.month === "number" && m.month === month
  );

  // If there are no inbox messages this month, allow finish
  if (msgs.length === 0) return true;

  return msgs.every((m) => {
    const needsChoice =
      (Array.isArray(m.choices) && m.choices.length > 0) ||
      (Array.isArray(m.options) && m.options.length > 0);

    // If no choices required, just needs to be read
    if (!needsChoice) return !!m.read;

    // If choices exist, must be read AND chosen
    return !!m.read && !!m.chosenOptionId;
  });
}


// ✅ Finish Month (single click): validates -> shows summary -> commitAfterSummary advances month
const tryFinishMonth = useCallback(() => {
  // 1) Must have made required choices
  if (!choicesComplete) {
    try {
      dispatch({
        type: "ADD_TOAST",
        text: "Make a choice on every tab before finishing the month.",
      });
    } catch {}
    return;
  }

  // 2) Must have completed inbox for THIS month
  if (!inboxAllRead()) {
    try {
      dispatch({
        type: "ADD_TOAST",
        text: "Open each Inbox message and choose an option where needed before finishing the month.",
      });
    } catch {}
    nav("/inbox");
    return;
  }

  // 3) Must have completed phone messages for THIS month
if (!chatAllRead()) {
  try {
    dispatch({
      type: "ADD_TOAST",
      text: "You need to check your phone messages first.",
    });
  } catch {}
  nav("/month?tab=chat");
  return;
}


  // 4) Show end-of-month summary modal
  const withItems = sumMonthTotals(true);
  setSummaryItems(withItems.items);
  setShowSummary(true);
}, [choicesComplete, dispatch, nav, sumMonthTotals]);

// If we arrived here via the header button (?finish=1), attempt to finish immediately.
useEffect(() => {
  if (!requestedFinish) return;

  // Attempt finish
  tryFinishMonth();

  // Only remove finish=1 AFTER we've shown the summary modal.
  // This prevents other effects from "winning" the race and bouncing tabs.
  if (showSummary) {
    try {
      const next = new URLSearchParams(params);
      next.delete("finish");
      setParams(next, { replace: true });
    } catch {
      // ignore
    }
  }
}, [requestedFinish, tryFinishMonth, params, setParams, showSummary]);



function commitAfterSummary(){
  const t = sumMonthTotals(false)

  const startMoney  = Number.isFinite(state.money)      ? state.money      : 0
  const startHealth = Number.isFinite(state.health)     ? state.health     : 70
  const startWell   = Number.isFinite(state.wellbeing)  ? state.wellbeing  : 70

  const newMoney = startMoney  + t.money
  const newHealth = startHealth + t.health
  const newWell   = startWell   + t.wellbeing

  // Save snapshot for graphs on the Summary tab
  saveHistoryEntry(month, newMoney, newHealth, newWell)

  let overdraftStreak = Number(localStorage.getItem('overdraft_streak') || '0')
  if (newMoney < 0) overdraftStreak += 1
  else overdraftStreak = 0
  localStorage.setItem('overdraft_streak', String(overdraftStreak))

  let reason = null
  if (newHealth <= 0) {
    reason = 'health'
  } else if (newWell <= 0) {
    reason = 'wellbeing'
  } else if (overdraftStreak >= 3) {
    reason = 'bankrupt'
  } else if (month >= 11) {
    reason = 'year_complete'
  }

  if (month === 0) {
    const contracts = {
      housing:   chosen('housing')   || state.contracts?.housing,
      phone:     chosen('phone')     || state.contracts?.phone,
      broadband: chosen('broadband') || state.contracts?.broadband,
    }
    localStorage.setItem('contracts', JSON.stringify(contracts))
    try { dispatch({ type: 'LOCK_CONTRACTS' }) } catch {}
  }

  // IMPORTANT: include fromMonth so the reducer can ignore any duplicate commits
  try {
    dispatch({
      type: 'COMMIT_MONTH',
      payload: {
        totals: t,
        fromMonth: month,
      },
    })
  } catch {}

  const actsKeyLocal = `leis_activities_m${month}`
  localStorage.removeItem(actsKeyLocal)
  localStorage.removeItem(`inbox_all_read_m${month}`)
  localStorage.removeItem(`inbox_effects_m${month}`)

  setShowSummary(false)

  if (reason) {
    const payload = buildEndGamePayload(reason, newMoney, newHealth, newWell)
    setEndGame(payload)
    return
  }

  nav('/inbox')
}
  const BankStatementModal = () => {
    const total = statementItems.reduce((acc,it)=>acc+it.amount,0)
    const player = localStorage.getItem('player_name') || 'Player'
    const monthName = MONTHS[month%12]
    const bank = 'Powerhouse Bank'
    const f = state.flags || {};
const fraudStarted = Number(f.fraud_start_month || 0);
const fraudStage = Number(f.fraud_stage || 0);
const hasFraudThisMonth = !!(f.fraud_active && !f.fraud_resolved && month >= fraudStarted && fraudStage >= 1);

const expectedMerchant = fraudStage === 1
  ? "Apple Pay"
  : fraudStage === 2
  ? "Sports Direct"
  : "International Transfer 034500001";

const expectedAmount = fraudStage === 1
  ? 0.45
  : fraudStage === 2
  ? 59.99
  : 2500;

const [fraudOpen, setFraudOpen] = useState(false);
const [fraudMerchant, setFraudMerchant] = useState("");
const [fraudAmount, setFraudAmount] = useState("");

    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <div className="modal-head">
            <div
              className="modal-title"
              style={{ fontFamily: DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
            >
              Statement — {bank}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={()=>setShowStatement(false)}
              aria-label="Close"
              style={{ fontSize:'1.2rem' }}
            >
              ✕
            </button>
          </div>
          <div className="modal-body" style={{ fontSize:'1rem' }}>
<div style={{display:'flex', justifyContent:'space-between', marginBottom:14}}>
  <div>
    <div style={{fontWeight:900, fontSize:'1.2rem', fontFamily:DISPLAY_FONT}}>{bank}</div>
    <div className="muted">Account holder: {player}</div>
  </div>
  <div style={{textAlign:'right'}}>
    <div className="muted">Statement month</div>
    <div style={{fontWeight:700, fontSize:'1.05rem'}}>{monthName}</div>
  </div>
</div>

{/* ✅ ADD THIS RIGHT HERE */}
{hasFraudThisMonth && (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
    <button
      type="button"
      className="btn secondary"
     onClick={() => {
  setFraudOpen(true);
  setFraudMerchant("");
  setFraudAmount("");
}}

      style={{ fontSize: "0.95rem", fontWeight: 900 }}
    >
      Report fraud
    </button>
  </div>
)}

<div className="statement table">

              <div className="st-row st-head">
                <span className="st-label" style={{fontSize:'1rem'}}>Description</span>
                <span className="st-amount" style={{fontSize:'1rem'}}>Amount</span>
              </div>
              {statementItems.map((it,i)=>(
                <div key={i} className={'st-row ' + (it.amount>=0 ? 'deposit' : 'withdrawal')}>
                  <span className="st-label" style={{fontSize:'1rem'}}>{it.label}</span>
                  <span className={'st-amount ' + (it.amount>=0 ? 'pos' : 'neg')} style={{fontSize:'1rem'}}>
                    {it.amount>=0 ? '+' : '-'}£{Math.abs(it.amount)}
                  </span>
                </div>
              ))}
              <div className="st-row total">
                <span className="st-label" style={{fontSize:'1rem'}}>Total</span>
                <span className={'st-amount ' + (total>=0 ? 'pos' : 'neg')} style={{fontSize:'1.05rem', fontWeight:800}}>
                  {total>=0 ? '+' : '-'}£{Math.abs(total)}
                </span>
              </div>
            </div>
</div>

{/* ✅ FRAUD MODAL MUST SIT INSIDE THE STATEMENT MODAL BODY */}
{fraudOpen && (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal-card" style={{ maxWidth: 520 }}>
      <div className="modal-head">
        <div
          className="modal-title"
          style={{ fontFamily: DISPLAY_FONT, fontSize: "1.3rem", fontWeight: 900 }}
        >
          Report suspicious transaction
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setFraudOpen(false)}
          aria-label="Close"
          style={{ fontSize: "1.2rem" }}
        >
          ✕
        </button>
      </div>

      <div className="modal-body">
        <div className="muted" style={{ marginBottom: 10 }}>
          Enter the date, merchant name and amount you want to report.
        </div>

        <div style={{ display: "grid", gap: 10 }}>


          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800 }}>Merchant</span>
            <input
              value={fraudMerchant}
              onChange={(e) => setFraudMerchant(e.target.value)}
              placeholder="Merchant name"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800 }}>Amount (£)</span>
            <input
              value={fraudAmount}
              onChange={(e) => setFraudAmount(e.target.value)}
              placeholder="Amount (e.g. 59.99)"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.15)",
              }}
            />
          </label>
        </div>
      </div>

      <div className="modal-actions" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn secondary" onClick={() => setFraudOpen(false)}>
          Cancel
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            dispatch({
              type: "REPORT_FRAUD",
              payload: {
                merchant: fraudMerchant,
                amount: Number(fraudAmount),
              },
            });
            setFraudOpen(false);
          }}
          style={{ fontWeight: 900 }}
        >
          Submit report
        </button>
      </div>
    </div>
  </div>
)}

          <div className="modal-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={()=>setShowStatement(false)}
              style={{fontSize:'1rem'}}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const InfoModal = () => (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div
            className="modal-title"
            style={{ fontFamily: DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            {infoData.title}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={()=>setInfoOpen(false)}
            aria-label="Close"
            style={{ fontSize:'1.2rem' }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p style={{lineHeight:1.6, fontSize:'1rem'}}>{infoData.body}</p>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={()=>setInfoOpen(false)}
            style={{fontSize:'1rem'}}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
const HousingGalleryModal = () => {
  if (!galleryOpen) return null;

  const total = galleryImages.length;
  const src = galleryImages[galleryIndex];

  const prev = () => setGalleryIndex((i) => (i - 1 + total) % total);
  const next = () => setGalleryIndex((i) => (i + 1) % total);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={closeGallery}
      style={{ zIndex: 50 }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 980,
          width: "min(980px, 96vw)",
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          className="modal-head"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 14px",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>
            {galleryTitle}
            <span style={{ fontWeight: 700, opacity: 0.75, marginLeft: 10 }}>
              {total ? `${galleryIndex + 1} / ${total}` : ""}
            </span>
          </div>

          <button type="button" className="icon-btn" onClick={closeGallery} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={{ background: "#0b141a" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#0b141a",
            }}
          >
            {/* image */}
            <img
              src={src}
              alt=""
              onError={(e) => {
                // If you haven't added images yet, show a safe placeholder instead of crashing
                e.currentTarget.style.display = "none";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Placeholder if images missing */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 800,
                padding: 16,
                textAlign: "center",
              }}
            >
             
              <div style={{ marginTop: 8, fontWeight: 700, opacity: 0.9 }}>
                <code style={{ background: "rgba(255,255,255,0.08)", padding: "6px 10px", borderRadius: 10 }}>
                  
                </code>
              </div>
            </div>

            {/* arrows */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* thumbnails */}
          {total > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 12,
                overflowX: "auto",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  style={{
                    border: idx === galleryIndex ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.18)",
                    padding: 0,
                    borderRadius: 12,
                    overflow: "hidden",
                    width: 92,
                    height: 60,
                    flex: "0 0 auto",
                    cursor: "pointer",
                    background: "#0b141a",
                  }}
                  title={`Photo ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* rightmove-style info strip (optional placeholder) */}
        {/* rightmove-style info strip */}
<div style={{ padding: 14, background: "#fff" }}>
  <div style={{ fontWeight: 900, marginBottom: 6 }}>Key features</div>
  <div style={{ color: "rgba(0,0,0,0.7)", lineHeight: 1.5 }}>
    {(() => {
      const KEY_FEATURES = {
        housing_shared:
          "A bright bedroom within a friendly house share, with communal kitchen/living space and shared bathroom facilities. Located on a main road in Armley with great access to local shops and transport links.",
        housing_studio:
          "A modern, self-contained studio flat in Pudsey, offering open-plan living with a private kitchen area, a comfortable double sleeping space and contemporary bathroom facilities. Includes one allocated parking space for extra convenience.",
        housing_onebed:
          "A charming one-bedroom terraced home in Bramley, with a small front garden and a practical layout including kitchen, lounge, bathroom and double bedroom. Ideal for learners ready for more independence and a ‘proper house’ feel.",
      };

      return KEY_FEATURES[galleryId] || "A great option with a practical layout for everyday independent living.";
    })()}
  </div>
</div>


      </div>
    </div>
  );
};

  const EndGameModal = () => {
    if (!endGame) return null

    const player = localStorage.getItem('player_name') || 'Player'

    const handleRestart = () => {
      localStorage.clear()
      try { dispatch({ type:'RESET_GAME' }) } catch {}
      window.location.href = '/'
    }

    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <div className="modal-head">
            <div
              className="modal-title"
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize:'1.6rem',
                fontWeight:900,
              }}
            >
              {endGame.title}
            </div>
          </div>
          <div className="modal-body" style={{ fontSize:'1rem' }}>
            <p style={{ marginBottom: 10 }}>
              {player}, here are your final scores:
            </p>

            <div
              style={{
                display:'flex',
                flexWrap:'wrap',
                gap:10,
                marginBottom:14,
              }}
            >
              <div
                style={{
                  flex:'1 1 0',
                  minWidth:160,
                  borderRadius:14,
                  padding:10,
                  background:'linear-gradient(135deg,#f7fbff,#e6f1ff)',
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                }}
              >
                <span style={{fontSize:'1.8rem'}} aria-hidden>💷</span>
                <div>
                  <div style={{fontFamily:DISPLAY_FONT,fontWeight:800}}>Money</div>
                  <div>Balance: £{endGame.money.toFixed(2)}</div>
                  <div>Score: {endGame.moneyScore}/100</div>
                </div>
              </div>
              <div
                style={{
                  flex:'1 1 0',
                  minWidth:160,
                  borderRadius:14,
                  padding:10,
                  background:'linear-gradient(135deg,#fff7f9,#ffe6ec)',
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                }}
              >
                <span style={{fontSize:'1.8rem'}} aria-hidden>❤️</span>
                <div>
                  <div style={{fontFamily:DISPLAY_FONT,fontWeight:800}}>Health</div>
                  <div>Level: {endGame.health}</div>
                  <div>Score: {endGame.healthScore}/100</div>
                </div>
              </div>
              <div
                style={{
                  flex:'1 1 0',
                  minWidth:160,
                  borderRadius:14,
                  padding:10,
                  background:'linear-gradient(135deg,#f7fff7,#e6ffe8)',
                  display:'flex',
                  alignItems:'center',
                  gap:8,
                }}
              >
                <span style={{fontSize:'1.8rem'}} aria-hidden>😊</span>
                <div>
                  <div style={{fontFamily:DISPLAY_FONT,fontWeight:800}}>Well-being</div>
                  <div>Level: {endGame.wellbeing}</div>
                  <div>Score: {endGame.wellScore}/100</div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius:14,
                padding:10,
                background:'#f4f4f8',
                marginBottom:12,
              }}
            >
              <div
                style={{
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  marginBottom:6,
                }}
              >
                <div style={{fontFamily:DISPLAY_FONT,fontSize:'1.1rem',fontWeight:900}}>
                  Total Score
                </div>
                <div style={{fontSize:'1.4rem',fontWeight:900}}>
                  {endGame.totalScore} / 300
                </div>
              </div>
              <div style={{fontSize:'1.2rem',marginBottom:4}}>
                {endGame.starString}
              </div>
              <div className="muted">
                ★ = stronger overall balance of money, health and well-being.
              </div>
            </div>

            <p style={{marginTop:8}}>
              {endGame.advice}
            </p>
          </div>
          <div className="modal-actions" style={{justifyContent:'space-between'}}>
            <button
              type="button"
              className="btn secondary"
              onClick={()=>setEndGame(null)}
              style={{fontSize:'1rem'}}
            >
              Close
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleRestart}
              style={{fontSize:'1.05rem',fontWeight:800}}
            >
              Play again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const blocks = {
    housing: (
      (month===0 && !state.contracts?.housing) ? (
        <section className="card block">
          <h3
            className="block-title"
            style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            Housing (locks after Month 1)
          </h3>
          <div className="grid3">
            {injectImages(HOUSING,'housing').map(item=>(
              <ChoiceCard
                key={item.id}
                item={item}
                selected={chosen('housing')===item.id}
                onPick={()=>pick('housing', item.id)}
                onInfo={()=>openInfo(item.id, item.title)}
                onGallery={() => openGalleryFor(item.id)}

              />
            ))}
          </div>
        </section>
      ) : (
        <section className="card block">
          <h3
            className="block-title"
            style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            Your Home & Monthly Bills
          </h3>
          <div className="bills-grid" style={{fontSize:'1rem'}}>
            {(() => {
              const contracts = JSON.parse(localStorage.getItem('contracts')||'{}')
              const housingId = contracts.housing || chosen('housing')
              const rentMap = { housing_shared:350, housing_studio:550, housing_onebed:700 }
              const rent = housingId ? rentMap[housingId] : 0
              const pct = Number(localStorage.getItem('council_tax_support_pct')||'0')
              const councilDisp = Math.abs(pct>0 ? Math.round(Math.abs((BILLS?.council_tax ?? -120))*(1-pct)) : Math.abs(BILLS?.council_tax ?? -120))
            return (
  <>
    <div className="bill-tile">
      <div className="bill-iconPane rent">
        <img
          className="bill-iconImg"
          src={IMG_MAP[housingId] || FALLBACK_BY_CAT.housing}
          alt="Rent"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">Rent</div>
        <div className="bill-amt">£{rent}</div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane bills">
        <img
          className="bill-iconImg"
          src={IMG_MAP.bill_council_tax || FALLBACK_BY_CAT.bill}
          alt="Council Tax"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">{BILL_LABELS?.council_tax || "Council Tax"}</div>
        <div className="bill-amt">£{Math.abs(councilDisp)}</div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane utilities">
        <img
          className="bill-iconImg"
          src={IMG_MAP.bill_gas_electric || FALLBACK_BY_CAT.bill}
          alt="Gas & Electric"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">{BILL_LABELS?.gas_electric || "Gas & Electric"}</div>
        <div className="bill-amt">£{Math.abs(BILLS?.gas_electric ?? -110)}</div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane utilities">
        <img
          className="bill-iconImg"
          src={IMG_MAP.bill_water || FALLBACK_BY_CAT.bill}
          alt="Water"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">{BILL_LABELS?.water || "Water"}</div>
        <div className="bill-amt">£{Math.abs(BILLS?.water ?? -25)}</div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane bills">
        <img
          className="bill-iconImg"
          src={IMG_MAP.bill_tv_licence || FALLBACK_BY_CAT.bill}
          alt="TV Licence"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">{BILL_LABELS?.tv_licence || "TV Licence"}</div>
        <div className="bill-amt">£{Math.abs(BILLS?.tv_licence ?? -14)}</div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane phone">
        <img
          className="bill-iconImg"
          src={IMG_MAP[(contracts.phone || chosen("phone"))] || FALLBACK_BY_CAT.phone}
          alt="Phone"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">Phone</div>
        <div className="bill-amt">
          £{({ sim_only: 10, mid_plan: 20, unlimited: 35 }[(contracts.phone || chosen("phone"))] || 0)}
        </div>
      </div>
    </div>

    <div className="bill-tile">
      <div className="bill-iconPane phone">
        <img
          className="bill-iconImg"
          src={IMG_MAP[(contracts.broadband || chosen("broadband"))] || FALLBACK_BY_CAT.broadband}
          alt="Broadband"
        />
      </div>
      <div className="bill-meta">
        <div className="bill-name">Broadband</div>
        <div className="bill-amt">
          £{({ bb_basic: 18, bb_fibre: 28, bb_fast: 38 }[(contracts.broadband || chosen("broadband"))] || 0)}
        </div>
      </div>
    </div>
  </>
);


            })()}
          </div>
        </section>
      )
    ),
    food: (
      <section className="card block">
        <h3
          className="block-title"
          style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
        >
          Food & Shopping
        </h3>
        {/* ✅ Food bank voucher (free shopping) */}
{foodbankActiveThisMonth() && (
  <div
    style={{
      marginBottom: 12,
      padding: 14,
      borderRadius: 16,
      border: "1px solid rgba(34,197,94,0.25)",
      background: "linear-gradient(135deg, rgba(34,197,94,0.12), #ffffff)",
      boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
    }}
  >
    <div style={{ fontWeight: 900, fontFamily: DISPLAY_FONT, fontSize: "1.15rem" }}>
      Food bank voucher available ✅
    </div>
    <div className="muted" style={{ marginTop: 4 }}>
      You can use a voucher this month, so you don’t need to pay for shopping.
    </div>

    <button
      type="button"
      className="btn primary"
      style={{ marginTop: 10, fontSize: "1rem" }}
      onClick={safeOnClick(() => pick("food", "foodbank_voucher"))}
    >
      Use voucher (free shopping)
    </button>
  </div>
)}

        <div className="grid3">
          {injectImages(FOOD,'food').map(item=>(
            <ChoiceCard
              key={item.id}
              item={item}
              selected={chosen('food')===item.id}
              onPick={()=>pick('food', item.id)}
              onInfo={()=>openInfo(item.id, item.title)}
            />
          ))}
        </div>
        <div className="section" style={{marginTop:14}}>
          <h3
            className="block-title"
            style={{marginBottom:8, fontFamily:DISPLAY_FONT, fontSize:'1.2rem', fontWeight:850}}
          >
            Optional extras this month
          </h3>
          <div className="leisure-grid">
            {injectImages(FOOD_EXTRAS,'extra').map(x=>{
              const s = getSet(extrasKey)
              const on = s.has(x.id)
              return (
                <FoodExtraCard key={x.id} extra={x} on={on} onToggle={()=>toggleInSet(extrasKey,x.id)} />
              )
            })}
          </div>
        </div>
      </section>
    ),
    leisure: (()=>{
      const normalizedUpgrades = LEISURE_UPGRADES || []
      const acts = getSet(actsKey)
      const upg = getSet(upgradesKey)
      const subs = getSet(subsKey)
      return (
        <section className="card block">
          <h3
            className="block-title"
            style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            Leisure
          </h3>
          <div className="muted" style={{marginTop:-4, fontSize:'1rem'}}>
            Pick activities (one-off), upgrades (ongoing), and subscriptions (monthly).
          </div>

          <h4
            className="block-title"
            style={{marginTop:12, fontFamily:DISPLAY_FONT, fontSize:'1.2rem', fontWeight:850}}
          >
            Activities (one-off)
          </h4>
          <div className="leisure-grid">
            {injectImages(LEISURE_ACTIVITIES,'leisure').map(a=>{
              const c = acts.has(a.id)
              return (
                <LeisureCard
                  key={a.id}
                  name={a.title}
                  img={a.img}
                  chosen={c}
                  costLabel={`£${Math.abs(a.cost)} this month`}
                  effects={[
                    {type:'money', val:a.cost},
                    ...(a.effects.health?[{type:'health',abbr:'H',val:a.effects.health}]:[]),
                    ...(a.effects.wellbeing?[{type:'wellbeing',abbr:'W',val:a.effects.wellbeing}]:[]),
                  ]}
                  onToggle={()=>{ toggleInSet(actsKey, a.id) }}
                />
              )
            })}
          </div>

          <h4
            className="block-title"
            style={{marginTop:12, fontFamily:DISPLAY_FONT, fontSize:'1.2rem', fontWeight:850}}
          >
            Upgrades (buy once, ongoing benefit)
          </h4>
          <div className="leisure-grid">
            {injectImages(normalizedUpgrades,'leisure').map(u=>{
              const owned = upg.has(u.id)
              const recur = u.recur||{}
              return (
                <LeisureCard
                  key={u.id}
                  name={u.title}
                  img={u.img}
                  chosen={owned}
                  costLabel={owned ? 'Owned' : `One-off £${Math.abs(u.cost)}`}
                  effects={[
                    {type:'money', val:u.cost},
                    ...(recur.health?[{type:'health',abbr:'H',val:recur.health}]:[]),
                    ...(recur.wellbeing?[{type:'wellbeing',abbr:'W',val:recur.wellbeing}]:[]),
                  ]}
                  onToggle={()=>{ toggleInSet(upgradesKey, u.id) }}
                />
              )
            })}
          </div>

          <h4
            className="block-title"
            style={{marginTop:12, fontFamily:DISPLAY_FONT, fontSize:'1.2rem', fontWeight:850}}
          >
            Streaming subscriptions (monthly)
          </h4>
          <div className="leisure-grid">
            {injectImages(STREAMING_SUBS,'sub').map(s=>{
              const on = subs.has(s.id)
              const w = s.effects?.wellbeing || 0
              return (
                <LeisureCard
                  key={s.id}
                  name={s.title}
                  img={s.img}
                  chosen={on}
                  costLabel={`£${Math.abs(s.cost)}/mo`}
                  effects={[
                    {type:'money', val:s.cost},
                    ...(w ? [{type:'wellbeing', abbr:'W', val:w}] : []),
                  ]}
                  onToggle={()=>{ toggleInSet(subsKey, s.id) }}
                />
              )
            })}
          </div>
        </section>
      )
    })(),
    transport: (
      <section className="card block">
        <h3
          className="block-title"
          style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
        >
          Transport
        </h3>
        <div className="grid3">
          {injectImages(TRANSPORT,'transport').map(item=>{
            const isBike = item.id === 'bike'
            const locked = isBike && localStorage.getItem('owns_bike') !== '1'
            const selected = chosen('transport') === item.id && !locked
            const effMoney = item.effects?.money || 0
            const effHealth = (item.id === 'bus_pass') ? 0 : (item.effects?.health || 0)
            const effWell   = (item.id === 'bus_pass') ? -1 : (item.effects?.wellbeing || 0)
            const handlePick = safeOnClick(() => { if(!locked) pick('transport', item.id) })
            const buyBike = safeOnClick(() => { localStorage.setItem('owns_bike','1'); })

            const baseStyle = {
              borderRadius: 20,
              padding: 16,
              background: selected
               ? 'linear-gradient(135deg, rgba(34,197,94,0.14), #ffffff)'

                : 'linear-gradient(135deg, #ffffff, #f7f7fb)',
              boxShadow: selected
                ? '0 8px 20px rgba(0,0,0,0.22)'
                : '0 4px 12px rgba(0,0,0,0.12)',
              border: selected
              ? '2px solid rgba(34,197,94,0.95)'

                : '1px solid rgba(0,0,0,0.12)',
              opacity: locked ? 0.6 : 1,
              cursor: locked ? 'not-allowed' : 'pointer',
              transition:
                'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease',
              fontSize:'1rem',
            }

            const titleText = item.title + (locked ? ' (Locked until you buy a bike)' : '')

            return (
              <div
                key={item.id}
                className={'choiceCard' + (selected ? ' selected' : '' )}
                aria-disabled={locked}
                style={baseStyle}
                onMouseEnter={(e) => {
                  if (locked) return
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = selected
                    ? '0 14px 34px rgba(34,197,94,0.28)'

                    : '0 8px 18px rgba(0,0,0,0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = selected
                    ? '0 8px 20px rgba(0,0,0,0.22)'
                    : '0 4px 12px rgba(0,0,0,0.12)'
                }}
              >
                {/* Title centred at top */}
                <div
                  className="title"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: 10,
                    textAlign: 'center',
                    fontFamily: DISPLAY_FONT,
                  }}
                >
                  {titleText}
                </div>

                {/* Row: big image on left, info on right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 12,
                  }}
                >
                  <div
                    className="img"
                    style={{
                      flex: '0 0 150px',
                      height: 150,
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: '#e9ecf3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.img ? (
                      <img
                        className="fit-img"
                        src={item.img}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span className="img-ph" style={{fontSize:'1rem'}}>Image</span>
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div
                      className="scores"
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 4,
                      }}
                    >
                      <EffectPill type="money" val={effMoney} />
                      <EffectPill type="health" val={effHealth} />
                      <EffectPill type="wellbeing" val={effWell} />
                    </div>

                    <div className="muted" style={{fontSize:'1rem', marginBottom:4}}>
                      {effMoney < 0 ? `Costs £${Math.abs(effMoney)} / month` : 'No cost'}
                    </div>

                    <div className="row" style={{ marginTop:4, justifyContent:'space-between', gap:8 }}>
                      {isBike && locked ? (
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={buyBike}
                          style={{fontSize:'1rem'}}
                        >
                          Buy a bike (one-off £150)
                        </button>
                      ) : <span /> }
                      <button
                        type="button"
                        className="btn primary"
                        disabled={locked}
                        onClick={handlePick}
                        style={{fontSize:'1rem'}}
                      >
                        {selected ? 'Selected' : 'Choose'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    ),
    phone: (
      month===0 ? (
        <section className="card block">
          <h3
            className="block-title"
            style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            Phone Plan (locks after Month 1)
          </h3>
          <div className="grid3">
            {injectImages(PHONE,'phone').map(item=>(
              <ChoiceCard
                key={item.id}
                item={item}
                selected={chosen('phone')===item.id}
                onPick={()=>pick('phone', item.id)}
                onInfo={()=>openInfo(item.id, item.title)}
              />
            ))}
          </div>
        </section>
      ) : null
    ),
    broadband: (
      month===0 ? (
        <section className="card block">
          <h3
            className="block-title"
            style={{ fontFamily:DISPLAY_FONT, fontSize:'1.4rem', fontWeight:900 }}
          >
            Broadband Plan (locks after Month 1)
          </h3>
          <div className="grid3">
            {injectImages(BROADBAND,'broadband').map(item=>(
              <ChoiceCard
                key={item.id}
                item={item}
                selected={chosen('broadband')===item.id}
                onPick={()=>pick('broadband', item.id)}
                onInfo={()=>openInfo(item.id, item.title)}
              />
            ))}
          </div>
        </section>
      ) : null
    ),
    chat: (
  <section className="card block">
    <h3
      className="block-title"
      style={{ fontFamily: DISPLAY_FONT, fontSize: "1.4rem", fontWeight: 900 }}
    >
      Phone (WhatsApp)
    </h3>

    <div className="muted" style={{ fontSize: "1rem", marginTop: -4 }}>
      Open each new message and reply where needed.
    </div>

    <div style={{ marginTop: 12 }}>
{/* Inside the return statement of Month.jsx */}
<WhatsAppPhone
  messages={chatThisMonth}
  onDraft={handleChatDraft}
  onSend={handleChatSend}
  onMarkRead={(id) => dispatch({ type: "CHAT_MARK_READ", id })}
/>






    </div>
  </section>
),

    summary: (() => {
const history = readHistory() || []

// Only show months that have actually been played
const visibleHistory = history
  .filter(h => typeof h.month === 'number')
  .sort((a, b) => a.month - b.month)

const moneyHistoryPoints = visibleHistory.map(h => ({
  x: h.month,
  y: h.money,
}))

const healthHistoryPoints = visibleHistory.map(h => ({
  x: h.month,
  y: h.health,
}))

const wellbeingHistoryPoints = visibleHistory.map(h => ({
  x: h.month,
  y: h.wellbeing,
}))


      // For avatar
      const moneyNow = state.money
      const healthNow = state.health
      const wellNow = state.wellbeing

      return (
        <section className="card block">
          <h3
            className="block-title"
            style={{ marginBottom: 10, fontWeight: 900 }}
          >
            Summary
          </h3>

          <div
            className="summary-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2.2fr) minmax(260px, 1fr)',
              gap: 20,
              alignItems: 'flex-start',
            }}

            
          >
            {/* LEFT: graphs + regular bills + bank statement */}
            <div
              className="summary-main"
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <h3 className="block-title">How your scores have changed</h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#4b5563',
                    marginTop: 4,
                  }}
                >
                  Each line shows how your scores changed over the months you’ve played.
                </p>
               {(() => {
const MONTHS_3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const hist =
  state.history ||
  (() => {
    try { return JSON.parse(localStorage.getItem("ph_history") || "null"); } catch { return null; }
  })();

const moneyHist = Array.isArray(hist?.money) ? hist.money : [Number(state.money || 0)];
const healthHist = Array.isArray(hist?.health) ? hist.health : [Number(state.health || 0)];
const wellHist = Array.isArray(hist?.wellbeing) ? hist.wellbeing : [Number(state.wellbeing || 0)];

const playedCount = Math.min(
  12,
  Math.max(moneyHist.length, healthHist.length, wellHist.length)
);

const moneyHistoryPoints = moneyHist.slice(0, playedCount).map((y, i) => ({ x: i, y }));
const healthHistoryPoints = healthHist.slice(0, playedCount).map((y, i) => ({ x: i, y }));
const wellbeingHistoryPoints = wellHist.slice(0, playedCount).map((y, i) => ({ x: i, y }));

const xLabels = MONTHS_3.slice(0, playedCount);


  return (
    <div className="ph-trends" style={{ marginTop: 10 }}>
      <MiniLineChart
        label="Money"
        color="#16a34a"
        points={moneyHistoryPoints}
      />
      <MiniLineChart
        label="Health"
        color="#2563eb"
        points={healthHistoryPoints}
      />
      <MiniLineChart
        label="Well-being"
        color="#f97316"
        points={wellbeingHistoryPoints}
      />

{/* Month axis (aligned to points) */}
{(() => {
  const SVG_W = 520;  // must match MiniLineChart
  const PAD_X = 14;   // must match MiniLineChart
  const padPct = (PAD_X / SVG_W) * 100;

  const n = Math.max(1, moneyHistoryPoints?.length || 0);
  const labels = xLabels.slice(0, n);

  return (
    <div
      className="ph-xlabels"
      aria-label="Months"
      style={{
        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        paddingLeft: `${padPct}%`,
        paddingRight: `${padPct}%`,
      }}
    >
      {labels.map((m, i) => (
        <div key={`${m}-${i}`} className="ph-xlabel">{m}</div>
      ))}
    </div>
  );
})()}

    </div>
  );
})()}

              </div>

             
            </div>

            {/* RIGHT: big avatar and text */}
            <aside
              className="summary-avatar"
              style={{
                borderLeft: '1px solid #e5e7eb',
                paddingLeft: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <h4
                className="block-title"
                style={{ marginBottom: 0, fontWeight: 800 }}
              >
                How you’re doing
              </h4>
              <ScoreAvatar
                gender={localStorage.getItem('avatar_gender') || 'male'}
                money={moneyNow}
                health={healthNow}
                wellbeing={wellNow}
                size={600}
              />
              {(() => {
                const w = Math.round(wellNow ?? 0)
                let msg =
                  'Mixed month. Some things are going ok, but there’s room to improve.'
                if (w <= 30) {
                  msg =
                    'Your well-being is low. Try to balance money with rest, fun and support.'
                } else if (w >= 70) {
                  msg =
                    'You’re doing really well – a good balance of money, health and well-being.'
                }
                return (
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: '#4b5563',
                      textAlign: 'center',
                      marginTop: 1,
                      maxWidth: 260,
                    }}
                  >
                    {msg}
                  </p>
                )
              })()}
            </aside>
          </div>
        </section>
      )
    })(),
  };

  return (
    <div className="month-page" style={{fontSize:'1rem'}}>




      {/* BIG LIVE TOTALS BAR – now at the top */}
       {!isPhoneTab && (
 
<section
  className="card block"
  style={{
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    background: "linear-gradient(180deg, #ffffff, #f6f8fb)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
    border: "1px solid rgba(17,24,39,0.08)",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    }}
  >
    <div
      style={{
        fontFamily: DISPLAY_FONT,
        fontSize: "1.35rem",
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      Your balance & scores
    </div>

    <div style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>
      Live preview
    </div>
  </div>

  {/* TOP ROW: BALANCE (HERO) */}
  <div
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 14px 34px rgba(2,6,23,0.14)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 26px rgba(0,0,0,0.10)";
    }}
    style={{
      borderRadius: 18,
      padding: 16,
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      border: "1px solid rgba(2,6,23,0.08)",
      boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
      transition: "transform 140ms ease, box-shadow 140ms ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
<div
  aria-hidden
  style={{
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(15,23,42,0.06)",
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
  }}
>
  £
</div>


      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#334155", fontWeight: 800 }}>
          Balance
        </div>

        {/* B: Neutral/dark balance (like a bank app) */}
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 950,
            letterSpacing: "-0.02em",
            color: "#0f172a",
            lineHeight: 1.05,
          }}
        >
          £{totals.money.toFixed(2)}
        </div>

        <div style={{ fontSize: 12.5, color: "#475569", fontWeight: 700 }}>
          This month’s net change
        </div>
      </div>
    </div>

    {/* STATEMENT CTA (PRIMARY) */}
    <button
      type="button"
      onClick={safeOnClick(() => setShowStatement(true))}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#0f172a";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#111827";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        flex: "0 0 auto",
        border: "none",
        cursor: "pointer",
        borderRadius: 14,
        padding: "12px 14px",
        background: "#111827",
        color: "#ffffff",
        fontWeight: 900,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 10px 22px rgba(2,6,23,0.22)",
        transition: "transform 140ms ease, background 140ms ease",
      }}
    >
      <span aria-hidden style={{ fontSize: 16 }}>£</span>
      View bank statement
      <span
        aria-hidden
        style={{
          marginLeft: 2,
          fontSize: 18,
          lineHeight: 1,
          opacity: 0.95,
        }}
      >
        →
      </span>
    </button>
  </div>

  {/* SECOND ROW: HEALTH + WELL-BEING (SUPPORTING) */}
  <div
    style={{
      marginTop: 12,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 12,
    }}
  >
    {/* Health */}
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        background: "linear-gradient(135deg, #fff7f9, #ffffff)",
        border: "1px solid rgba(2,6,23,0.06)",
        boxShadow: "0 6px 16px rgba(2,6,23,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div aria-hidden style={{ fontSize: 22 }}>❤️</div>
      <div>
        <div style={{ fontSize: 13, color: "#334155", fontWeight: 900 }}>
          Health
        </div>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: 950,
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {(totals.health >= 0 ? "+" : "") + totals.health}
        </div>
      </div>
    </div>

    {/* Well-being */}
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        background: "linear-gradient(135deg, #f7fff7, #ffffff)",
        border: "1px solid rgba(2,6,23,0.06)",
        boxShadow: "0 6px 16px rgba(2,6,23,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div aria-hidden style={{ fontSize: 22 }}>😊</div>
      <div>
        <div style={{ fontSize: 13, color: "#334155", fontWeight: 900 }}>
          Well-being
        </div>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: 950,
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {(totals.wellbeing >= 0 ? "+" : "") + totals.wellbeing}
        </div>
      </div>
    </div>
  </div>
</section>

      )}


      {blocks[currentTab] || blocks.housing}

      {showStatement && <BankStatementModal />}
      {infoOpen && <InfoModal />}
      {endGame && <EndGameModal />}

      {galleryOpen && <HousingGalleryModal />}
{showSummary && (
  <MonthEndSummary
    items={summaryItems}
    startAmount={0}
    currentMonthIndex={month % 12}
    onDone={commitAfterSummary}
  />
)}

</div>
  )
}
