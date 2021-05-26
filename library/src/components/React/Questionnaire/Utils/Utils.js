export const obtainFormattedDate = (item) => {
    let takenDate = new Date(item.dateTime)
    return takenDate.toDateString();
}

export const getDate = (pastDate) => {
    const dateNow = new Date()
    const oldDate = new Date(pastDate)
    const timeElapsed = Math.floor(((oldDate - dateNow) / 1000) / 60) //minutes
    var date = "";
    oldDate && timeElapsed < 60 ?
        date = `about ${timeElapsed} minutes ago` :
        date = oldDate.toDateString()
    return date
}