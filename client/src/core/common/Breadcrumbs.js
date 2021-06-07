import React from "react"
import { Link } from "react-router-dom"

import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import FeedbackButton from "../../version/common/Topbar/fragments/FeedbackButton"

const useStyles = makeStyles((theme) => ({
  breadcrumbsBlock: {
    display: "flex",
    height: 48,
    alignItems: "center",
    border: `1px solid ${theme.palette.borderColor}`,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
  },
  separator: {
    width: 0,
    height: 0,
    borderTop: "5px solid transparent",
    borderBottom: "5px solid transparent",
    borderLeft: "5px solid black",
    marginLeft: 8,
    marginRight: 8,
  },
  link: {
    textDecoration: "none",
    color: theme.palette.mainColor,
  },
  breadcrumbsItem: {
    display: "flex",
    alignItems: "center",
  },
}))

/**
 * This component returns breadcrumbs block
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape} resource
 */
const Breadcrumbs = ({ resource }) => {
  const classes = useStyles()

  return (
    <div className={classes.breadcrumbsBlock}>
      <Grid item xs={11} md={8} style={{ display: "flex", alignItems: "center" }}>
        <Typography>
          <Link to="/" className={classes.link} aria-label="Home">
            Home
          </Link>
        </Typography>
        {resource.map((item, key) => {
          return (
            <div key={key} className={classes.breadcrumbsItem}>
              <div className={classes.separator}></div>
              {item.isActive ? (
                <Link to={item.url} className={classes.link} aria-label={item.title}>
                  <Typography className={classes.link}>{item.title}</Typography>
                </Link>
              ) : (
                <Typography>{item.title}</Typography>
              )}
            </div>
          )
        })}
      </Grid>
      <Grid item xs={1} md={4}>
        <FeedbackButton />
      </Grid>
    </div>
  )
}

export default Breadcrumbs
