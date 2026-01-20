import { useEffect, useState } from 'react'
export default function Toast({ text, timeout=2000, onDone }){
  const [show,setShow]=useState(true);
  useEffect(()=>{ const t=setTimeout(()=>{ setShow(false); onDone&&onDone(); }, timeout); return ()=>clearTimeout(t);},[]);
  if(!show) return null;
  return <div className="toast">{text}</div>
}
