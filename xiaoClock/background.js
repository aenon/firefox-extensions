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
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Set initial color index based on system color scheme
let systemColorScheme = getSystemColorScheme()
const initialColorIndex = parseInt(localStorage.getItem(`smallClockColorIndex-${systemColorScheme}`) || (systemColorScheme === 'dark' ? 0 : 3))
const initialHourFormat = localStorage.getItem("smallClockHourFormat") === '24' ? false : true

// reducer
const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'CHANGE_COLOR':
      console.log('Current color index:', state.colorIndex)
      newState = { ...state, colorIndex: (state.colorIndex + 1) % colors.length }
      localStorage.setItem(`smallClockColorIndex-${systemColorScheme}`, newState.colorIndex)
      return newState
    case 'TOGGLE_HOUR_FORMAT':
      console.log('Current hour format:', state.hour12)
      newState = { ...state, hour12: !state.hour12 }
      localStorage.setItem("smallClockHourFormat", newState.hour12 ? '12' : '24')
      return newState
    case 'SYSTEM_COLOR_SCHEME_CHANGE':
      console.log('System color scheme changed:', action.colorScheme)
      newState = { ...state, colorIndex: parseInt(localStorage.getItem(`smallClockColorIndex-${action.colorScheme}`) || (action.colorScheme === 'dark' ? 0 : 3)) }
      return newState
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
}

render()
store.subscribe(render)

// Listen for system color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  systemColorScheme = e.matches ? 'dark' : 'light'
  store.dispatch({ type: 'SYSTEM_COLOR_SCHEME_CHANGE', colorScheme: systemColorScheme })
})

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
