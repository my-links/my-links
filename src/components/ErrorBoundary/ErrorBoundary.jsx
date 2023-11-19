import { withTranslation } from "next-i18next";
import React from "react";
import LangSelector from "../LangSelector";
import styles from "./error-boundary.module.scss";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (!this.state.errorInfo) return this.props.children;

    return (
      <div className={styles["error-boundary"]}>
        <div className={styles["boundary-content"]}>
          <h1>{this.props.t("common:generic-error")}</h1>
          <p
            dangerouslySetInnerHTML={{
              __html: this.props.t("common:generic-error-description"),
            }}
          />
          <button onClick={() => window.location.reload()}>
            {this.props.t("common:retry")}
          </button>
          <details>
            <summary>{this.state.error && this.state.error.toString()}</summary>
            <code>{this.state.errorInfo.componentStack}</code>
          </details>
          <div className="lang-selector">
            <LangSelector />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ErrorBoundary);
