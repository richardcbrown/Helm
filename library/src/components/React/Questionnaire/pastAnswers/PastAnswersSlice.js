import { createSlice } from '@reduxjs/toolkit';

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
    pageNo: 0
  },
  reducers: {
    updatePreviousAnswers: (state, action) => {
      const previousAnswers = []
      const pastAnswersArray = (action.payload)
      pastAnswersArray.map((pastAnswerObject, index) => {
        console.log("pastAnswerObject: ", pastAnswerObject)
        const pushObj = {
          answers: pastAnswerObject.item,
          dateTime: pastAnswerObject.authored,
          id: pastAnswerObject.id
        }
        // var count = 0;
        // state.previousAnswers.map((obj) => {
        //   obj.id === pastAnswerObject.id ? count += 1 : null
        // })
        // count === 0 ? previousAnswers.push(pushObj) : null
        previousAnswers.push(pushObj)

      })
      previousAnswers.length !== state.previousAnswers.length ? state.previousAnswers = previousAnswers : null
    },
    nextPage: (state) => {
      state.pageNo += 1;
    },
    prevPage: (state) => {
      state.pageNo -= 1;
    },
  }
})

export const selectPreviousAnswers = (state) => state.pastAnswers.previousAnswers;
export const selectMaxPrevAnswers = (state) => state.pastAnswers.maxPrevAnswers;
export const selectPageNo = (state) => state.pastAnswers.pageNo;

export const { updatePreviousAnswers, nextPage, prevPage } = pastAnswersSlice.actions;

export default pastAnswersSlice.reducer;