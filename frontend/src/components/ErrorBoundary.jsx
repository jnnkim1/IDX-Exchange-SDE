import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <main role="alert">
            <h1>Something went wrong.</h1>
            <p>We couldn't display the content you requested.</p>

            <button type="button" onClick={() => window.location.reload()}>
              Reload Page
            </button>

            <a href="/">Return to Listings</a>
        </main>
      );
    }
    return this.props.children;
  }
}