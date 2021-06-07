import React, { Component } from "react"

import { makeStyles } from "@material-ui/core/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core"
import { NavLink } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
  menuBlock: {
    border: `1px solid ${theme.palette.borderColor}`,
  },
  sidebarBlock: {
    maxWidth: 240,
    backgroundColor: "#fff",
    "& div": {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  mobileSidebar: {
    width: "100%",
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 3,
  },
  menuBlock: {
    border: `1px solid ${theme.palette.borderColor}`,
  },
  menuItem: {
    padding: "16px !important",
    color: `${theme.palette.mainColor} !important`,
    borderBottom: `1px solid ${theme.palette.borderColor}`,
    "&:hover": {
      backgroundColor: theme.palette.mainColor,
      color: "#fff !important",
    },
    "& .MuiListItemIcon-root": {
      color: "inherit",
      minWidth: 20,
      marginTop: -2,
    },
  },
  menuItemSelected: {
    padding: "16px !important",
    backgroundColor: theme.palette.mainColor + "! important",
    color: "#fff !important",
    borderBottom: `1px solid ${theme.palette.borderColor}`,
    "& .MuiListItemIcon-root": {
      color: "inherit",
      minWidth: 20,
      margin: -2,
    },
  },
  menuItemIcon: { color: "inherit" },
  menuItemIconSelected: { color: "inherit" },
}))

class NavLinkMui extends Component {
  render() {
    const { forwardedRef, ...props } = this.props
    return <NavLink {...props} ref={forwardedRef} />
  }
}

const MenuItems = ({ menuItems, currentList, onMenuClick }) => {
  const classes = useStyles()

  return (
    <nav className={classes.menuBlock}>
      <List style={{ padding: 0 }}>
        {menuItems.map((item, key) => (
          <ListItem tabIndex={-1} key={key} component="li" style={{ padding: 0 }}>
            <NavLinkMui
              to={item.url}
              onClick={onMenuClick}
              selected={currentList === item.url}
              aria-label={item.label}
              tabIndex={0}
              style={{
                textDecoration: "none",
                width: "100%",
                display: "inline-flex",
                alignItems: "baseline",
              }}
              className={currentList === item.url ? classes.menuItemSelected : classes.menuItem}
            >
              {currentList === item.url ? (
                <ListItemIcon>
                  <FontAwesomeIcon
                    className={currentList === item.url ? classes.menuItemIconSelected : classes.menuItemIcon}
                    icon={faCircle}
                    size="xs"
                  />
                </ListItemIcon>
              ) : null}
              <ListItemText primary={<Typography style={{ fontSize: 16 }}>{item.label}</Typography>} />
            </NavLinkMui>
          </ListItem>
        ))}
      </List>
    </nav>
  )
}

export default MenuItems
