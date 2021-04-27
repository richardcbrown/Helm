import React, { Component } from "react"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Grid } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

const styles = {
  container: {
    width: "100%",
    "-webkit-overflow-scrolling": "touch",
    overflowY: "auto",
    overflowX: "hidden",
  },
}

class NhsWidgetDisplay extends Component {
  constructor(props) {
    super(props)

    this.state = {
      width: null,
      loaded: false,
    }

    this.timeout = null
    this.containerRef = React.createRef()
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.updateWidth())
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateWidth())
  }

  updateWidth() {
    const { timeout, containerRef } = this
    const { loaded } = this.state

    if (timeout) {
      window.clearTimeout(timeout)
      this.timeout = null
    }

    this.timeout = window.setTimeout(() => {
      this.setState({ width: (containerRef.current && containerRef.current.offsetWidth) || 0 }, () => {
        if (!loaded) {
          this.setState({ loaded: true })
        }
      })
      this.timeout = null
    }, 500)
  }

  render() {
    const { height, src, id, classes, title } = this.props
    const { width, loaded } = this.state

    const resolvedWidth = width || 500

    return (
      <Grid container spacing={4} style={{ margin: 0, width: "100%", position: "relative", overflow: "hidden" }}>
        {!loaded && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3596f4",
            }}
          >
            <CircularProgress size={70} color="inherit" />
          </div>
        )}
        <Grid item xs={12}>
          <div ref={this.containerRef} className={classes.container} style={{ height: height + 4 }}>
            <iframe
              key={`iframe-${id}`}
              src={`${src}`}
              title={title}
              style={{ borderStyle: "none", height, width: resolvedWidth }}
              onLoad={() => this.updateWidth()}
            ></iframe>
          </div>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(NhsWidgetDisplay)
