import React, { useRef } from "react"
import TableHeader from "../../../core/common/TableHeader"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import backgroundImage from "../../images/Artboard.png"
import { useEffect } from "react"
import { PageTitle } from "../../../core/common/PageTitle"

export default function Measurements(props) {
  const canvasRef = useRef(null)

  useEffect(() => {
    window.analytics.page({ url: window.location.hash })
    const token = localStorage.getItem("token")

    const headers = {
      Authorization: `Bearer ${token}`,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    }

    canvasRef.current.setAuthHandler((request, options) => {
      request.headers = headers
      return request
    })
  }, [])

  const resourceUrl = "measurements"
  const title = "Measurements"

  const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

  return (
    <React.Fragment>
      <PageTitle />
      <Breadcrumbs resource={breadcrumbsResource} />
      <TableHeader resource={resourceUrl} />

      <syn-canvas ref={canvasRef} library-root="/registry">
        <div style={{ background: `url${backgroundImage}` }}>
          <syn-panel
            panel-id="observation-panel"
            panel="observation-panel"
            submit="/api/patient/fhir"
            observation-root="/api/patient/fhir/Observation"
            configuration="/ObservationDefinitions.json"
          ></syn-panel>
        </div>
      </syn-canvas>
    </React.Fragment>
  )
}
