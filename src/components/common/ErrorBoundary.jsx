"use client"

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('UI error captured:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="m-4 p-4 border rounded bg-red-50 border-red-200 text-red-800">
          <p className="font-semibold">Ocurrió un problema al mostrar esta sección.</p>
          <p className="text-sm">Por favor, intenta de nuevo o recarga la página.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

