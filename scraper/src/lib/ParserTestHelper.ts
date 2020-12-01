import fs from 'fs'
import path from 'path'

export const testParser = (fileName: string, extractFn: (data: string) => any) => {
  const htmlPath = path.join(__dirname, `../../src/__tests__/fixtures/${fileName}.html`)
  const jsonPath = path.join(__dirname, `../../src/__tests__/fixtures/${fileName}.json`)

  const html = fs.readFileSync(htmlPath, 'utf8')

  const result = extractFn(html)
  // fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  const expected = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

  expect(result).toEqual(expected)
}