// src/data/options.js
const IMG = (name) => `${import.meta.env.BASE_URL}images/${name}.png`;

export const HOUSING = [
  // House share wellbeing -3
  { 
    id: 'housing_shared',
    title: 'House share',
    effects: { money: -350, wellbeing: -3 },
    img: IMG('housing_shared'),
    blurb: 'Sharing a house or flat keeps rent low but you compromise on privacy and space.'
  },

  // Studio flat wellbeing +2
  {
    id: 'housing_studio',
    title: 'Studio flat',
    effects: { money: -550, wellbeing: +2 },
    img: IMG('housing_studio'),
    blurb: 'Your own small space. A bit more expensive but quieter and easier to manage.'
  },

  // House wellbeing +3 (health stays +2)
  {
    id: 'housing_onebed',
    title: 'House',
    effects: { money: -700, wellbeing: +3, health: +2 },
    img: IMG('housing_onebed'),
    blurb: 'A whole house with your own space and a garden area to enjoy. More room for routines, cooking and relaxing.'
  },
];

export const FOOD = [
  // Budget shop health -4, wellbeing -2
  {
    id: 'food_budget',
    title: 'Budget shop',
    effects: { money: -160, health: -4, wellbeing: -2 },
    img: IMG('food_budget'),
    blurb: 'Buy the cheapest/value brands, plan simple meals, bulk-buy staples. It keeps costs low but can feel repetitive and may lack variety and nutrients.'
  },
  {
    id: 'food_balanced',
    title: 'Balanced shop',
    effects: { money: -220, health: +2, wellbeing: 0 },
    img: IMG('food_balanced'),
    blurb: 'Mix of value and fresh items, fruit & veg, cooking at home most days. Better nutrition without overspending.'
  },
  {
    id: 'food_luxury',
    title: 'Luxury shop',
    effects: { money: -300, health: +1, wellbeing: +3 },
    img: IMG('food_luxury'),
    blurb: 'More premium items and treats. Feels good, costs more. Still try to plan meals to avoid waste.'
  },
];

// Extras already have labels; align images to public folder.
export const FOOD_EXTRAS = [
  // Takeaways: add health -2
  {
    id: 'takeaways',
    img: IMG('food_takeaway'),
    label: 'Takeaways (£10 · H -2 · W +2)',
    effects: { money: -10, health: -2, wellbeing: +2 }
  },
  {
    id: 'eating_out',
    img: IMG('food_eatingout'),
    label: 'Eating out (£25 · H +1 · W +4)',
    effects: { money: -25, health: +1, wellbeing: +4 }
  },
];

// Each subscription gives +1 wellbeing
export const STREAMING_SUBS = [
  { id: 'sub_disney',  title: 'Disney+',   img: IMG('sub_disney'),  cost: -8, effects: { wellbeing: +1 } },
  { id: 'sub_netflix', title: 'Netflix',   img: IMG('sub_netflix'), cost: -8, effects: { wellbeing: +1 } },
  { id: 'sub_prime',   title: 'Prime',     img: IMG('sub_prime'),   cost: -9, effects: { wellbeing: +1 } },
  { id: 'sub_spotify', title: 'Spotify',   img: IMG('sub_spotify'), cost: -11, effects: { wellbeing: +1 } },
  { id: 'sub_sky',     title: 'Sky',       img: IMG('sub_sky'),     cost: -10, effects: { wellbeing: +1 } },
  { id: 'sub_appletv', title: 'Apple TV+', img: IMG('sub_appletv'), cost: -7, effects: { wellbeing: +1 } },
];

export const LEISURE_ACTIVITIES = [
  // Stay in all month wellbeing -8
  {
    id: 'stay_in',
    title: 'Stay in all month',
    cost: -0,
    effects: { wellbeing: -8 },
    img: IMG('leis_stay_in'),
    blurb: 'Spending the whole month at home can feel lonely. Cheaper but your mood may dip.'
  },
  {
    id: 'cinema',
    title: 'Cinema trip',
    cost: -12,
    effects: { wellbeing: +2 },
    img: IMG('leis_cinema'),
    blurb: 'A night out at the cinema can be a nice boost.'
  },
  {
    id: 'friends',
    title: 'Out with friends',
    cost: -20,
    effects: { wellbeing: +4 },
    img: IMG('leis_friends'),
    blurb: 'Time with friends improves well-being.'
  },
  {
    id: 'concert',
    title: 'Concert',
    cost: -45,
    effects: { wellbeing: +6 },
    img: IMG('leis_concert'),
    blurb: 'Live music is great fun but costs more.'
  },
  // Short break should cost £250
  {
    id: 'short_break',
    title: 'Short break',
    cost: -250,
    effects: { health: +1, wellbeing: +8 },
    img: IMG('leis_shortbreak'),
    blurb: 'A couple of nights away to recharge.'
  },
  // Holiday should cost £550
  {
    id: 'holiday',
    title: 'Holiday',
    cost: -550,
    effects: { health: +2, wellbeing: +12 },
    img: IMG('leis_holiday'),
    blurb: 'A bigger break with a big boost — and a big cost.'
  },
];

