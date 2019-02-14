import { configureStore } from 'redux-starter-kit'
import dataReducer from './reducers/dataReducer'

const store = configureStore({
  reducer: {
      data: dataReducer,
  }
})

export default store

