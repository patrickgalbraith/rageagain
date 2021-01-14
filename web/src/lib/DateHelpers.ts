export const getOrdinalNum = (number: number) => {
  let selector

  if (number <= 0) {
    selector = 4
  } else if ((number > 3 && number < 21) || number % 10 > 3) {
    selector = 0
  } else {
    selector = number % 10
  }

  return number + ['th', 'st', 'nd', 'rd', ''][selector]
}

export const getDayOfWeek = (date: Date) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return weekDays[date.getDay()]
}

export const getDayAndMonth = (date: Date) => {
  const day = getOrdinalNum(date.getDate())
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August", "September",
    "October", "November", "December"
  ]

  return `${day} ${monthNames[date.getMonth()]}`
}