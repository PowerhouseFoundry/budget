// src/components/StepIndicator.jsx
import './StepIndicator.css'

export default function StepIndicator({ steps, current, onJump }){
  return (
    <div className="stepper">
      {steps.map((s, i)=>(
        <button
          key={s.key}
          className={'step '+(i===current?'on':'')+' '+(s.done?'done':'')}
          onClick={()=>onJump(i)}
          title={s.label}
        >
          <span className="num">{i+1}</span>
          <span className="lbl">{s.label}</span>
        </button>
      ))}
    </div>
  )
}
