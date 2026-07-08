export function scrollElementIntoContainer(
  element: HTMLElement | null,
  container: HTMLElement | null,
  behavior: ScrollBehavior = 'smooth',
) {
  if (!element || !container) return

  const nodeRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const offsetTop = nodeRect.top - containerRect.top + container.scrollTop
  const targetTop = offsetTop - container.clientHeight / 2 + nodeRect.height / 2

  container.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  })
}

export function scrollElementIntoContainerAfterLayout(
  element: HTMLElement | null,
  container: HTMLElement | null,
  behavior: ScrollBehavior = 'smooth',
) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollElementIntoContainer(element, container, behavior)
    })
  })
}
