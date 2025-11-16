import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: Switched to class property syntax for state initialization.
  // This is the modern and recommended approach for React class components
  // and resolves issues where TypeScript couldn't find `state`, `props`, or `setState`.
  state: State = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
  };

  static getDerivedStateFromError(_: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ direction: 'ltr', padding: '20px', color: '#a00', backgroundColor: '#fdd', border: '1px solid #a00', borderRadius: '8px', margin: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>Something went wrong.</h2>
          <details style={{ marginTop: '10px' }}>
            <summary>Click for error details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
