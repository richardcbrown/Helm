// NON-CORE PLUGINS CONFIGURATION LIST

// TOP THREE THINGS
import TopThreeThingsCreate from "../plugins/TopThreeThings/TopThreeThingsCreate"

// LEEDS REPOSITORY
import Directory from "../pages/Directory"
// NHS WIDGETS
import NhsWidgets from "../plugins/NhsWidgets/NhsWidgets"

export default [
  {
    name: "top3Things",
    label: "Top Three Things",
    list: TopThreeThingsCreate,
  },
  {
    name: "leeds-information",
    label: "Leeds Information",
    list: Directory,
  },
  {
    name: "nhs-resources",
    label: "NHS Resources",
    list: NhsWidgets,
  },
]
