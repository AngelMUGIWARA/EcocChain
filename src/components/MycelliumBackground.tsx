/**
 * MycelliumBackground
 * SVG background that evokes a fungal mycelium network —
 * organic branching filaments + amber "validator" nodes for the blockchain layer.
 *
 * Opacity is intentionally very low so content stays readable.
 * Three accent nodes pulse slowly to suggest on-chain activity.
 */
export function MycelliumBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 700"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Soft radial halos behind hub nodes */}
        <radialGradient id="mc-halo-green" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#09291D" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#09291D" stopOpacity="0"   />
        </radialGradient>
        <radialGradient id="mc-halo-amber" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#C8A97A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C8A97A" stopOpacity="0"   />
        </radialGradient>

        {/* Pulse animation for blockchain-validator nodes */}
        <style>{`
          @keyframes mc-pulse {
            0%, 100% { opacity: 0.30; r: 3.5; }
            50%       { opacity: 0.55; r: 5.5; }
          }
          @keyframes mc-pulse-ring {
            0%   { r: 6;  opacity: 0.18; }
            100% { r: 18; opacity: 0;    }
          }
          .mc-validator        { animation: mc-pulse 4s ease-in-out infinite; }
          .mc-validator-ring   { animation: mc-pulse-ring 4s ease-out infinite; }
          .mc-validator-b      { animation: mc-pulse 4s ease-in-out infinite 1.4s; }
          .mc-validator-b-ring { animation: mc-pulse-ring 4s ease-out  infinite 1.4s; }
          .mc-validator-c      { animation: mc-pulse 4s ease-in-out infinite 2.7s; }
          .mc-validator-c-ring { animation: mc-pulse-ring 4s ease-out  infinite 2.7s; }
        `}</style>
      </defs>

      {/* ── MAIN HIGHWAY FILAMENTS (inter-cluster) ──────────────── */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round"
         stroke="#09291D" strokeOpacity="0.07" strokeWidth="1.1">
        {/* Left hub → Center */}
        <path d="M 188 148 C 270 208 355 268 446 330" />
        {/* Right hub → Center */}
        <path d="M 748 128 C 672 208 572 272 456 328" />
        {/* Center → Lower-left hub */}
        <path d="M 442 342 C 375 402 295 458 208 510" />
        {/* Center → Lower-right hub */}
        <path d="M 462 340 C 548 408 655 468 775 512" />
        {/* Left spine (top-left hub → lower-left hub) */}
        <path d="M 175 162 C 158 290 168 400 192 502" />
        {/* Right spine (top-right hub → lower-right hub) */}
        <path d="M 762 142 C 778 282 782 396 778 504" />
      </g>

      {/* ── SECONDARY BRANCHES (within clusters) ───────────────── */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round"
         stroke="#09291D" strokeOpacity="0.055" strokeWidth="0.72">
        {/* Top-left cluster */}
        <path d="M 188 148 C 148 116 122 90 96 68" />
        <path d="M 188 148 C 225 114 258 94 285 80" />
        <path d="M 188 148 C 162 172 136 192 108 200" />
        <path d="M 188 148 C 218 174 244 188 268 180" />
        <path d="M 96  68  C 78  54  58  44  42  40" />
        <path d="M 285 80  C 312 68  338 64  360 70" />
        <path d="M 108 200 C 88  210  68  215  50  212" />
        <path d="M 268 180 C 290 170 312 166 332 170" />

        {/* Top-right cluster */}
        <path d="M 748 128 C 705 90  674 68  648 56" />
        <path d="M 748 128 C 792 90  828 72  858 64" />
        <path d="M 748 128 C 774 158 790 184 800 214" />
        <path d="M 748 128 C 715 162 695 184 670 194" />
        <path d="M 858 64  C 884 56  912 52  938 58" />
        <path d="M 648 56  C 620 48  595 48  572 56" />
        <path d="M 670 194 C 648 184 628 178 612 178" />
        <path d="M 800 214 C 820 224 840 238 856 252" />

        {/* Center cluster */}
        <path d="M 446 330 C 416 294 394 264 380 240" />
        <path d="M 458 326 C 494 294 518 268 540 252" />
        <path d="M 446 330 C 422 358 408 384 398 408" />
        <path d="M 462 336 C 490 360 508 382 518 404" />
        <path d="M 380 240 C 364 220 348 200 335 186" />
        <path d="M 540 252 C 558 234 580 220 602 214" />

        {/* Lower-left cluster */}
        <path d="M 208 510 C 166 490 130 476 96  470" />
        <path d="M 208 510 C 244 490 276 480 302 484" />
        <path d="M 208 510 C 186 538 172 562 160 588" />
        <path d="M 208 510 C 232 538 250 562 258 588" />
        <path d="M 96  470 C 70  463 46  460 28  464" />
        <path d="M 302 484 C 324 480 346 480 365 486" />

        {/* Lower-right cluster */}
        <path d="M 775 512 C 738 490 702 476 672 474" />
        <path d="M 775 512 C 812 490 846 480 878 486" />
        <path d="M 775 512 C 756 540 745 565 740 590" />
        <path d="M 775 512 C 798 538 814 562 820 588" />
        <path d="M 878 486 C 906 480 932 480 958 486" />
        <path d="M 672 474 C 648 466 626 462 608 464" />
      </g>

      {/* ── TERTIARY TIP FILAMENTS ───────────────────────────────── */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round"
         stroke="#09291D" strokeOpacity="0.038" strokeWidth="0.5">
        <path d="M 42  40  C 26  32  12  28  2   28" />
        <path d="M 96  68  C 78  56  62  46  48  40" />
        <path d="M 50  212 C 32  208 18  207 4   210" />
        <path d="M 332 170 C 352 163 372 160 392 163" />
        <path d="M 360 70  C 382 62  404 58  425 62" />
        <path d="M 335 186 C 318 172 304 162 292 158" />
        <path d="M 572 56  C 552 48  534 46  518 50" />
        <path d="M 425 62  C 445 56  465 54  482 58" />
        <path d="M 938 58  C 958 52  975 50  990 54" />
        <path d="M 612 178 C 594 172 578 170 564 175" />
        <path d="M 602 214 C 624 208 648 208 668 215" />
        <path d="M 856 252 C 870 265 880 280 882 297" />
        <path d="M 28  464 C 14  460 4   460 0   463" />
        <path d="M 365 486 C 384 482 404 480 422 484" />
        <path d="M 398 408 C 386 428 376 450 368 468" />
        <path d="M 518 404 C 528 422 534 444 534 462" />
        <path d="M 160 588 C 148 604 138 618 132 630" />
        <path d="M 258 588 C 268 604 274 620 275 634" />
        <path d="M 608 464 C 585 458 566 455 550 458" />
        <path d="M 958 486 C 978 480 994 478 1000 480" />
        <path d="M 740 590 C 733 606 728 620 725 632" />
        <path d="M 820 588 C 828 604 833 620 834 632" />
        <path d="M 292 158 C 277 148 265 142 255 142" />
        <path d="M 668 215 C 688 210 706 210 722 216" />
        <path d="M 882 297 C 890 312 894 328 892 344" />
      </g>

      {/* ── AMBER ACCENT FILAMENTS (blockchain layer) ───────────── */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round"
         stroke="#C8A97A" strokeOpacity="0.065" strokeWidth="0.65">
        <path d="M 446 330 C 488 312 516 298 542 292" />
        <path d="M 542 292 C 570 280 596 276 624 282" />
        <path d="M 446 330 C 415 348 386 362 358 370" />
        <path d="M 208 510 C 268 500 320 498 366 504" />
        <path d="M 775 512 C 716 502 666 498 628 504" />
        <path d="M 358 370 C 388 372 415 378 440 386" />
        <path d="M 624 282 C 650 288 674 300 694 316" />
      </g>

      {/* ── NODE HALOS ───────────────────────────────────────────── */}
      <g>
        <circle cx="188" cy="148" r="26" fill="url(#mc-halo-green)" />
        <circle cx="748" cy="128" r="26" fill="url(#mc-halo-green)" />
        <circle cx="450" cy="332" r="32" fill="url(#mc-halo-green)" />
        <circle cx="208" cy="510" r="22" fill="url(#mc-halo-green)" />
        <circle cx="775" cy="512" r="22" fill="url(#mc-halo-green)" />
        <circle cx="542" cy="292" r="20" fill="url(#mc-halo-amber)" />
        <circle cx="358" cy="370" r="18" fill="url(#mc-halo-amber)" />
        <circle cx="624" cy="282" r="18" fill="url(#mc-halo-amber)" />
      </g>

      {/* ── PRIMARY HUB NODES ────────────────────────────────────── */}
      <g fill="#09291D" fillOpacity="0.14">
        <circle cx="188" cy="148" r="5.5" />
        <circle cx="748" cy="128" r="5.5" />
        <circle cx="450" cy="332" r="6.5" />
        <circle cx="208" cy="510" r="5"   />
        <circle cx="775" cy="512" r="5"   />
      </g>

      {/* ── SECONDARY NODES ──────────────────────────────────────── */}
      <g fill="#09291D" fillOpacity="0.10">
        <circle cx="96"  cy="68"  r="3"   />
        <circle cx="285" cy="80"  r="3"   />
        <circle cx="108" cy="200" r="2.5" />
        <circle cx="268" cy="180" r="2.5" />
        <circle cx="648" cy="56"  r="3"   />
        <circle cx="858" cy="64"  r="3"   />
        <circle cx="670" cy="194" r="2.5" />
        <circle cx="800" cy="214" r="2.5" />
        <circle cx="380" cy="240" r="3"   />
        <circle cx="540" cy="252" r="3"   />
        <circle cx="398" cy="408" r="2.5" />
        <circle cx="518" cy="404" r="2.5" />
        <circle cx="96"  cy="470" r="3"   />
        <circle cx="302" cy="484" r="2.5" />
        <circle cx="672" cy="474" r="3"   />
        <circle cx="878" cy="486" r="3"   />
        <circle cx="335" cy="186" r="2.5" />
        <circle cx="602" cy="214" r="2.5" />
      </g>

      {/* ── TIP NODES ────────────────────────────────────────────── */}
      <g fill="#09291D" fillOpacity="0.07">
        <circle cx="42"  cy="40"  r="1.5" />
        <circle cx="50"  cy="212" r="1.5" />
        <circle cx="360" cy="70"  r="1.5" />
        <circle cx="425" cy="62"  r="1.5" />
        <circle cx="572" cy="56"  r="1.5" />
        <circle cx="938" cy="58"  r="1.5" />
        <circle cx="332" cy="170" r="1.5" />
        <circle cx="292" cy="158" r="1.5" />
        <circle cx="612" cy="178" r="1.5" />
        <circle cx="668" cy="215" r="1.5" />
        <circle cx="856" cy="252" r="1.5" />
        <circle cx="28"  cy="464" r="1.5" />
        <circle cx="365" cy="486" r="1.5" />
        <circle cx="368" cy="468" r="1.5" />
        <circle cx="534" cy="462" r="1.5" />
        <circle cx="608" cy="464" r="1.5" />
        <circle cx="958" cy="486" r="1.5" />
        <circle cx="160" cy="588" r="1.5" />
        <circle cx="258" cy="588" r="1.5" />
        <circle cx="740" cy="590" r="1.5" />
        <circle cx="820" cy="588" r="1.5" />
        <circle cx="132" cy="630" r="1.5" />
        <circle cx="275" cy="634" r="1.5" />
        <circle cx="725" cy="632" r="1.5" />
        <circle cx="834" cy="632" r="1.5" />
        <circle cx="482" cy="58"  r="1.5" />
        <circle cx="550" cy="458" r="1.5" />
        <circle cx="722" cy="216" r="1.5" />
        <circle cx="882" cy="297" r="1.5" />
      </g>

      {/* ── BLOCKCHAIN VALIDATOR NODES (amber, pulsing) ──────────── */}
      <circle cx="542" cy="292" r="16" fill="#C8A97A" fillOpacity="0" className="mc-validator-ring" />
      <circle cx="542" cy="292" r="3.5" fill="#C8A97A" className="mc-validator" />

      <circle cx="358" cy="370" r="16" fill="#C8A97A" fillOpacity="0" className="mc-validator-b-ring" />
      <circle cx="358" cy="370" r="3.5" fill="#C8A97A" className="mc-validator-b" />

      <circle cx="624" cy="282" r="16" fill="#C8A97A" fillOpacity="0" className="mc-validator-c-ring" />
      <circle cx="624" cy="282" r="3.5" fill="#C8A97A" className="mc-validator-c" />

      <g fill="#C8A97A" fillOpacity="0.20">
        <circle cx="366" cy="504" r="2.2" />
        <circle cx="628" cy="504" r="2.2" />
        <circle cx="422" cy="484" r="1.8" />
        <circle cx="694" cy="316" r="1.8" />
        <circle cx="440" cy="386" r="1.8" />
      </g>
    </svg>
  );
}
