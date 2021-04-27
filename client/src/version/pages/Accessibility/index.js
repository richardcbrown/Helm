import React, { useEffect } from "react"
import { Grid, Paper, withStyles, MuiThemeProvider } from "@material-ui/core"
import { withRouter } from "react-router"
import backgroundImage from "../../images/Artboard.png"
import TopBarOnly from "../../common/TopBarOnly"
import get from "lodash/get"
import { connect } from "react-redux"
import { getCurrentTheme } from "../../../core/config/styles"
import ArrowBack from "@material-ui/icons/ArrowBack"
import PrimaryButton from "../../common/Buttons/PrimaryButton"
import { PageTitle } from "../../../core/common/PageTitle"

const backgroundStyles = (theme) => {
  return {
    background: {
      position: "absolute",
      top: 0,
      zIndex: -1,
      width: "100%",
      height: "100%",
      background: `url(${backgroundImage}) 0 0 repeat`,
    },
    backgroundContrast: {
      position: "absolute",
      top: 0,
      zIndex: -1,
      width: "100%",
      height: "100%",
    },
  }
}

const mainStyles = (theme) => {
  return {
    typography: {
      "& h1": {
        fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
      },
      "& p": {
        fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
      },
      "& li": {
        fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
      },
      "& h2": {
        fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
      },
      "& h3": {
        fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
      },
    },
  }
}

const Background = withStyles(backgroundStyles)(({ classes, contrastMode }) => {
  return <div className={contrastMode ? classes.backgroundContrast : classes.background}></div>
})

