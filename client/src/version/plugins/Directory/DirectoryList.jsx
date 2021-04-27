import React, { Component } from "react"
import {
  Card,
  Typography,
  Grid,
  CardContent,
  Chip,
  TextField,
  Collapse,
  CardActions,
  IconButton,
} from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { withStyles } from "@material-ui/core/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPhone, faUser, faAt } from "@fortawesome/free-solid-svg-icons"
import backgroundImage from "../../images/Artboard.png"
import customDataProvider from "../../../core/dataProviders/dataProvider"
import DirectoryPagination from "./fragments/DirectoryPagination"
import TableHeader from "../../../core/common/TableHeader"
import clsx from "clsx"
import { httpErrorAction } from "../../../core/actions/httpErrorAction"
import { connect } from "react-redux"
import get from "lodash/get"
import { PageTitle } from "../../../core/common/PageTitle"
import { setAccessibilityMessage } from "../../../core/actions/accessibilityActions"

const styles = (theme) => ({
  container: {
    width: "100%",
    height: "100%",
    background: `url(${backgroundImage}) 0 0 repeat`,
  },
  searchContainer: {
    backgroundColor: "#fff",
    padding: "24px",
  },
  resultsContainer: {
    padding: "24px",
  },
  chipItem: {
    marginRight: "4px",
    marginBottom: "4px",
  },
  cardHeader: {
    backgroundColor: theme.palette.mainColor,
    color: theme.palette.common.white,
  },
  cardContact: {
    display: "flex",
    marginBottom: "8px",
    alignItems: "center",
  },
  cardVideo: {
    padding: 0,
  },
  searchField: {
    marginBottom: "8px",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  viewButton: {
    display: "flex",
    width: 110,
    height: 40,
    padding: 0,
    backgroundColor: "white",
    color: theme.palette.mainColor,
    border: `1px solid ${theme.palette.mainColor}`,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 800,
    "&:hover": {
      backgroundColor: theme.palette.mainColor,
      color: "white",
    },
    textDecorationLine: "none",
    fontFamily: theme.typography.fontFamily,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
})

const TagDisplay = ({ tags, tagSelected, onDelete, classes }) => {
  return (
    <React.Fragment>
      {tags.map((tag) => {
        if (tag.fixed) {
          return <Chip className={classes.chipItem} key={tag.id} label={tag.name} />
        } else if (onDelete) {
          return (
            <Chip
              className={classes.chipItem}
              key={tag.id}
              label={tag.name}
              onClick={() => tagSelected && tagSelected(tag)}
              onDelete={() => onDelete(tag)}
            />
          )
        } else {
          return (
            <Chip
              className={classes.chipItem}
              key={tag.id}
              label={tag.name}
              onClick={() => tagSelected && tagSelected(tag)}
            />
          )
        }
      })}
    </React.Fragment>
  )
}

class YouTubeCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
    }
  }

  handleExpandClick() {
    const { expanded } = this.state

    this.setState({ expanded: !expanded })
  }

  render() {
    const { resource, tagSelected, classes } = this.props
    const { embeddedLink } = resource
    const { expanded } = this.state

    resource.category_taxonomies = resource.category_taxonomies || []
    const hasAdditionalTags = resource.category_taxonomies.length > 3

    return (
      <Card>
        <CardContent className={classes.cardHeader}>
          <Typography variant="h5" className>
            {resource.name}
          </Typography>
        </CardContent>
        <CardContent className={classes.cardVideo}>
          {embeddedLink && (
            <iframe
              width="100%"
              height="250"
              src={embeddedLink}
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen
            ></iframe>
          )}
        </CardContent>
        {resource.intro && (
          <CardContent>
            <Typography>{resource.intro}</Typography>
          </CardContent>
        )}
        <CardContent>
          <TagDisplay tags={resource.category_taxonomies.slice(0, 3)} tagSelected={tagSelected} classes={classes} />
        </CardContent>
        <CardActions disableSpacing className={classes.cardActions}>
          <IconButton onClick={this.handleExpandClick} aria-expanded={expanded} aria-label="show more">
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography>{resource.description}</Typography>
          </CardContent>
          {hasAdditionalTags && (
            <CardContent>
              <TagDisplay tags={resource.category_taxonomies.slice(3)} tagSelected={tagSelected} classes={classes} />
            </CardContent>
          )}
        </Collapse>
      </Card>
    )
  }
}

class DefaultCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false,
    }
  }

  handleExpandClick() {
    const { expanded } = this.state

    this.setState({ expanded: !expanded })
  }

  render() {
    const { resource, tagSelected, classes } = this.props
    const { expanded } = this.state

    resource.category_taxonomies = resource.category_taxonomies || []

    const hasContact = !!(resource.contact_name || resource.contact_phone || resource.contact_email)
    const hasAdditionalTags = resource.category_taxonomies.length > 3

    return (
      <Card>
        <CardContent className={classes.cardHeader}>
          <Typography variant="h5">{resource.name}</Typography>
        </CardContent>
        <CardContent>
          <Typography>{resource.description}</Typography>
        </CardContent>
        {hasContact && (
          <CardContent>
            {resource.contact_name && (
              <div className={classes.cardContact}>
                <FontAwesomeIcon title="" icon={faUser} size="2x" style={{ height: 20 }} />
                <Typography>{resource.contact_name}</Typography>
              </div>
            )}
            {resource.contact_phone && (
              <div className={classes.cardContact}>
                <FontAwesomeIcon title="" icon={faPhone} size="2x" style={{ height: 20 }} />
                <Typography>{resource.contact_phone}</Typography>
              </div>
            )}
            {resource.contact_email && (
              <div className={classes.cardContact}>
                <FontAwesomeIcon title="" icon={faAt} size="2x" style={{ height: 20 }} />
                <Typography>{resource.contact_email}</Typography>
              </div>
            )}
          </CardContent>
        )}
        <CardContent>
          <TagDisplay tags={resource.category_taxonomies.slice(0, 3)} tagSelected={tagSelected} classes={classes} />
        </CardContent>
        <CardActions disableSpacing className={classes.cardActions}>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={this.handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View"
              className={classes.viewButton}
            >
              <span>View</span>
            </a>
          )}
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography>{resource.intro}</Typography>
          </CardContent>
          {hasAdditionalTags && (
            <CardContent>
              <TagDisplay tags={resource.category_taxonomies.slice(3)} tagSelected={tagSelected} classes={classes} />
            </CardContent>
          )}
        </Collapse>
      </Card>
    )
  }
}

const getTileForType = (serviceOrResource, tagSelected, classes) => {
  const { tileType } = serviceOrResource

  switch (tileType) {
    case "youtube": {
      return <YouTubeCard resource={serviceOrResource} tagSelected={tagSelected} classes={classes} />
    }
    default: {
      return <DefaultCard resource={serviceOrResource} tagSelected={tagSelected} classes={classes} />
    }
  }
}

const DirectoryGrid = ({ data, classes, tagSelected }) => {
  return (
    <Grid container spacing={4} className={classes.resultsContainer}>
      {data.map((d) => {
        return (
          <Grid item xs={12} sm={6} md={4}>
            {getTileForType(d, tagSelected, classes)}
          </Grid>
        )
      })}
    </Grid>
  )
}

class DirectoryList extends Component {
  constructor(props) {
    super(props)

    const { fixedTags } = props

    fixedTags.forEach((tag) => (tag.fixed = true))

    this.state = {
      serviceOrResourceName: "",
      tags: fixedTags,
      page: 1,
      searchResults: {},
      searching: false,
      firstLoad: true,
    }

    this.tagSelected = this.tagSelected.bind(this)
    this.tagRemoved = this.tagRemoved.bind(this)
    this.tagChanged = this.tagChanged.bind(this)
    this.pageSelected = this.pageSelected.bind(this)
  }

  componentDidMount() {
    const { serviceOrResourceName, tags } = this.state

    if (tags.length) {
      this.searchParametersChanged({ serviceOrResourceName, tags })
    }
  }

