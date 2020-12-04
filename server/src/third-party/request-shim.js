
const defaultOpts = {
  redirect: 'follow',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
  }
}

const request = (url, callback) => {
  fetch(url, {
    ...defaultOpts,
    method: 'GET'
  }).then(response => {
    response.text().then(body => {
      callback(null, { statusCode: response.status }, body)
    })
  }).catch(error => {
    callback(error)
  })
}

request.post = (url, options, callback) => {
  fetch(url, {
    ...defaultOpts,
    method: 'POST',
    headers: {
      ...defaultOpts.headers,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(options.json)
  }).then(response => {
    response.json().then(body => {
      callback(null, { statusCode: response.status }, body)
    })
  }).catch(error => {
    callback(error)
  })
}

export default request