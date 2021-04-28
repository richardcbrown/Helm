/**
 *
 * @param {fhir.QuestionnaireResponse} questionnaireResponse
 */
export function flattenQuestionnaireResponse(questionnaireResponse) {
  const { authored, item = [] } = questionnaireResponse

  let name1 = ""
  let name2 = ""
  let name3 = ""

  for (let questionnaireItem of item) {
    if (questionnaireItem.linkId === "item1") {
      name1 = getItemAnswer(
        item.find((itm) => itm.linkId === "item1"),
        "title1"
      )
    }

    if (questionnaireItem.linkId === "item2") {
      name2 = getItemAnswer(
        item.find((itm) => itm.linkId === "item2"),
        "title2"
      )
    }

    if (questionnaireItem.linkId === "item3") {
      name3 = getItemAnswer(
        item.find((itm) => itm.linkId === "item3"),
        "title3"
      )
    }
  }

  return {
    name1,
    name2,
    name3,
    date: authored,
  }
}

/**
 * @param {fhir.QuestionnaireResponseItem | undefined} item
 * @param {string} linkId
 */
function getItemAnswer(item, linkId) {
  if (!item) {
    return ""
  }

  const subItem = (item.item || []).find((si) => si.linkId === linkId)

  if (!subItem) {
    return ""
  }

  const { answer } = subItem

  if (!answer || !answer.length) {
    return ""
  }

  return answer[0].valueString || ""
}
