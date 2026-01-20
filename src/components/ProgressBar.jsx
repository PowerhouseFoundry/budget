// Drop-in replacement: thicker bars + optional numeric overlay
export default function ProgressBar({ value = 0, color = 'var(--blue)', height = 16, showValue = false }){
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const outerStyle = {
    position: 'relative',
    width: '100%',
    height: height + 'px',
    borderRadius: 999,
    background: 'rgba(0,0,0,0.08)',
    overflow: 'hidden'
  };
  const innerStyle = {
    width: v + '%',
    height: '100%',
    background: color,
    transition: 'width 300ms ease',
  };
  const labelStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: Math.max(12, Math.floor(height*0.6)),
    color: '#111', mixBlendMode: 'plus-lighter', pointerEvents: 'none'
  };
  return (
    <div style={outerStyle} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} role="progressbar">
      <div style={innerStyle} />
      {showValue && <div style={labelStyle}>{Math.round(v)}%</div>}
    </div>
  );
}
