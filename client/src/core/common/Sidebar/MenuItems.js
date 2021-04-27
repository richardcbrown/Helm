import React, { Component } from "react"

import { withStyles } from "@material-ui/core/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core"
import { NavLink } from "react-router-dom"

const styles = (theme) => ({
  menuBlock: {
    border: `1px solid ${theme.palette.borderColor}`,
  },
})

class NavLinkMui extends Component {
  render() {
    const { forwardedRef, ...props } = this.props
    return <NavLink {...props} ref={forwardedRef} />
  }
}

const MenuItems = ({ classes, menuItems, currentList, onMenuClick }) => {
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

export default withStyles(styles)(MenuItems)
