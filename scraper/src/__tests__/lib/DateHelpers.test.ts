import { dateFormat, militaryTime } from "../../lib/DateHelpers"

describe('dateFormat', () => {
  it('correctly formats date', () => {
    expect(dateFormat(new Date(2020, 0, 1))).toBe('2020-01-01')
    expect(dateFormat(new Date(2020, 11, 15))).toBe('2020-12-15')
  })
})

describe('militaryTime', () => {
  it('correctly formats time', () => {
    expect(militaryTime('2:30 pm')).toBe('14:30:00')
    expect(militaryTime('2:30 PM')).toBe('14:30:00')
    expect(militaryTime('2:30PM')).toBe('14:30:00')
    expect(militaryTime('12:00 am')).toBe('00:00:00')
    expect(militaryTime('12:00 pm')).toBe('12:00:00')
    expect(militaryTime('1:00 am')).toBe('01:00:00')
  })
})