export const LEISURE_UPGRADES = [
  // Games console: -1 health, +2 well-being every month
  {
    id: 'console',
    title: 'Gaming console',
    cost: -250,
    recur: { wellbeing: +2, health: -1 },
    img: IMG('upg_console'),
    blurb: 'One-off cost. Adds +2 well-being each month but can reduce health if it replaces activity.'
  },
  {
    id: 'tv',
    title: 'TV',
    cost: -200,
    recur: { wellbeing: +1 },
    img: IMG('upg_tv'),
    blurb: 'One-off cost. Adds +1 well-being each month.'
  },
  {
    id: 'instrument',
    title: 'Musical instrument',
    cost: -180,
    recur: { wellbeing: +2 },
    img: IMG('upg_instrument'),
    blurb: 'One-off cost. Adds +2 well-being each month.'
  },
  {
    id: 'gym',
    title: 'Gym membership',
    cost: -30,
    recur: { health: +2 },
    img: IMG('upg_gym'),
    blurb: 'Monthly fee. Adds +2 health each month.'
  },
  {
    id: 'bike_buy',
    title: 'Buy a bike',
    cost: -150,
    recur: { health: +1 },
    img: IMG('upg_bike'),
    blurb: 'One-off cost. Adds +1 health each month and unlocks Bike transport.'
  },
];

export const TRANSPORT = [
  {
    id: 'walk',
    title: 'Walk',
    effects: { money: 0, wellbeing: 0 }, // winter penalties handled in Month.jsx
    img: IMG('transport_walk'),
    blurb: 'Free and healthy. In winter months it can feel tougher.'
  },
  {
    id: 'bus_pass',
    title: 'Bus pass',
    effects: { money: -60, health: +1 },
    img: IMG('transport_bus_pass'),
    blurb: 'Unlimited bus travel in the city.'
  },
  // Bike wellbeing +1
  {
    id: 'bike',
    title: 'Bike',
    effects: { money: -5, health: +3, wellbeing: +1 },
    img: IMG('transport_bike'),
    blurb: 'Active, low-cost travel. Requires owning a bike.'
  },
];

export const PHONE = [
  // SIM only: wellbeing 0
  {
    id: 'sim_only',
    title: 'SIM only',
    effects: { money: -10, wellbeing: 0 },
    img: IMG('phone_sim_only'),
    blurb: 'Low-cost SIM plan.'
  },
  // Mid plan: wellbeing +1
  {
    id: 'mid_plan',
    title: 'Mid plan',
    effects: { money: -20, wellbeing: +1 },
    img: IMG('phone_mid_plan'),
    blurb: 'More data for social and streaming.'
  },
  // Unlimited: wellbeing +2
  {
    id: 'unlimited',
    title: 'Unlimited',
    effects: { money: -35, wellbeing: +2 },
    img: IMG('phone_unlimited'),
    blurb: 'Unlimited data for heavy use.'
  },
];

export const BROADBAND = [
  {
    id: 'bb_basic',
    title: 'Basic',
    effects: { money: -18 },
    img: IMG('broadband_bb_basic'),
    blurb: 'Entry-speed broadband.'
  },
  {
    id: 'bb_fibre',
    title: 'Fibre',
    effects: { money: -28 },
    img: IMG('broadband_bb_fibre'),
    blurb: 'Fast fibre.'
  },
  {
    id: 'bb_fast',
    title: 'Fast fibre',
    effects: { money: -38 },
    img: IMG('broadband_bb_fast'),
    blurb: 'Very fast fibre.'
  },
];

export const BILLS = {
  council_tax: -100,
  gas_electric: -146,
  water: -35,
  tv_licence: -13.25,
};

export const BILL_LABELS = {
  council_tax: 'Council Tax',
  gas_electric: 'Gas & Electricity',
  water: 'Water',
  tv_licence: 'TV Licence',
};
