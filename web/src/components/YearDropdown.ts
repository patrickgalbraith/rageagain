export default function render() {
  const $el = $(document.createDocumentFragment())

  const startYear = 1999
  const endYear = (new Date()).getFullYear()

  for (let year = startYear; year <= endYear; year++) {
    $el.append(`<li><a class="skip-to-year" data-year="${year}" href="javascript:void(0)">${year}</a></li>`)
  }

  return $el
}