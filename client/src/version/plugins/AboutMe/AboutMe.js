import React, { useRef } from "react"
import TableHeader from "../../../core/common/TableHeader"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import backgroundImage from "../../images/Artboard.png"
import { useEffect } from "react"
import { PageTitle } from "../../../core/common/PageTitle"

export default function AboutMe(props) {
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

  const resourceUrl = "about-me"
  const title = "About Me"

  const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

  return (
    <React.Fragment>
      <PageTitle />
      <Breadcrumbs resource={breadcrumbsResource} />
      <TableHeader resource={resourceUrl} />

      <syn-canvas ref={canvasRef} library-root="/registry">
        <div style={{ background: `url${backgroundImage}` }}>
          <syn-panel
            panel-id="questionnaire-panel"
            panel="questionnaire-panel"
            questionnaire-src="/api/patient/fhir/Questionnaire?identifier=https://fhir.myhelm.org/questionnaire-identifier|aboutMe"
            submit="/api/patient/fhir"
            questionnaireresponse-root="/api/patient/fhir/QuestionnaireResponse?_sort=-authored"
          ></syn-panel>
        </div>
      </syn-canvas>
    </React.Fragment>
  )
}
