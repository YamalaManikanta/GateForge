window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  const processVars = process as any;

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, processVars.versions[type])
  }
})
