import { Paper, Grid, CircularProgress, makeStyles } from "@material-ui/core"
import React from "react"

const useLoaderStyles = makeStyles((theme) => ({
  spinner: {
    color: theme.palette.mainColor,
    background: theme.palette.common.white,
  },
}))

export const Loader = () => {
  const styles = useLoaderStyles()

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Paper
        elevation={0}
        style={{
          position: "absolute",
          top: "calc(50% - 40px)",
          left: "calc(50% - 40px)",
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        <Grid container spacing={0}>
          <Grid item xs={12} style={{ position: "relative", height: 90, width: 90 }} className={styles.spinner}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={70} color="inherit" />
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}

export const CenterLoader = ({ loading, loaded }) => {
  return loading ? <Loader /> : loaded()
}
