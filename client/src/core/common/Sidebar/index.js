import React from "react"
import get from "lodash/get"

import { withRouter } from "react-router-dom"
import { Sidebar } from "react-admin"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"

import MobileMenu from "./MobileMenu"
import MenuItems from "./MenuItems"
import { getMenuItems } from "./getMenuType"
import { Hidden } from "@material-ui/core"

const styles = (theme) => ({
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
})

/**
 * This component returns custom menu
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
const CustomSidebar = ({ classes, isSidebarOpen, onMenuClick, location }) => {
  const currentPathname = get(location, "pathname", null)
  const pathNameArray = currentPathname.split("/")
  const currentList = "/" + pathNameArray[1]
  const menuItems = getMenuItems(currentPathname)
  return (
    <>
      <Hidden mdUp>
        {isSidebarOpen ? null : (
          <MobileMenu classes={classes} menuItems={menuItems} currentList={currentList} onMenuClick={onMenuClick} />
        )}
      </Hidden>
      <Hidden smDown>
        {isSidebarOpen ? (
          <Sidebar className={classes.sidebarBlock}>
            <MenuItems classes={classes} menuItems={menuItems} currentList={currentList} onMenuClick={onMenuClick} />
          </Sidebar>
        ) : null}
      </Hidden>
    </>
  )
}

const mapStateToProps = (state) => ({
  isSidebarOpen: state.admin.ui.sidebarOpen,
})

export default withRouter(connect(mapStateToProps, null)(withStyles(styles)(CustomSidebar)))
