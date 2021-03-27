const dupEntries = (base: any) => {
  const obj: any = {}

  for (const key in base) {
    const value = base[key]

    obj[key] = value
    obj[value] = key
  }

  return obj
}

export const Tags = dupEntries({
  p: 'P',
  head: 'HEAD',
  title: 'TITLE',
  body: 'BODY',
})
