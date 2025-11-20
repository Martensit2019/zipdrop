const cyrillicMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

export const slugify = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .split('')
    .map(char => {
      if (/[a-z0-9]/.test(char)) return char
      if (cyrillicMap[char as keyof typeof cyrillicMap] !== undefined) {
        return cyrillicMap[char as keyof typeof cyrillicMap]
      }
      return char
    })
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized
}

export default slugify

