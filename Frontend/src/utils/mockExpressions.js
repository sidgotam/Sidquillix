const moods = ['Calm', 'Hype', 'Reflect', 'Curious', 'Bold', 'Dreamy']

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length]
}

function uid(i) {
  return `mock_${i}_${Math.random().toString(16).slice(2)}`
}

export function makeMockExpressions(count = 18) {
  return Array.from({ length: count }).map((_, i) => {
    const mood = pick(moods, i * 13)
    const hasImages = i % 3 === 0 || i % 5 === 0
    const hasVideo = i % 7 === 0

    return {
      id: uid(i),
      createdAt: Date.now() - i * 1000 * 60 * 29,
      mood,
      author: {
        name: pick(['Siddh', 'Aarya', 'Kian', 'Noor', 'Mira', 'Dev'], i * 7),
        handle: pick(['nex', 'aurora', 'kairo', 'noori', 'mirai', 'dvn'], i * 11),
      },
      text:
        i % 2 === 0
          ? `An expression can be a whisper, a collage, a pulse.\n\nToday: ${pick(
              ['rewrite the rules', 'slow down', 'zoom out', 'ship it', 'listen deeper', 'begin again'],
              i * 17,
            )}.`
          : `Tiny note: ${pick(
              ['the sky is a gradient', 'ideas have texture', 'silence is a feature', 'edges make shapes'],
              i * 19,
            )}.`,
      media: {
        images: hasImages
          ? [
              `https://picsum.photos/seed/sidquillix-${i}-a/1200/720`,
              ...(i % 5 === 0 ? [`https://picsum.photos/seed/sidquillix-${i}-b/1200/720`] : []),
            ]
          : [],
        video: hasVideo ? `https://www.w3schools.com/html/mov_bbb.mp4` : null,
      },
      likeCount: Math.floor((i * 9) % 87),
      likedByMe: i % 4 === 0,
      contentType: hasVideo ? 'video' : hasImages ? 'image' : 'text',
    }
  })
}

