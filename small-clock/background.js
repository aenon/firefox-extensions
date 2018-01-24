// redux-like createStore
const createStore = (reducer, preloadedState={}) => {
  let state = preloadedState
  let listeners = []
  const getState = () => state
  const subscribe = (listener) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }
  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
  }
  dispatch({})
  return { getState, dispatch, subscribe}
}

// reducer
const reducer = (state, action) => {
  switch(action.type) {
    case 'CHANGE':
      return {colorIndex: (state.colorIndex + 1) % colors.length}
    default:
      return state
  }
}

// createStore
const store = createStore(reducer, {colorIndex: 0})

browser.browserAction.onClicked.addListener(() => {
  store.dispatch({type: 'CHANGE'})
})

const colors = ["white", "grey", "black"]
const render = () => {
  const color = colors[store.getState().colorIndex]
  const date = new Date()
  const dateString = date.toLocaleString(
    'en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false})
  const hr = dateString.slice(0, 2)
  const mn = dateString.slice(3, 5)

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  context.fillStyle = color
  context.font = "72px monowidth"
  context.fillText(hr, 8, 64)
  context.font = "72px monowidth"
  context.fillText(mn, 8, 128)

  const imageData = context.getImageData(0, 0, 128, 128)

  browser.browserAction.setIcon({imageData: imageData})
  browser.browserAction.setTitle({title: date.toString()})

  // setTimeout(render, (60-date.getSeconds())*1000)
  setTimeout(render, 1)
}
render()
store.subscribe(render)
