// src/components/ErrorBoundary.jsx
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }
  componentDidCatch(error, info){
    console.error('App crashed:', error, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:20, fontFamily:'system-ui'}}>
          <h2>Something went wrong.</h2>
          <p style={{color:'#6b7280'}}>If you see a blank screen, this helps us catch it instead.</p>
          <pre style={{whiteSpace:'pre-wrap', background:'#f9fafb', padding:12, borderRadius:8, border:'1px solid #eee'}}>
            {String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
