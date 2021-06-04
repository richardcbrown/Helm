import { createSlice } from "@reduxjs/toolkit"

const pastAnswersSlice = createSlice({
    name: "pastAnswers",
    initialState: {
        /**
     * {
answers: [
  {
    linkId: 'item1',
    text: 'What Matters to Me?',
    answer: [
      {
        valueString: ''
      }
    ]
  },
  {
    linkId: 'item2',
    text: 'Who are the most important people in my life?',
    answer: [
      {
        valueString: '1'
      }
    ]
  },
  {
    linkId: 'item3',
    text: 'What do I do to keep myself well?',
    answer: [
      {
        valueString: '2'
      }
    ]
  },
  {
    linkId: 'item4',
    text: 'Things to think about in the future',
    answer: [
      {
        valueString: '3'
      }
    ]
  }
],
dateTime: '2021-05-20T09:59:34.053Z',
id: '2da09971-38d2-41bd-a4e0-28f67604cfc9'
}
     */
        previousAnswers: [],
        maxPrevAnswers: 2,
        pageNo: 0,
        groupedPrevAnswers: [],
    },
    reducers: {
        updatePreviousAnswers: (state, action) => {
            const previousAnswers = []
            const pastAnswersArray = action.payload.pastAnswersArray
            pastAnswersArray.map((pastAnswerObject, index) => {
                if (pastAnswerObject.questionnaire.reference === "Questionnaire/" + action.payload.id) {
                    const pushObj = {
                        answers: pastAnswerObject.item,
                        dateTime: pastAnswerObject.authored,
                        id: pastAnswerObject.id,
                    }
                    previousAnswers.push(pushObj)
                }
            })

            const groupedPrevAnswers = new Array(4)
            for (var i = 0; i < 4; i++) {
                const indexArray = []
                previousAnswers.map((prevAnswer) => {
                    prevAnswer.answers.map((answer, index) => {
                        const obj = index == i ? indexArray.push(answer.answer[0]) : null
                    })
                })
                groupedPrevAnswers[i] = indexArray
            }
            if (previousAnswers.length !== state.previousAnswers.length) {
                state.previousAnswers = previousAnswers
                state.groupedPrevAnswers = groupedPrevAnswers
            }
        },
        nextPage: (state) => {
            state.pageNo += 1
        },
        prevPage: (state) => {
            state.pageNo -= 1
        },
        resetPageNo: (state) => {
            state.pageNo = 0
        },
    },
})

export const selectPreviousAnswers = (state) => state.pastAnswers.previousAnswers
export const selectMaxPrevAnswers = (state) => state.pastAnswers.maxPrevAnswers
export const selectPageNo = (state) => state.pastAnswers.pageNo
export const selectGroupedPrevAnswers = (state) => state.pastAnswers.groupedPrevAnswers

export const { updatePreviousAnswers, nextPage, prevPage, resetPageNo } = pastAnswersSlice.actions

export default pastAnswersSlice.reducer
