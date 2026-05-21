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
    case 'SET_COLOR':
      return {colorIndex: action.colorIndex}
    default:
      return state
  }
}

let colorIndex = parseInt(localStorage.getItem("smallClockColorIndex") || 0)

// Migration from old 6-state cycle (color+format combined → separated)
if (colorIndex >= 3 && !localStorage.getItem("smallClockHour12")) {
  colorIndex = colorIndex - 3
  localStorage.setItem("smallClockColorIndex", colorIndex)
  localStorage.setItem("smallClockHour12", "false")
}

const colors = ["white", "grey", "lightgrey", "black"]
const DARK_FIRST_COLOR = 0  // white
const LIGHT_FIRST_COLOR = 3 // black

// Set initial color based on system color scheme (only on first run)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
if (!localStorage.getItem("smallClockColorIndex") && localStorage.getItem("smallClockHour12") === null) {
  colorIndex = prefersDark.matches ? DARK_FIRST_COLOR : LIGHT_FIRST_COLOR
  localStorage.setItem("smallClockColorIndex", colorIndex)
}

// Listen for system color scheme changes
prefersDark.addEventListener('change', (e) => {
  const idx = e.matches ? DARK_FIRST_COLOR : LIGHT_FIRST_COLOR
  localStorage.setItem("smallClockColorIndex", idx)
  store.dispatch({type: 'SET_COLOR', colorIndex: idx})
})

// createStore
const store = createStore(reducer, {colorIndex: colorIndex})

browser.browserAction.onClicked.addListener(() => {
  store.dispatch({type: 'CHANGE'})
})

// === Timezone submenu ===
const TZ_ROOT = "tz-root"

const TZ_MENU = [
  { id: TZ_ROOT, title: "Timezone" },
  // Favorites
  { id: "tz-local", parentId: TZ_ROOT, title: "Local" },
  { id: "tz-Asia/Shanghai", parentId: TZ_ROOT, title: "Beijing" },
  { id: "tz-America/Los_Angeles", parentId: TZ_ROOT, title: "San Jose" },
  // Format
  { id: "tz-format-12h", parentId: TZ_ROOT, title: "12-hour Format", type: "checkbox" },
  // Americas
  { id: "tz-americas", parentId: TZ_ROOT, title: "Americas" },
  { id: "tz-America/New_York", parentId: "tz-americas", title: "New York" },
  { id: "tz-America/Toronto", parentId: "tz-americas", title: "Toronto" },
  { id: "tz-America/Chicago", parentId: "tz-americas", title: "Chicago" },
  { id: "tz-America/Denver", parentId: "tz-americas", title: "Denver" },
  { id: "tz-America/Anchorage", parentId: "tz-americas", title: "Anchorage" },
  { id: "tz-America/Mexico_City", parentId: "tz-americas", title: "Mexico City" },
  { id: "tz-America/Sao_Paulo", parentId: "tz-americas", title: "São Paulo" },
  { id: "tz-America/Buenos_Aires", parentId: "tz-americas", title: "Buenos Aires" },
  { id: "tz-America/Lima", parentId: "tz-americas", title: "Lima" },
  // Europe
  { id: "tz-europe", parentId: TZ_ROOT, title: "Europe" },
  { id: "tz-Europe/London", parentId: "tz-europe", title: "London" },
  { id: "tz-Europe/Paris", parentId: "tz-europe", title: "Paris" },
  { id: "tz-Europe/Berlin", parentId: "tz-europe", title: "Berlin" },
  { id: "tz-Europe/Athens", parentId: "tz-europe", title: "Athens" },
  { id: "tz-Europe/Istanbul", parentId: "tz-europe", title: "Istanbul" },
  { id: "tz-Europe/Moscow", parentId: "tz-europe", title: "Moscow" },
  // Africa
  { id: "tz-africa", parentId: TZ_ROOT, title: "Africa" },
  { id: "tz-Africa/Lagos", parentId: "tz-africa", title: "Lagos" },
  { id: "tz-Africa/Cairo", parentId: "tz-africa", title: "Cairo" },
  { id: "tz-Africa/Nairobi", parentId: "tz-africa", title: "Nairobi" },
  // Asia
  { id: "tz-asia", parentId: TZ_ROOT, title: "Asia" },
  { id: "tz-Asia/Tokyo", parentId: "tz-asia", title: "Tokyo" },
  { id: "tz-Asia/Seoul", parentId: "tz-asia", title: "Seoul" },
  { id: "tz-Asia/Dubai", parentId: "tz-asia", title: "Dubai" },
  { id: "tz-Asia/Kolkata", parentId: "tz-asia", title: "Kolkata" },
  // Pacific
  { id: "tz-pacific", parentId: TZ_ROOT, title: "Pacific" },
  { id: "tz-Australia/Sydney", parentId: "tz-pacific", title: "Sydney" },
  { id: "tz-Pacific/Auckland", parentId: "tz-pacific", title: "Auckland" },
  { id: "tz-Pacific/Fiji", parentId: "tz-pacific", title: "Fiji" },
  { id: "tz-Pacific/Honolulu", parentId: "tz-pacific", title: "Honolulu" },
]

// Create context menu structure
browser.menus.removeAll().then(() => {
  for (const item of TZ_MENU) {
    const props = {
      id: item.id,
      parentId: item.parentId,
      title: item.title,
      contexts: ["browser_action"],
    }
    if (item.type === "checkbox") {
      props.type = "checkbox"
      props.checked = localStorage.getItem("smallClockHour12") !== "false"
    }
    browser.menus.create(props)
  }
})

// Handle menu clicks
browser.menus.onClicked.addListener((info) => {
  if (typeof info.menuItemId !== 'string' || !info.menuItemId.startsWith("tz-") || info.menuItemId === TZ_ROOT) return

  if (info.menuItemId === "tz-format-12h") {
    localStorage.setItem("smallClockHour12", info.checked)
    clearTimeout(renderTimer)
    render()
    return
  }

  const tz = info.menuItemId === "tz-local" ? "" : info.menuItemId.slice(3)
  localStorage.setItem("smallClockTimezone", tz)
  clearTimeout(renderTimer)
  render()
})

// sets the icon and title
let renderTimer = null

const render = () => {
  clearTimeout(renderTimer)

  const colorIndex = store.getState().colorIndex
  const color = colors[colorIndex]
  const hour12 = localStorage.getItem("smallClockHour12") !== "false"

  const date = new Date()
  let tz = localStorage.getItem("smallClockTimezone")
  if (tz) {
    try { date.toLocaleString('en-US', { timeZone: tz }) } catch (e) { tz = null }
  }
  const dateString = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
    ...(tz && { timeZone: tz }),
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
  browser.browserAction.setIcon({imageData: imageData})
  const titleTz = tz || undefined
  browser.browserAction.setTitle({title: date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...(titleTz && { timeZone: titleTz }),
  })})

  renderTimer = setTimeout(render, (60 - date.getSeconds()) * 1000)
  localStorage.setItem("smallClockColorIndex", colorIndex)
}

render()
store.subscribe(render)
