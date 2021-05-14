import { faCommentMedical, faUserMd, faAddressBook, faSearch } from "@fortawesome/free-solid-svg-icons"

import {
  synopsisLeedsServicesAction,
  synopsisTopThreeThingsAction,
  synopsisNhsServicesAction,
  synopsisLoopServicesAction,
} from "../actions/synopsisActions"

export const nonCoreSynopsisActions = [
  synopsisLeedsServicesAction,
  synopsisTopThreeThingsAction,
  synopsisNhsServicesAction,
  synopsisLoopServicesAction,
]

export const nonCoreSynopsisData = [
  // { id: "block-vaccinations", title: "Vaccinations", list: "vaccinations", icon: faSyringe, isActive: true },
  { id: "block-top3Things", title: "Top Three Things", list: "top3Things", icon: faUserMd, isActive: true },
  { id: "block-nhsServices", title: "NHS Resources", list: "nhs-resources", icon: faAddressBook, isActive: true },
  {
    id: "block-leedsServices",
    title: "Health and Advice",
    list: "health-and-advice",
    icon: faCommentMedical,
    isActive: true,
    listOnly: true,
  },
  { id: "block-loop", title: "Leeds Information", list: "leeds-information", icon: faSearch, isActive: true },
  { id: "block-aboutme", title: "About Me", list: "about-me", icon: faUserMd, isActive: true },
]
