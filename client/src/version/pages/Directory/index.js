import React, { Component } from "react"
import { Grid, withStyles, Card, Typography } from "@material-ui/core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DirectoryList } from "../../plugins/Directory/DirectoryList"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import { themeImages } from "../../config/theme.config"
import get from "lodash/get"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { PageTitle } from "../../../core/common/PageTitle"

const cardBackgroundImage = get(themeImages, "cardBackgroundImage", null)

const directoryPages = [
  {
    title: "Search",
    fixedTags: [],
  },
  {
    title: "Search Diabetes",
    fixedTags: [
      {
        id: "9ad2a2e5-3011-49d5-a5f1-4d5e38189157",
        name: "Diabetes",
      },
    ],
  },
]

const styles = (theme) => ({
  card: {
    borderRadius: 0,
  },
  media: {
    backgroundColor: theme.palette.mainColor,
  },
  container: {
    width: "100%",
    height: "100%",
    background: theme.patientSummaryPanel.container.background,
    backgroundSize: "cover",
    margin: 0,
    display: "block",
    padding: "8px",
  },
  topBlock: {
    display: "flex",
    flexDirection: "column",
    height: 100,
    backgroundColor: theme.palette.mainColor,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    color: "#fff",
    "&:hover": {
      cursor: "pointer",
    },
    "&:before": {
      content: '""',
      position: "absolute",
      width: 300,
      height: 300,
      left: 0,
      right: 0,
      zIndex: 1,
      background: `url(${cardBackgroundImage}) 0 0 repeat`,
      backgroundSize: "contain",
      transform: "translate(-5px, -98px)",
    },
  },
  icon: {
    marginBottom: 10,
    zIndex: 2,
  },
  mainHeading: {
    margin: 0,
    zIndex: 2,
  },
  title: {
    marginBottom: 0,
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    zIndex: 2,
  },
  cardContainer: {
    alignSelf: "baseline",
  },
})

const DirectoryCard = (props) => {
  const { id, classes, title, icon, onPageSelected } = props
  return (
    <Grid className={classes.cardContainer} item xs={12} sm={6} md={6} lg={3}>
      <Card className={classes.card} onClick={() => onPageSelected()}>
        <div id={id} className={classes.topBlock} aria-label={title}>
          <FontAwesomeIcon title="" icon={icon} size="2x" className={classes.icon} />
          <h1 className={classes.mainHeading}>
            <Typography className={classes.title}>{title}</Typography>
          </h1>
        </div>
      </Card>
    </Grid>
  )
}

class Directory extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    window.analytics.page({ url: window.location.hash })
  }

  pageSelected(pageIndex) {
    const page = directoryPages[pageIndex]
    this.props.history.push(`/leeds-information/${page.title.toLowerCase().split(" ").join("-")}`)
  }

  getPage() {
    const pageFragments = window.location.hash.split("/")
    const lastFragment = pageFragments[pageFragments.length - 1]

    if (lastFragment === "leeds-information") {
      return directoryPages[0]
    }

    for (const page of directoryPages) {
      const slug = page.title.toLowerCase().split(" ").join("-")

      if (slug === lastFragment) {
        return page
      }
    }

    return null
  }

  render() {
    const { classes } = this.props

    const page = this.getPage()

    const resourceUrl = "leeds-information"
    const title = "Leeds Information"

    if (page) {
      const breadcrumbsResource = [
        { url: "/" + resourceUrl, title: title, isActive: true },
        { url: `/${resourceUrl}`, title: page.title, isActive: false },
      ]

      return (
        <React.Fragment>
          <Breadcrumbs resource={breadcrumbsResource} />
          <DirectoryList fixedTags={page.fixedTags} />
        </React.Fragment>
      )
    } else {
      const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

      return (
        <React.Fragment>
          <PageTitle />
          <Breadcrumbs resource={breadcrumbsResource} />
          <Grid container spacing={2} className={classes.container}>
            <Grid container spacing={4}>
              {directoryPages.map((page, key) => {
                return (
                  <DirectoryCard
                    key={key}
                    title={page.title}
                    icon={faSearch}
                    classes={classes}
                    onPageSelected={() => this.pageSelected(key)}
                  />
                )
              })}
            </Grid>
          </Grid>
        </React.Fragment>
      )
    }
  }
}

export default withStyles(styles)(Directory)