  tagSelected(tag) {
    const { tags } = this.state

    if (tags.some((t) => t.id === tag.id)) {
      return
    }

    const newTags = [...tags, tag]

    this.tagChanged(newTags)
  }

  tagRemoved(tag) {
    if (tag.fixed) {
      return
    }

    const { tags } = this.state

    const filtered = tags.filter((t) => t.id !== tag.id)

    this.tagChanged(filtered)
  }

  tagChanged(tags) {
    this.setState({ tags, page: 1 }, () => this.searchParametersChanged())
  }

  pageSelected(page) {
    this.setState({ page }, () => this.searchParametersChanged())
  }

  searchParametersChanged() {
    this.setState({ searching: true })

    const { tags, serviceOrResourceName, page } = this.state
    const { onError, setAccessibilityMessage } = this.props

    setAccessibilityMessage(`Getting search results for page ${page}`)

    customDataProvider("GET_LIST", "leeds-information", {
      q: serviceOrResourceName,
      tags: tags.map((t) => t.id).join(","),
      page: page,
    })
      .then((res) => {
        this.setState((prevState) => {
          return {
            ...prevState,
            searchResults: res,
            searching: false,
            firstLoad: false,
          }
        })

        setAccessibilityMessage(`Search results for page ${page} loaded`)
      })
      .catch((error) => {
        const errorTrim = error.message.replace("Error:", "").trim()
        const errorArray = errorTrim.split("|")
        const data = {
          status: get(errorArray, [0], null),
          message: get(errorArray, [1], null),
        }

        this.setState({
          searchResults: {},
          searching: false,
          firstLoad: false,
        })

        onError(data)
      })
  }

  debounceNameSearch(serviceOrResourceName) {
    this.setState(
      (prevState) => {
        return {
          ...prevState,
          serviceOrResourceName,
          page: 1,
        }
      },
      () => {
        if (this.timeout) {
          clearTimeout(this.timeout)
        }

        this.timeout = setTimeout(() => this.searchParametersChanged(), 300)
      }
    )
  }

  render() {
    const { tags, serviceOrResourceName, searchResults, page, searching, firstLoad } = this.state
    const { classes } = this.props

    const results = searchResults.data || []

    const { lastPage } = searchResults

    return (
      <Grid className={classes.container}>
        <PageTitle />

        <TableHeader resource="leeds-information" />

        <div className={classes.searchContainer}>
          <Typography
            variant="h6"
            aria-label="Type in a search term e.g. Diabetes for national and local service information."
          >
            Type in a search term e.g. Diabetes for national and local service information.
          </Typography>
          <TextField
            value={serviceOrResourceName}
            onChange={(e) => this.debounceNameSearch(e.target.value)}
            id="resources-search"
            label="Search Service or Resource name"
            aria-label="Search Service or Resource name"
            fullWidth
            className={classes.searchField}
            InputLabelProps={{
              for: "resources-search",
              "aria-label": "Search Service or Resource name",
            }}
          />

          {(results.length && (
            <Typography
              aria-label="Select one or more tags from results to refine your search"
              className={classes.searchField}
              variant="caption"
            >
              Select one or more tags from results to refine your search
            </Typography>
          )) ||
            null}

          {tags && tags.length ? (
            <div>
              <Typography className={classes.searchField} variant="caption" aria-label="Applied Tags">
                Applied Tags
              </Typography>
              <TagDisplay tags={tags} onDelete={this.tagRemoved} classes={classes} />
            </div>
          ) : null}

          {!firstLoad && !searching && !results.length && (
            <div>
              <Typography>No results, please try another search</Typography>
            </div>
          )}
        </div>

        <DirectoryGrid classes={classes} data={results} tagSelected={this.tagSelected} />

        {results.length ? (
          <DirectoryPagination page={page} pageSelected={this.pageSelected} lastPage={lastPage} />
        ) : null}
      </Grid>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onError: (error) => dispatch(httpErrorAction.save(error)),
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

const styled = connect(null, mapDispatchToProps)(withStyles(styles)(DirectoryList))

export { styled as DirectoryList }
