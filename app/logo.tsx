/* eslint-disable @next/next/no-img-element -- fixed-size static marks; next/image
   would add a client wrapper and layout shim for no benefit at 56px. */

/**
 * A logo that may need a different file per theme.
 *
 * Several of these are single-colour line art — the University of Mumbai crest
 * is black, and vanishes on the dark theme — so they ship as a pair and CSS
 * picks one. Marks that read on both backgrounds (the UTD monogram, in flame
 * orange) supply only `src` and render once.
 */
export function Logo({
  src,
  srcLight,
  alt,
  height,
  className,
}: {
  src: string
  srcLight?: string
  alt: string
  height: number
  className?: string
}) {
  const style = { height, width: 'auto' } as const
  const shared = `${className ?? ''} object-contain`

  if (!srcLight) {
    return <img src={src} alt={alt} style={style} className={shared} />
  }

  return (
    <>
      <img src={src} alt={alt} style={style} className={`${shared} only-dark`} />
      {/* The pair describes one thing, so only one carries the name. */}
      <img src={srcLight} alt="" aria-hidden style={style} className={`${shared} only-light`} />
    </>
  )
}