const AccessibilityPage = ({ history, theme, classes, isContrastMode }) => {
  useEffect(() => {
    window.analytics.page({ url: window.location.hash })
  }, [])

  return (
    <MuiThemeProvider theme={theme}>
      <PageTitle />
      <TopBarOnly />
      <div style={{ position: "relative", width: "100%" }}>
        <Background contrastMode={isContrastMode} />

        <Grid container spacing={8} style={{ width: "100%", margin: 0 }}>
          <Grid item xs={12} style={{ paddingBottom: 0 }}>
            <PrimaryButton label="Back" icon={ArrowBack} onClick={() => history.goBack()} />
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0}>
              <Grid container spacing={8} style={{ width: "100%", margin: 0 }}>
                <Grid item xs={12} className={classes.typography}>
                  <section>
                    <h1>Accessibility statement for app.myhelm.org</h1>

                    <p>This accessibility statement applies to content published on app.myhelm.org</p>
                  </section>

                  <section>
                    <p>
                      This website is run by Leeds City Council and the NHS. We want as many people as possible to be
                      able to use this website. For example, that means you should be able to:
                    </p>

                    <ul>
                      <li>change colours, contrast levels and fonts</li>
                      <li>zoom in up to 300% without the text spilling off the screen</li>
                      <li>navigate most of the website using just a keyboard</li>
                      <li>navigate most of the website using speech recognition software</li>
                      <li>
                        listen to most of the website using a screen reader (including the most recent versions of JAWS,
                        NVDA and VoiceOver)
                      </li>
                    </ul>

                    <p>We’ve also made the website text as simple as possible to understand.</p>

                    <p>
                      <a href="https://mcmw.abilitynet.org.uk/" rel="noopener noreferrer" target="_blank">
                        AbilityNet
                      </a>{" "}
                      has advice on making your device easier to use if you have a disability.
                    </p>
                  </section>

                  <section>
                    <h2>How accessible this website is</h2>

                    <p>We know some parts of this website are not fully accessible:</p>

                    <ul>
                      <li>
                        The blue branding used across the site will be difficult for some visually impaired users to
                        see.
                      </li>
                      <li>Users are unable to navigate the site with only a keyboard</li>
                      <li>Focus styling is not prominent enough</li>
                      <li>Screen reader users won’t be prompted by content changes on some pages</li>
                    </ul>
                  </section>

                  <section>
                    <h2>Feedback and contact information</h2>

                    <p>
                      If you need information on this website in a different format email{" "}
                      <a href="mailto:info@myhelm.org">info@myhelm.org</a> and tell us:
                    </p>

                    <ul>
                      <li>The web address (URL) of the content</li>
                      <li>Your name and email address</li>
                      <li>The format you need, for example, audio CD, braille, BSL or large print, accessible PDF</li>
                    </ul>
                  </section>

                  <section>
                    <h2>Reporting accessibility problems with this website</h2>

                    <p>
                      If you find any problems that are not listed on this page or you think we’re not meeting the
                      accessibility requirements, email <a href="mailto:info@myhelm.org">info@myhelm.org</a>
                    </p>
                  </section>

                  <section>
                    <h2>Enforcement procedure</h2>

                    <p>
                      The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector
                      Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the
                      ‘accessibility regulations’). If you’re not happy with how we respond to your complaint,{" "}
                      <a href="https://www.equalityadvisoryservice.com/" rel="noopener noreferrer" target="_blank">
                        contact the Equality Advisory and Support Service (EASS)
                      </a>
                      .
                    </p>
                  </section>

                  <section>
                    <h2>Technical information about this website’s accessibility</h2>

                    <p>
                      Leeds City Council and the NHS are committed to making its website accessible, in accordance with
                      the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations
                      2018.
                    </p>
                  </section>

                  <section>
                    <h2>Compliance Status</h2>

                    <p>
                      This website is partially compliant with the{" "}
                      <a href="https://www.w3.org/TR/WCAG21/" rel="noopener noreferrer" target="_blank">
                        Web Content Accessibility Guidelines version 2.1
                      </a>{" "}
                      AA standard, due to the non-compliances listed below.
                    </p>
                  </section>

                  <section>
                    <h2>Non-accessible content</h2>

                    <p>The content listed below is non-accessible for the following reasons.</p>
                  </section>

                  <section>
                    <h2>Non-compliance with the accessibility regulations</h2>

                    <h3>Insufficient contrast ratio</h3>

                    <p>
                      Blue branding used for text and the border colour across the site don’t meet contrast ratio
                      requirements. This fails WCAG 2.1 success criterion 1.4.3 Contrast (minimum) and 1.4.11 Non-text
                      contrast.
                    </p>

                    <h3>All parts of website should be keyboard accessible</h3>

                    <p>
                      The main menu on the website is inaccessible to keyboard only users. This fails WCAG 2.1 criteria
                      2.1.1 Keyboard.
                    </p>

                    <h3>Pages are not titled correctly</h3>

                    <p>
                      When users navigate to different pages the titles are not updated and could confuse users of
                      assistive technology. This fails WCAG 2.1 criteria 2.4.2 Page titled.
                    </p>

                    <h3>Focus styling should be visible</h3>

                    <p>
                      The focus styling used across the site is not visible and does not meet contrast requirements.
                      This fails WCAG 2.1 criteria 2.4.7 Focus visible.
                    </p>

                    <h3>Focus order</h3>

                    <p>
                      On the homepage there are panels that function as links but are not marked up as such so will be
                      skipped in the focus order of the page. This fails WCAG 2.1 criteria 2.4.3 Focus order.
                    </p>

                    <h3>Dynamically changing content should be announced</h3>

                    <p>
                      Content across the site that is dynamically changed and modal boxes are not announced to screen
                      reader users. This fails WCAG 2.1 criteria 4.1.3 Status messages.
                    </p>

                    <h3>Descriptive headings and labels</h3>

                    <p>
                      Labels used in forms are not descriptive enough and don’t provide enough context to the
                      requirement. This fails WCAG 2.1 criteria 2.4.6 Headings and labels.
                    </p>

                    <h3>Responsive content</h3>

                    <p>
                      When viewing tables on the history page the content does not reflow and remains hidden on smaller
                      devices. This fails WCAG 2.1 criteria 1.4.10 Reflow.
                    </p>

                    <h3>Links should make sense when read out of context</h3>

                    <p>
                      Pagination links used across the site when read out of context don’t make sense. This fails WCAG
                      2.1 criteria 2.4.4 Link purpose.
                    </p>

                    <h3>Accessible iframes</h3>

                    <p>
                      Iframes across the site have no title attribute so the content they contain will not be announced
                      to screen reader users. This fails WCAG 2.1 criteria 4.1.2 Name, Role, Value.
                    </p>
                  </section>

                  <section>
                    <h2>What we’re doing to improve accessibility</h2>

                    <p>
                      We are working hard on the following items and plan for them to be in place by January 2021 to
                      ensure that Helm is fully compliant with WCAG 2.1 AA standard:
                    </p>

                    <ul>
                      <li>To be able to navigate most of the website using just a keyboard</li>
                      <li>Increase the focus of the highlighted item on the webpage while navigating</li>
                      <li>To be able to navigate the website using speech recognition software</li>
                      <li>To increase the contrast ratio of all text within the website to a minimum of 4.5:1</li>
                      <li>Ensure that the title of the webpage changes when each area of the website is accessed</li>
                      <li>Add context to the label descriptions within all forms</li>
                      <li>Ensure all forms are easy to read when viewing the website by a mobile device</li>
                      <li>Add descriptive title attributes to all iframes on the website</li>
                      <li>Ensure all input field borders meet the requirement of 3:1</li>
                      <li>Add ID attribute to input fields on forms and for attribute to the label fields</li>
                      <li>
                        Add attributes to the website to announce to those accessing app.myhelm.org using a screen
                        reader when a change is made e.g. completion of searches
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2>Disproportionate burden</h2>

                    <p>Not applicable.</p>
                  </section>

                  <section>
                    <h2>Content that’s not within the scope of the accessibility regulations</h2>

                    <p>Not applicable.</p>
                  </section>

                  <section>
                    <h2>Preparation of this accessibility statement</h2>

                    <p>This statement was prepared on 07/12/2020. It was last reviewed on 07/12/2020.</p>

                    <p>This website was last tested on 11/11/2020. The test was carried out by Leeds City Council.</p>

                    <p>
                      We tested a selection of pages, ensuring those tested reflected the variety of different page
                      layouts used on our website.
                    </p>

                    <p>The pages we tested were:</p>

                    <ul>
                      <li>Homepage</li>
                      <li>Top three things</li>
                      <li>Top three things – history</li>
                      <li>NHS resources</li>
                      <li>Leeds information</li>
                      <li>NHS Login</li>
                      <li>Helm modal</li>
                    </ul>
                  </section>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </MuiThemeProvider>
  )
}

const mapStateToProps = (state) => {
  const preferences = get(state, "custom.preferences", {})

  const userPrefs = (preferences && preferences.data && preferences.data.preferences) || {}

  const contrastMode = get(userPrefs, "general.preferences.contrastMode", false)

  return {
    theme: getCurrentTheme(contrastMode),
    isContrastMode: contrastMode,
  }
}

export default connect(mapStateToProps, null)(withRouter(withStyles(mainStyles)(AccessibilityPage)))
