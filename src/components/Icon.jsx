export function Icon({ name }){
  const size=18, stroke=2;
  const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  switch(name){
    case 'home': return (<svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M9 21V12h6v9"/></svg>);
    case 'food': return (<svg {...common}><circle cx="9" cy="7" r="2"/><path d="M3 21c3-6 9-6 12 0"/><path d="M16 3v18"/></svg>);
    case 'leisure': return (<svg {...common}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 9h10"/></svg>);
    case 'bus': return (<svg {...common}><rect x="5" y="3" width="14" height="13" rx="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>);
    case 'health': return (<svg {...common}><path d="M12 21s-6-4.35-6-9a6 6 0 1 1 12 0c0 4.65-6 9-6 9z"/></svg>);
    case 'smile': return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/><path d="M8 15s2 2 4 2 4-2 4-2"/></svg>);
    case 'chart': return (<svg {...common}><path d="M3 3v18h18"/><path d="M7 13v5"/><path d="M12 8v10"/><path d="M17 11v7"/></svg>);
    case 'credit': return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>);
    default: return (<svg {...common}><circle cx="12" cy="12" r="10"/></svg>);
  }
}
