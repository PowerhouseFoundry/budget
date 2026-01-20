// src/data/messages.js
const now = () => new Intl.DateTimeFormat('en-GB', { hour:'2-digit', minute:'2-digit' }).format(new Date())

function readContracts(){
  try{ return JSON.parse(localStorage.getItem('contracts')||'{}') }catch(e){ return {} }
}
function rentFromHousingId(hid){
  if(hid==='housing_shared') return 350
  if(hid==='housing_studio') return 550
  if(hid==='housing_onebed') return 700
  return 0
}
function isBenefits(){
  const life = (localStorage.getItem('lifestyle')||'').toLowerCase()
  return life.includes('benefit')
}

export function MESSAGES(week=1, name='Player'){
  const month = Number(localStorage.getItem('month')||'0')
  const contracts = readContracts()
  const rent = rentFromHousingId(contracts.housing)

  const msgs = [
    {
      id: `payday-${week}`,
      sender: 'HR Department',
      subject: 'Payday — your wage has landed',
      snippet: 'Your monthly pay is in your account.',
      body: `Hi ${name},

Your pay has arrived. Plan your essentials first, then pick extras if you can afford them.`,
      time: now(),
      category: 'Finance'
    },
  ]

  if(isBenefits()){
    msgs.push({
      id: `council-support-${week}`,
      sender: 'Leeds Council',
      subject: 'Council Tax Support — check if you qualify',
      snippet: 'You may be eligible for Council Tax Support. Apply online.',
      body: `Hello ${name},

If you receive certain benefits you may qualify for Council Tax Support in Leeds.

Complete the online form with your details. If successful, a monthly reduction will be applied to your Council Tax bill in the game.`,
      time: now(),
      category: 'Utilities',
      actions: [
        { id:'apply-support', label:'Apply for support' }
      ]
    })
  }

  if(month >= 1 && rent > 0){
    msgs.unshift({
      id: `rent-${week}`,
      sender: 'Landlord',
      subject: `Rent due tomorrow — £${rent}`,
      snippet: `Hi ${name}, your rent (£${rent}) is due tomorrow.`,
      body: `Hi ${name},

This is a reminder that your monthly rent of £${rent} is due tomorrow.`,
      time: now(),
      category: 'Housing'
    })
  }

  return msgs
}
export const SAMPLE_CATEGORIES = ['Finance','Housing','Leisure','Transport','Utilities','Advice']
