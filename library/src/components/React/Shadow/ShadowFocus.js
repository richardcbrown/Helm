import { useState, useRef, useEffect } from "react"

export const ShadowFocus = ({ children }) => {
    const [focus, setFocus] = useState(false)
    const inputRef = useRef()

    useEffect(() => {
        if (!inputRef.current) {
            return
        }

        function focusEvent() {
            setFocus(true)
        }

        function blurEvent() {
            setFocus(false)
        }

        inputRef.current.addEventListener("focus", focusEvent)
        inputRef.current.addEventListener("blur", blurEvent)

        return () => {
            inputRef.current.removeEventListener("focus", focusEvent)
            inputRef.current.addEventListener("blur", blurEvent)
        }
    }, [inputRef.current])

    return children({ inputRef, focus })
}