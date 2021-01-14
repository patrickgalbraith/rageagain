export const htmlEntities = (rawStr: string) => {
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, i => {
    return '&#'+i.charCodeAt(0)+';'
  })
}

export const esc = htmlEntities