import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
  try {
    // 1. Fetch all technologies that have an RSS feed configured
    const technologies = await prisma.technology.findMany({
      where: {
        rssFeedUrl: {
          not: null
        }
      }
    })

    let updatesFound = 0
    let errors = []

    for (const tech of technologies) {
      if (!tech.rssFeedUrl) continue

      try {
        const feed = await parser.parseURL(tech.rssFeedUrl)

        // Only check the last 5 items to avoid overloading
        const recentItems = feed.items.slice(0, 5)

        for (const item of recentItems) {
          // Check if we already have this update recorded by matching the sourceUrl or title
          const existingUpdate = await prisma.technologyUpdate.findFirst({
            where: {
              technologyId: tech.id,
              OR: [
                { sourceUrl: item.link },
                { title: item.title }
              ]
            }
          })

          if (!existingUpdate) {
            // Determine severity based on keywords
            let severity = "LOW"
            const contentString = (item.title + " " + (item.contentSnippet || "")).toLowerCase()
            
            if (contentString.includes('security') || contentString.includes('critical') || contentString.includes('vulnerability') || contentString.includes('cve')) {
              severity = "CRITICAL"
            } else if (contentString.includes('major') || contentString.includes('core update') || contentString.includes('breaking')) {
              severity = "HIGH"
            } else if (contentString.includes('release') || contentString.includes('update') || contentString.includes('new feature')) {
              severity = "MEDIUM"
            }

            await prisma.technologyUpdate.create({
              data: {
                technologyId: tech.id,
                title: item.title || 'Untitled Update',
                description: item.contentSnippet || item.content || 'No description provided.',
                sourceUrl: item.link,
                severity: severity,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                isNotified: false
              }
            })
            updatesFound++
          }
        }
      } catch (err: any) {
        console.error(`Failed to fetch RSS for ${tech.name}:`, err)
        errors.push({ tech: tech.name, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${technologies.length} feeds. Found ${updatesFound} new updates.`,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
