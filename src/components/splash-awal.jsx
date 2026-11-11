import { useEffect, useState } from 'react'

const SWOOSH =
  'M1 435 L67 420 148 407 214 400 295 396 370 397 443 402 498 409 539 416 611 433 589 421 562 410 526 398 484 387 430 377 398 373 357 370 304 369 260 371 209 376 140 388 103 397 49 414 21 425Z'
const RUMAH =
  'M460 94 309 0 155 88 153 90 153 362 182 346 209 336 237 330 264 329 265 189 301 189 327 194 341 203 351 213 358 225 361 236 363 262 361 287 354 303 329 338 349 339 367 342 406 355 435 360 460 360Z'

const css = `
.splash-awal{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#0e1320;transition:opacity .45s ease}
.splash-awal.keluar{opacity:0;pointer-events:none}
.splash-awal svg{width:min(62vw,300px);height:auto;overflow:visible}
.splash-awal path{fill-opacity:0;stroke:#ffc400;stroke-width:5;stroke-dasharray:1;stroke-dashoffset:1;animation:sa-garis 1.3s ease-in-out forwards,sa-isi .5s 1.2s forwards}
.splash-awal .sa-nama{color:#f3efe4;font-weight:700;letter-spacing:.14em;font-size:15px;opacity:0;text-align:center;padding:0 24px;animation:sa-muncul .6s 1.5s forwards}
@keyframes sa-garis{to{stroke-dashoffset:0}}
@keyframes sa-isi{to{fill-opacity:1;stroke-opacity:0}}
@keyframes sa-muncul{to{opacity:1}}
@media (prefers-reduced-motion:reduce){.splash-awal *{animation-duration:.01s!important;animation-delay:0s!important}}
`

/** Layar pembuka beranimasi. Hanya tampil di aplikasi Android (APK), tidak di situs web. */
export function SplashAwal() {
  const native = Boolean(window.Capacitor?.isNativePlatform?.())
  const [fase, setFase] = useState(native ? 'tampil' : 'selesai')

  useEffect(() => {
    if (!native) return undefined
    const keluar = setTimeout(() => setFase('keluar'), 2700)
    const selesai = setTimeout(() => setFase('selesai'), 3200)
    return () => {
      clearTimeout(keluar)
      clearTimeout(selesai)
    }
  }, [native])

  if (fase === 'selesai') return null
  return (
    <div className={`splash-awal${fase === 'keluar' ? ' keluar' : ''}`} role="presentation">
      <style>{css}</style>
      <svg viewBox="0 0 613 436" aria-hidden="true">
        <defs>
          <linearGradient id="sa-emas" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffc400" />
            <stop offset="1" stopColor="#ff9f00" />
          </linearGradient>
        </defs>
        <g fill="url(#sa-emas)">
          <path pathLength="1" d={SWOOSH} />
          <path pathLength="1" d={RUMAH} />
        </g>
      </svg>
      <div className="sa-nama">SOLUSI RUMAH IDAMAN</div>
    </div>
  )
}
