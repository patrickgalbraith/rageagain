import { expect } from 'chai'
import { handleRequest } from '../src/handler'

describe('handler responds to request', () => {
  it('OPTIONS Request', async () => {
    const result = await handleRequest(new Request('/', { method: 'OPTIONS' }))
    expect(result.status).to.eq(200)
  })

  it('Not Found Request', async () => {
    const result = await handleRequest(new Request('/unknown/', { method: 'GET' }))
    expect(result.status).to.eq(404)
  })

  it('Invalid DELETE Request', async () => {
    const result = await handleRequest(new Request('/', { method: 'DELETE' }))
    expect(result.status).to.eq(405)
  })
})