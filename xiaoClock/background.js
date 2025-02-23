/**
 * background.js
 * 
 * This file contains the background script for the Xiao Clock Firefox extension.
 * It manages the state of the extension using a Redux-like pattern, handles user interactions,
 * and updates the browser action icon and title based on the current time and user preferences.
 * 
 * Features:
 * - Detects system color scheme preference (light/dark mode).
 * - Allows users to toggle clock colors and remembers the selection.
 * - Supports 12-hour and 24-hour time formats, which can be toggled via a context menu.
 * - Updates the browser action icon to display the current time.
 * - Persists user preferences (color and hour format) using localStorage.
 */

// redux-like createStore to manage state
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

const colors = ["white", "lightgrey", "grey", "black"]

// Detect system color scheme preference
const getSystemColorScheme = () => {
  // return 'light' // for testing
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Set initial color index based on system color scheme
const initialColorIndex = parseInt(localStorage.getItem("smallClockColorIndex") || (getSystemColorScheme() === 'dark' ? 0 : 3))
const initialHourFormat = localStorage.getItem("smallClockHourFormat") === '24' ? false : true

// reducer
const reducer = (state, action) => {
  switch(action.type) {
    case 'CHANGE_COLOR':
      console.log('Current color index:', state.colorIndex)
      return { ...state, colorIndex: (state.colorIndex + 1) % colors.length }
    case 'TOGGLE_HOUR_FORMAT':
      console.log('Current hour format:', state.hour12)
      return { ...state, hour12: !state.hour12 }
    default:
      return state
  }
}

// createStore
const store = createStore(reducer, { colorIndex: initialColorIndex, hour12: initialHourFormat })

browser.browserAction.onClicked.addListener(() => {
  store.dispatch({ type: 'CHANGE_COLOR' })
})

// sets the icon and title
const render = () => {
  const { colorIndex, hour12 } = store.getState()
  const systemColorScheme = getSystemColorScheme()
  const color = colors[colorIndex]

  const date = new Date()
  const dateString = date.toLocaleString(
    'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12
    })
  console.log(dateString)
  const hr = dateString.slice(0, 2)
  const mn = dateString.slice(3, 5)
  const ampm = dateString.slice(6, 7)

  // generates the image that contains current time
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  context.fillStyle = color
  context.font = "bold 72px Verdana"
  context.fillText(hr, 8, 64)
  context.font = "bold 72px Verdana"
  context.fillText(mn, 8, 128)
  context.font = "bold 36px Verdana"
  context.fillText(ampm, 100, 128)
  const imageData = context.getImageData(0, 0, 128, 128)
  browser.browserAction.setIcon({ imageData: imageData })
  browser.browserAction.setTitle({ title: date.toISOString().slice(0, 10) })

  setTimeout(render, (60 - date.getSeconds()) * 1000)
  localStorage.setItem("smallClockColorIndex", colorIndex)
  localStorage.setItem("smallClockHourFormat", hour12 ? '12' : '24')
}

render()
store.subscribe(render)

// Create context menu
browser.contextMenus.create({
  id: "toggleHourFormat",
  title: "12/24 Hour Format",
  contexts: ["browser_action"]
})

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleHourFormat") {
    store.dispatch({ type: 'TOGGLE_HOUR_FORMAT' })
  }
})
