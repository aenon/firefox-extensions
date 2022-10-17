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
  return { getState, dispatch, subscribe }
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

const colorIndex = parseInt(localStorage.getItem("smallClockColorIndex") || 0)

// createStore
const store = createStore(reducer, {colorIndex: colorIndex})

browser.browserAction.onClicked.addListener(() => {
  store.dispatch({type: 'CHANGE'})
})

const colorArray = ["white", "grey", "black"]
const colors = colorArray.concat(colorArray)
const hours = Array(colorArray.length).fill(true).concat(Array(colorArray.length).fill(false))

// sets the icon and title
const render = () => {
  const colorIndex = store.getState().colorIndex
  const color = colors[colorIndex]
  const hour12 = hours[colorIndex]
  // console.log("Current colorIndex is " + colorIndex)

  const date = new Date()
  const dateString = date.toLocaleString(
    'en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12
    })
  // console.log(dateString)
  const hr = dateString.slice(0, 2)
  const mn = dateString.slice(3, 5)
  const ampm = dateString.slice(6, 7)

  // generates the image that contains current time
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  context.fillStyle = color
  context.font = "bold 78px Verdana"
  context.fillText(hr, 8, 64)
  context.font = "bold 78px Verdana"
  context.fillText(mn, 8, 128)
  context.font = "bold 36px Verdana"
  context.fillText(ampm, 100, 128)
  const imageData = context.getImageData(0, 0, 128, 128)
  browser.browserAction.setIcon({imageData: imageData})
  browser.browserAction.setTitle({title: date.toISOString().slice(0,10)})

  setTimeout(render, (60 - date.getSeconds()) * 1000)
  localStorage.setItem("smallClockColorIndex", colorIndex)
}

render()
store.subscribe(render)

