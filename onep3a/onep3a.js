/* Example of an 1point3acres.com bbs jammer:
 * <font class="jammer">. Warald asuvpozijcasdf </font>
 */
jammerClassName = 'jammer'

// advertisements
atClassName = 'a_t'

const clearElement = elementClassName => {
  elements = document.getElementsByClassName(elementClassName)
  for (let element of elements) {
    element.style.display = "none"
  }
}

try {
  clearElement(jammerClassName)
} catch(error) {}

try {
  clearElement(atClassName)
} catch(error) {}
