import { stripParens, parseTrackString } from "../../lib/StringParsers"

describe('stripParens', () => {
  it('correctly strips outer parens', () => {
    expect(stripParens('(TEST)')).toBe('TEST')
    expect(stripParens('  (TEST)  ')).toBe('TEST')
    expect(stripParens('(Test String)')).toBe('Test String')
    expect(stripParens('(TE(ST) String)')).toBe('TE(ST) String')
  })
})

describe('parseTrackString', () => {
  it('correctly parses track strings', () => {
    const tests: [string, any][] = [
      ['',
        { artist: '', song: '', label: ''}],

      ['  PRINCE Nothing Compares 2 U (Warner)  ',
        { artist: 'PRINCE', song: 'Nothing Compares 2 U', label: 'Warner'}],

      ['THE INTERNET Roll (Burbank Funk) (Odd Future)',
        { artist: 'THE INTERNET', song: 'Roll (Burbank Funk)', label: 'Odd Future'}],

      ['FATHER JOHN MISTY Mr. Tillman (Sub Pop)',
        { artist: 'FATHER JOHN MISTY', song: 'Mr. Tillman', label: 'Sub Pop'}],

      ['CRUMB Locket ()',
        { artist: 'CRUMB', song: 'Locket', label: ''}],

      ['RAE SREMMURD ft. TRAVIS SCOTT Close (Universal)',
        { artist: 'RAE SREMMURD ft. TRAVIS SCOTT', song: 'Close', label: 'Universal'}],

      ['BILLIE EILISH ft. KHALID Lovely (Universal)',
        { artist: 'BILLIE EILISH ft. KHALID', song: 'Lovely', label: 'Universal'}],

      ['FLORENCE and THE MACHINE Sky Full Of Song (Universal)',
        { artist: 'FLORENCE and THE MACHINE', song: 'Sky Full Of Song', label: 'Universal'}],

      ['DUKE DUMONT _and_ EBENEZER Inhale (Etc Etc)',
        { artist: 'DUKE DUMONT _and_ EBENEZER', song: 'Inhale', label: 'Etc Etc'}],

      ['J COLE ATM (Universal)',
        { artist: 'J COLE', song: 'ATM', label: 'Universal'}],

      ['360 Drugs (EMI)',
        { artist: '360', song: 'Drugs', label: 'EMI'}],

      ['SNAKEHIPS ft. ST RULEZ Cruzin\' (Stay Home Tapes - Act 1) (Universal)',
        { artist: 'SNAKEHIPS ft. ST RULEZ', song: 'Cruzin\' (Stay Home Tapes - Act 1)', label: 'Universal'}],

      ['OKENYO 20 / 20 (Elefant Traks)',
        { artist: 'OKENYO', song: '20 / 20', label: 'Elefant Traks'}],

      ['ANDREW W.K. Music Is Worth Living For (Universal)',
        { artist: 'ANDREW W.K.', song: 'Music Is Worth Living For', label: 'Universal'}],
    ]

    for (let test of tests) {
      expect(parseTrackString(test[0])).toEqual(test[1])
    }
  })
})