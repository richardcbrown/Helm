import React from "react"
import { Typography } from "@material-ui/core"

/**
 * This component returns titles and descriptions for table headers
 * (for non-core plugins)
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @return {shape}
 */
export default {
  // top3Things: {
  //   title: "Top 3 Things About Me",
  //   description: "Three things that you feel would be useful for health and care professionals to know about you.",
  //   subText:
  //     "Do not enter anything that requires assistance or urgent attention. If you need urgent medical attention please contact your GP surgery, ring 111 or 999.",
  // },
  "nhs-resources": {
    title: "NHS Resources",
    description: "",
  },
  "leeds-information": {
    title: "Leeds Information",
    description: "Local service information and resources to support your health and care.",
    subText:
      "Please note this section is under development and some of the results may not provide complete and relevant information at this time. We would value your feedback on this section.",
  },
  settings: {
    title: "Settings",
  },
}
