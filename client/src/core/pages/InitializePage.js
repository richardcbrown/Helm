import React, { Component, useEffect, useRef } from "react"

import { connect } from "react-redux"
import { withStyles } from "@material-ui/core/styles"
import { getToken } from "../token"
import { checkTermsAction } from "../../version/actions/checkTermsAction"
import { initializeAction } from "../actions/initializeAction"
import GeneralDialog from "../../version/common/Dialogs/GeneralDialog"
import ConfirmButton from "../../version/common/Buttons/ConfirmButton"
import slides from "./slides.json"
import ReactMarkdown from "react-markdown"
import { render } from "react-dom"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Slider from "react-slick"
import queryString from "query-string"

const styles = (theme) => {
  return {
    "@global": {
      "@keyframes rings": {
        "0%": {
          WebkitTransform: "rotate(0)",
          transform: "rotate(0)",
        },
        "100%": {
          WebkitTransform: "rotate(360deg)",
          transform: "rotate(360deg)",
        },
      },
      "@keyframes rings_reverse": {
        "0%": {
          WebkitTransform: "rotate(0)",
          transform: "rotate(0)",
        },
        "100%": {
          WebkitTransform: "rotate(-360deg)",
          transform: "rotate(-360deg)",
        },
      },
    },
    mainSpinner: {
      "& h1": {
        fontFamily: "HK Grotesk SemiBold",
      },
      display: "block",
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: 0,
      [theme.breakpoints.up("sm")]: {
        paddingTop: 100,
      },
      backgroundColor: "#fff",
      transition: "opacity 1s ease, visibility 1s ease, background 1s ease",
    },
    slidesAndRings: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      textAlign: "center",
    },
    tips: {
      paddingTop: 120,
      overflow: "hidden",
      width: 280,
      margin: "0 auto",
      textAlign: "center",
      fontFamily: "HK Grotesk Regular",
      "& h2": {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 24,
      },
      "& h3": {
        marginTop: 10,
        fontSize: 18,
      },
    },

    slideWrapper: {
      width: 2800,
      WebkitAnimation: "slide 100.9s ease-out infinite",
      animation: "slide 100.9s ease-out infinite",
    },
    slide: {
      float: "left",
      width: 280,
    },
    slideNumber: {
      color: "#000",
      textAlign: "center",
      fontSize: 14,
    },

    rings: {
      position: "relative",
      paddingTop: 20,
      paddingBottom: 20,
      "& div": {
        position: "absolute",
        top: 0,
        width: 120,
        height: 120,
        left: -60,
        borderRadius: "50%",
        border: "10px solid #000",
        borderColor: "#3596f4 transparent #3596f4 transparent",
        WebkitAnimation: "rings 1s linear infinite",
        animation: `rings 1s linear infinite`,
      },
      "& div:nth-child(2)": {
        width: 96,
        height: 96,
        top: 12,
        left: -48,
        borderColor: "transparent #cacaca transparent #cacaca",
        WebkitAnimation: "rings_reverse 1s linear infinite",
        animation: "rings_reverse 1s linear infinite",
      },
    },
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const SlideDetails = ({ details }) => {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) {
      return
    }

    render(<ReactMarkdown children={details} />, ref.current)
  }, [ref.current])

  return <div ref={ref}></div>
}

class InitializePage extends Component {
  componentDidMount() {
    const { status } = this.props

    const hashquery = window.location.hash.split("?")[1]

    const token = getToken()

    const { code, state } = hashquery ? queryString.parse(hashquery) : {}

    if (code) {
      this.getToken(code, state)
    } else if (!token || status !== "found") {
      this.props.initializeAction()
      this.interval = window.setInterval(() => this.props.initializeAction(), 5000)
    } else {
      this.props.checkTermsAction()
    }
  }

  componentDidUpdate() {
    const token = getToken()

    const { status, error } = this.props

    if (error) {
      clearInterval(this.interval)
      return
    }

    if (token && status === "found") {
      clearInterval(this.interval)
      this.props.checkTermsAction()
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.interval)
  }

  render() {
    let { error } = this.props
    const { classes, status } = this.props
    const { closeDialog } = this

    if (status === "notfound") {
      error = {
        title: "Record not found",
        message:
          "<span>There is an issue with setting up your Helm account, please try again or contact <a href='mailto:info@myhelm.org?subject=Helm Account Setup Issue'>info@myhelm.org</a> with your name and we will be happy to help.</span>",
      }
    }

    if (error) {
      clearInterval(this.interval)
    }

    const settings = {
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      swipe: false,
      dots: false,
    }

    shuffleArray(slides)

    return (
      <div className={classes.mainSpinner}>
        {error ? (
          <GeneralDialog
            open={true}
            onClose={closeDialog}
            title={error.title}
            message={error.message}
            options={[<ConfirmButton label="Ok" onClick={() => this.closeDialog()} />]}
          />
        ) : (
          <>
            <h1 style={{ textAlign: "center" }}>{this.getStatus()}</h1>
            <div className={classes.slidesAndRings}>
              <div className={classes.rings}>
                <div></div>
                <div></div>
              </div>
              <div className={classes.tips}>
                <Slider {...settings}>
                  {slides.map((slide) => {
                    return <SlideDetails details={slide.details} />
                  })}
                </Slider>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  getStatus() {
    const { status } = this.props

    switch (status) {
      case "received": {
        return "Helm has received your details from NHS login..."
      }
      case "registered": {
        return "Your Helm account is in the process of being set up."
      }
      case "searching": {
        return "Helm is searching for your information."
      }
      case "found": {
        return "Your Helm account is ready."
      }
      default: {
        return "Loading..."
      }
    }
  }

  closeDialog() {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("username")
    localStorage.removeItem("role")

    window.location.href = "http://myhelm.org"
  }

  async getToken(code, state) {
    const query = { code }

    if (state) {
      query.state = state
    }

    const result = await fetch(`/api/auth/return?${queryString.stringify(query)}`)

    if (!result.ok) {
      return
    }

    const tokenResult = await result.json()

    localStorage.setItem("token", tokenResult.token)

    window.location.href = "/#/login"

    window.location.reload()
  }
}

const mapStateToProps = (state) => {
  const { terms, initialize } = state.custom

  return {
    error: terms.error,
    status: (initialize && initialize.data && initialize.data.status) || null,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    checkTermsAction() {
      dispatch(checkTermsAction.request())
    },
    initializeAction() {
      dispatch(initializeAction.request())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(InitializePage))
