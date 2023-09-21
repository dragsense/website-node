const React = require("react");

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service

    this.setState({
      error: error
    });
    //this.props.displayError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <span style={{ color: "red" }}>An Error Has Occured</span>
          <details>{this.state.error && this.state.error.toString()}</details>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
