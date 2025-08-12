export interface Title {
  id: string
  title: string
  alternateTitle?: string
  author?: string
  genres: string[]
  shortDescription: string
  fullDescription: string
  coverImage: string
  status: "ongoing" | "completed" | "hiatus"
  chapterCount: number
  lastUpdated: Date
  createdAt: Date
  views: number
}

export interface Chapter {
  id: string
  titleId: string
  chapterNumber: number
  chapterTitle?: string
  pages: string[]
  publishDate: Date
  createdAt: Date
  views: number
}

export interface ReadingProgress {
  userId: string
  titleId: string
  chapterId: string
  lastPage: number
  timestamp: number
}

// Mock data storage functions - in real app, these would be API calls
export function getTitles(): Title[] {
  const stored = localStorage.getItem("manga-reader-titles")
  if (stored) {
    const titles = JSON.parse(stored)
    return titles.map((title: any) => ({
      ...title,
      lastUpdated: new Date(title.lastUpdated),
      createdAt: new Date(title.createdAt),
    }))
  }

  const defaultTitles: Title[] = [
    {
      id: "1",
      title: "سولو ليفلنغ",
      alternateTitle: "Solo Leveling",
      author: "تشوغونغ",
      genres: ["أكشن", "فانتازيا", "مانهوا"],
      shortDescription: "صياد ضعيف يصبح الأقوى في العالم...",
      fullDescription:
        "منذ عشر سنوات، ظهرت 'البوابة' وربطت العالم الحقيقي بعالم السحر والوحوش. لمحاربة هذه الوحوش الشريرة، حصل الناس العاديون على قوى خارقة وأصبحوا يُعرفون باسم 'الصيادين'. سونغ جين وو البالغ من العمر عشرين عاماً هو أحد هؤلاء الصيادين، لكنه يُعرف باسم 'الأضعف في العالم'، بسبب قوته الضعيفة مقارنة حتى بصياد من الرتبة E. ومع ذلك، يصطاد الوحوش بلا كلل في البوابات منخفضة الرتبة لدفع فواتير علاج والدته الطبية.",
      coverImage: "/solo-leveling-inspired-cover.png",
      status: "completed",
      chapterCount: 179,
      lastUpdated: new Date("2024-01-15"),
      createdAt: new Date("2023-01-01"),
      views: 15420,
    },
    {
      id: "2",
      title: "برج الإله",
      alternateTitle: "Tower of God",
      author: "SIU",
      genres: ["أكشن", "مغامرة", "مانهوا"],
      shortDescription: "فتى يدخل برجاً غامضاً...",
      fullDescription:
        "ماذا تريد؟ المال والثروة؟ الشرف والكبرياء؟ السلطة والقوة؟ الانتقام؟ أم شيء يتجاوز كل ذلك؟ مهما كان ما تريده - فهو هنا. يتمحور برج الإله حول فتى يُدعى الخامس والعشرون بام، الذي قضى معظم حياته محاصراً تحت برج شاسع وغامض، مع صديقته المقربة راشيل فقط لتؤنسه.",
      coverImage: "/tower-of-god-cover.png",
      status: "ongoing",
      chapterCount: 595,
      lastUpdated: new Date("2024-01-10"),
      createdAt: new Date("2022-06-01"),
      views: 28750,
    },
    {
      id: "3",
      title: "البداية بعد النهاية",
      alternateTitle: "The Beginning After The End",
      author: "TurtleMe",
      genres: ["فانتازيا", "دراما", "مانهوا"],
      shortDescription: "ملك يولد من جديد في عالم السحر...",
      fullDescription:
        "الملك غراي لديه قوة وثروة ومكانة لا مثيل لها في عالم تحكمه القدرة القتالية. ومع ذلك، تكمن الوحدة بالقرب من أولئك الذين يتمتعون بقوة عظيمة. تحت المظهر الخارجي الساحر لملك قوي تكمن قشرة رجل، خالية من الهدف والإرادة. وُلد من جديد في عالم جديد مليء بالسحر والوحوش، الملك لديه فرصة ثانية ليعيش حياته من جديد.",
      coverImage: "/beginning-after-end-cover.png",
      status: "ongoing",
      chapterCount: 167,
      lastUpdated: new Date("2024-01-12"),
      createdAt: new Date("2022-08-15"),
      views: 19830,
    },
  ]

  localStorage.setItem("manga-reader-titles", JSON.stringify(defaultTitles))
  return defaultTitles
}

export function getTitleById(id: string): Title | null {
  const titles = getTitles()
  return titles.find((title) => title.id === id) || null
}

export function getChaptersByTitleId(titleId: string): Chapter[] {
  const stored = localStorage.getItem(`manga-reader-chapters-${titleId}`)
  if (stored) {
    const chapters = JSON.parse(stored)
    return chapters.map((chapter: any) => ({
      ...chapter,
      publishDate: new Date(chapter.publishDate),
      createdAt: new Date(chapter.createdAt),
    }))
  }

  // Mock chapters for demo
  const mockChapters: Chapter[] = []
  const title = getTitleById(titleId)
  if (title) {
    for (let i = 1; i <= Math.min(5, title.chapterCount); i++) {
      mockChapters.push({
        id: `${titleId}-${i}`,
        titleId,
        chapterNumber: i,
        chapterTitle: `Chapter ${i}`,
        pages: [
          `/placeholder.svg?height=1200&width=800&query=manga page ${i}-1 action scene`,
          `/placeholder.svg?height=1200&width=800&query=manga page ${i}-2 dialogue scene`,
          `/placeholder.svg?height=1200&width=800&query=manga page ${i}-3 character closeup`,
          `/placeholder.svg?height=1200&width=800&query=manga page ${i}-4 battle scene`,
          `/placeholder.svg?height=1200&width=800&query=manga page ${i}-5 dramatic ending`,
        ],
        publishDate: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 1000) + 100,
      })
    }
  }

  localStorage.setItem(`manga-reader-chapters-${titleId}`, JSON.stringify(mockChapters))
  return mockChapters
}

export function getChapterById(titleId: string, chapterId: string): Chapter | null {
  const chapters = getChaptersByTitleId(titleId)
  return chapters.find((chapter) => chapter.id === chapterId) || null
}

export function updateTitleViews(titleId: string) {
  const titles = getTitles()
  const titleIndex = titles.findIndex((t) => t.id === titleId)
  if (titleIndex !== -1) {
    titles[titleIndex].views += 1
    localStorage.setItem("manga-reader-titles", JSON.stringify(titles))
  }
}

export function updateChapterViews(titleId: string, chapterId: string) {
  const chapters = getChaptersByTitleId(titleId)
  const chapterIndex = chapters.findIndex((c) => c.id === chapterId)
  if (chapterIndex !== -1) {
    chapters[chapterIndex].views += 1
    localStorage.setItem(`manga-reader-chapters-${titleId}`, JSON.stringify(chapters))
  }
}
