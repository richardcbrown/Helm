import React from "react"
import get from "lodash/get"
import moment from "moment"

import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"

/**
 * This component returnts banner with Patient information
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape} classes
 * @param {shape} patientInfo
 * @constructor
 */
const PatientBanner = ({ classes, patientInfo }) => {
  const resolved = get(patientInfo, "resolved", null)

  return (
    <Grid className={classes.patientInfo} container spacing={0}>
      <Grid className={classes.gridBlock} item xs={12} lg={8}>
        <Typography variant="h6">{get(patientInfo, "name", null)}</Typography>
        <Typography variant="body2">
          <span className={classes.keyName}>Doctor: </span>
          {get(patientInfo, "gpFullAddress", null)}
        </Typography>
      </Grid>
      <Grid className={classes.gridBlock} item xs={6} lg={2}>
        <Typography variant="body2">
          <span className={classes.keyName}>D.O.B.: </span>
          {moment(get(patientInfo, "dateOfBirth", null)).format("DD-MMM-YYYY")}
        </Typography>
        <Typography variant="body2">
          <span className={classes.keyName}>Phone: </span>
          {get(patientInfo, "phone", null)}
        </Typography>
        <Typography variant="body2">
          <span className={classes.keyName}>Email: </span>
          {get(patientInfo, "email", null)}
        </Typography>
      </Grid>
      <Grid className={classes.gridBlock} item xs={6} lg={2}>
        <Typography variant="body2">
          <span className={classes.keyName}>Gender: </span>
          {get(patientInfo, "gender", null)}
        </Typography>
        <Typography variant="body2">
          <span className={classes.keyName}>NHS No.: </span>
          {get(patientInfo, "nhsNumber", null)}
        </Typography>
      </Grid>
      <Grid className={classes.gridBlock} item xs={12}>
        <Typography variant="body2">
          <span className={classes.keyName}>Address: </span>
          {get(patientInfo, "address", null)}
        </Typography>
      </Grid>
      {resolved === false ? (
        <Grid className={classes.gridBlock} item xs={12}>
          <Typography variant="caption">
            Helm is working to obtain your details from the server. They will automatically update when received. Thank
            you for your patience.
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  )
}

export default PatientBanner
