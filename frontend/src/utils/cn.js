// Small className joiner so components can accept conditional utility lists.
export function cn(...classes) {
  return classes.flat(Infinity).filter(Boolean).join(' ')
}

export default cn
