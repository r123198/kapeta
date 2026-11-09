import { Cafe, isCafeRoastery, isCafe24Hours } from '@/lib/data'
import { CafeCuration } from '@/hooks/useBookmarks'

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Obsidian'
export type BadgeCategory =
  | 'Exploration'
  | 'Coffee Craft'
  | 'Remote Work'
  | 'Vibe & Culture'
  | 'Archivist'

export interface ComputedBadge {
  id: string
  title: string
  subtitle: string
  category: BadgeCategory
  tier: BadgeTier
  iconName:
    | 'coffee'
    | 'flame'
    | 'compass'
    | 'laptop'
    | 'moon'
    | 'sparkles'
    | 'heart'
    | 'book'
    | 'map-pin'
    | 'award'
    | 'zap'
    | 'users'
    | 'sun'
    | 'shield'
    | 'feather'
    | 'crown'
  description: string
  lore: string
  howToEarn: string
  rewardPoints: number
  current: number
  target: number
  percentage: number
  unlocked: boolean
  matchingCafeNames: string[]
}

export function computeUserBadges(
  cafesList: Cafe[],
  bookmarkedIds: string[],
  curations: Record<string, CafeCuration>
): ComputedBadge[] {
  const savedCafes = cafesList.filter((c) => bookmarkedIds.includes(c.id))
  const curatedEntries = savedCafes
    .map((cafe) => ({ cafe, curation: curations[cafe.id] }))
    .filter((item) => !!item.curation)

  const makeBadge = (
    meta: Omit<
      ComputedBadge,
      'current' | 'percentage' | 'unlocked' | 'matchingCafeNames'
    >,
    matchingCafes: Cafe[],
    customCount?: number
  ): ComputedBadge => {
    const rawCurrent =
      customCount !== undefined ? customCount : matchingCafes.length
    const current = Math.min(rawCurrent, meta.target)
    const percentage = Math.min(
      100,
      Math.round((current / Math.max(1, meta.target)) * 100)
    )
    return {
      ...meta,
      current,
      percentage,
      unlocked: current >= meta.target,
      matchingCafeNames: matchingCafes.map((c) => c.name),
    }
  }

  // Helper filters
  const cdoCafes = savedCafes.filter((c) => {
    const loc = c.location.toLowerCase()
    return (
      loc.includes('cagayan de oro') ||
      loc.includes('cdo') ||
      c.id.endsWith('-cdo') ||
      c.id === 'h-proper-coffee-roasters'
    )
  })

  // 6. Day-to-Night Connoisseur
  const dayToNightCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.vibes?.includes('Coffee by Day, Bar by Night') ||
      curations[c.id]?.recommendations?.includes('Coffee by Day, Cocktail Bar by Night')
  )

  // 7. Mobile Cart Champion
  const mobileCartCafes = savedCafes.filter((c) =>
    curations[c.id]?.recommendations?.includes('Mobile Cart for Events & Weddings')
  )

  const roasteryCafes = savedCafes.filter((c) => isCafeRoastery(c))
  const twentyFourHourCafes = savedCafes.filter(
    (c) =>
      isCafe24Hours(c) ||
      curations[c.id]?.vibes?.includes('24/7 Late Night')
  )

  const exceptionalBrewCafes = savedCafes.filter(
    (c) => curations[c.id]?.coffeeQuality === 'Exceptional Brew'
  )

  const specialtyGreatCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.coffeeQuality === 'Specialty Great' ||
      curations[c.id]?.coffeeQuality === 'Exceptional Brew'
  )

  const pourOverCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.recommendations?.includes('Pour Over') ||
      curations[c.id]?.recommendations?.includes('Pour Over & Signature Espresso') ||
      curations[c.id]?.recommendations?.includes('Brewing & Latte Art Throwdowns')
  )

  const espressoCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.recommendations?.includes('Signature Espresso') ||
      curations[c.id]?.recommendations?.includes('Iced Latte') ||
      curations[c.id]?.recommendations?.includes('Pour Over & Signature Espresso')
  )

  const deepWorkCafes = savedCafes.filter(
    (c) => curations[c.id]?.workFriendly === 'Great for Deep Work'
  )

  const unplugCafes = savedCafes.filter(
    (c) => curations[c.id]?.workFriendly === 'Best for Unplugging'
  )

  const quietFocusCafes = savedCafes.filter((c) =>
    curations[c.id]?.vibes?.includes('Quiet & Focused')
  )

  const cozyWarmCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.vibes?.includes('Cozy & Warm') ||
      curations[c.id]?.vibes?.includes('Warm Barista Company')
  )

  const socialCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.vibes?.includes('Lively & Social') ||
      curations[c.id]?.vibes?.includes('Art, Vinyl & Community') ||
      curations[c.id]?.recommendations?.includes('Team Catchup') ||
      curations[c.id]?.recommendations?.includes('Host Chess / Board Game Tournaments')
  )

  const pastryMatchaCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.recommendations?.includes('Fresh Pastries') ||
      curations[c.id]?.recommendations?.includes('Matcha') ||
      curations[c.id]?.recommendations?.includes('Pop-Up Market & Brand Collabs')
  )

  const soloReadingCafes = savedCafes.filter(
    (c) =>
      curations[c.id]?.recommendations?.includes('Solo Reading') ||
      curations[c.id]?.recommendations?.includes('Acoustic / Vinyl Listening Nights')
  )

  const mustOrderCafes = savedCafes.filter(
    (c) => (curations[c.id]?.mustOrder || '').trim().length >= 2
  )

  const noteCafes = savedCafes.filter(
    (c) => (curations[c.id]?.experienceNote || '').trim().length >= 3
  )

  return [
    // 1. First Pour
    makeBadge(
      {
        id: 'first-pour',
        title: 'First Pour',
        subtitle: 'Add your very first cafe to your collection',
        category: 'Exploration',
        tier: 'Bronze',
        iconName: 'coffee',
        description:
          'Every great coffee directory begins with a single memorable cup. You have officially started curating your personal coffee map.',
        lore: 'Awarded to members who log their first coffee workspace on ROOT.',
        howToEarn:
          'Select any coffee shop on the Map, complete the quick lived-experience form, and add 1 cafe to your collection.',
        rewardPoints: 50,
        target: 1,
      },
      savedCafes
    ),

    // 2. Neighborhood Regular
    makeBadge(
      {
        id: 'neighborhood-regular',
        title: 'Neighborhood Regular',
        subtitle: 'Curate 3 coffee spots in your collection',
        category: 'Exploration',
        tier: 'Bronze',
        iconName: 'compass',
        description:
          'You know where to go whether you need an early morning espresso or a quiet afternoon corner.',
        lore: 'Baristas start recognizing your order before you reach the counter.',
        howToEarn: 'Curate and save at least 3 different cafes to your Directory.',
        rewardPoints: 100,
        target: 3,
      },
      savedCafes
    ),

    // 3. Directory Architect
    makeBadge(
      {
        id: 'directory-architect',
        title: 'Directory Architect',
        subtitle: 'Build a curated collection of 6 cafes',
        category: 'Exploration',
        tier: 'Silver',
        iconName: 'award',
        description:
          'Your directory is now a trusted personal guide across multiple neighborhoods and coffee styles.',
        lore: 'Friends ask you for recommendations whenever they need a place to meet or work.',
        howToEarn: 'Save and curate 6 coffee shops in your personal Directory.',
        rewardPoints: 250,
        target: 6,
      },
      savedCafes
    ),

    // 4. Master Cartographer
    makeBadge(
      {
        id: 'master-cartographer',
        title: 'Master Cartographer',
        subtitle: 'Curate 10 specialty spaces across the map',
        category: 'Exploration',
        tier: 'Obsidian',
        iconName: 'crown',
        description:
          'An elite curator of coffee culture. Your archival collection spans the finest roasteries and workspaces.',
        lore: 'Only the most dedicated coffee explorers reach double-digit curations.',
        howToEarn: 'Save and curate 10 coffee shops in your personal Directory.',
        rewardPoints: 500,
        target: 10,
      },
      savedCafes
    ),

    // 5. CDO Trailblazer
    makeBadge(
      {
        id: 'cdo-trailblazer',
        title: 'Kagay-an Trailblazer',
        subtitle: 'Curate 3 cafes in Cagayan de Oro',
        category: 'Exploration',
        tier: 'Silver',
        iconName: 'map-pin',
        description:
          'From Velez and Corrales to Nazareth and Uptown, you have mapped out the City of Golden Friendship’s specialty coffee scene.',
        lore: 'Celebrates explorers of Cagayan de Oro’s independent roasters and third-wave spaces.',
        howToEarn: 'Save 3 cafes located in Cagayan de Oro to your collection.',
        rewardPoints: 180,
        target: 3,
      },
      cdoCafes
    ),

    // 6. Coffee by Day, Bar by Night
    makeBadge(
      {
        id: 'day-to-night-connoisseur',
        title: 'Day-to-Night Connoisseur',
        subtitle: 'Curate 2 "Coffee by Day, Bar by Night" spaces',
        category: 'Vibe & Culture',
        tier: 'Silver',
        iconName: 'moon',
        description:
          'Espresso in the morning light, craft cocktails and vinyl after sunset—you love hybrid spaces that evolve with the clock.',
        lore: 'Honors curators of day-to-night coffee and lounge concepts.',
        howToEarn:
          'Tag 2 cafes with "Coffee by Day, Bar by Night" or recommend a night bar concept.',
        rewardPoints: 200,
        target: 2,
      },
      dayToNightCafes
    ),

    // 7. Mobile Cart & Event Scout
    makeBadge(
      {
        id: 'mobile-cart-scout',
        title: 'Mobile Cart & Event Scout',
        subtitle: 'Recommend 2 cafes for Mobile Carts & Events',
        category: 'Vibe & Culture',
        tier: 'Gold',
        iconName: 'shield',
        description:
          'You spot coffee teams whose warmth and hospitality belong at weddings, pop-ups, and community gatherings.',
        lore: 'Directly helps shop owners know their community wants bookable mobile event carts.',
        howToEarn:
          'Select "Mobile Cart for Events & Weddings" under Question 4 for 2 cafes.',
        rewardPoints: 280,
        target: 2,
      },
      mobileCartCafes
    ),

    // 8. Roastery Hunter
    makeBadge(
      {
        id: 'roastery-hunter',
        title: 'Roastery Hunter',
        subtitle: 'Save 3 in-house coffee roasteries',
        category: 'Coffee Craft',
        tier: 'Gold',
        iconName: 'flame',
        description:
          'You follow the scent of freshly roasted single-origin beans straight to the drum roaster.',
        lore: 'Earned by visiting spaces represented by the animated Coffee Bean marker on the map.',
        howToEarn: 'Add 3 Roastery cafes (Bean markers) to your collection.',
        rewardPoints: 250,
        target: 3,
      },
      roasteryCafes
    ),

    // 9. Pour Over Purist
    makeBadge(
      {
        id: 'pour-over-purist',
        title: 'Pour Over Purist',
        subtitle: 'Recommend Pour Over at 2 different cafes',
        category: 'Coffee Craft',
        tier: 'Silver',
        iconName: 'coffee',
        description:
          'V60, Kalita, or Origami—you appreciate clean clarity, floral aromatics, and origin character.',
        lore: 'No syrups needed when the single-origin filter brew shines on its own.',
        howToEarn:
          'Tag "Pour Over" under Recommendations for at least 2 cafes in your collection.',
        rewardPoints: 175,
        target: 2,
      },
      pourOverCafes
    ),

    // 10. Third-Wave Critic
    makeBadge(
      {
        id: 'third-wave-critic',
        title: 'Third-Wave Critic',
        subtitle: 'Rate 3 cafes as "Exceptional Brew"',
        category: 'Coffee Craft',
        tier: 'Gold',
        iconName: 'sparkles',
        description:
          'You have an eye—and palate—for extraordinary extraction, sweetness, and balance.',
        lore: 'Your "Exceptional Brew" stamp is reserved for the top tier of specialty coffee.',
        howToEarn:
          'Select "Exceptional Brew" under Question 1 (How is the coffee?) for 3 cafes.',
        rewardPoints: 275,
        target: 3,
      },
      exceptionalBrewCafes
    ),

    // 11. Dialed-In Palate
    makeBadge(
      {
        id: 'dialed-in-palate',
        title: 'Dialed-In Palate',
        subtitle: 'Rate 5 cafes as Specialty Great or Exceptional',
        category: 'Coffee Craft',
        tier: 'Silver',
        iconName: 'award',
        description:
          'Consistent quality is non-negotiable in your personal coffee directory.',
        lore: 'Recognizes curators who seek out dialed-in specialty cups.',
        howToEarn:
          'Rate 5 cafes as either "Specialty Great" or "Exceptional Brew".',
        rewardPoints: 220,
        target: 5,
      },
      specialtyGreatCafes
    ),

    // 12. Espresso & Latte Connoisseur
    makeBadge(
      {
        id: 'espresso-connoisseur',
        title: 'Espresso Aficionado',
        subtitle: 'Recommend Signature Espresso or Iced Latte at 3 spots',
        category: 'Coffee Craft',
        tier: 'Bronze',
        iconName: 'zap',
        description:
          'From velvety flat whites and iced lattes to syrupy double shots, you know who pulls the best espresso.',
        lore: 'Powered by 9 bars of pressure and silky microfoam.',
        howToEarn:
          'Tag "Signature Espresso" or "Iced Latte" under Recommendations for 3 cafes.',
        rewardPoints: 140,
        target: 3,
      },
      espressoCafes
    ),

    // 13. Deep Work Nomad
    makeBadge(
      {
        id: 'deep-work-nomad',
        title: 'Deep Work Nomad',
        subtitle: 'Curate 3 cafes as "Deep Work Ready"',
        category: 'Remote Work',
        tier: 'Gold',
        iconName: 'laptop',
        description:
          'Fast WiFi, abundant wall sockets, and ergonomic tables—you have built the ultimate remote work rotation.',
        lore: 'Shipping code, decks, and designs from the best-connected tables in town.',
        howToEarn:
          'Mark 3 cafes as "Deep Work Ready" under Question 2 (Conducive to working?).',
        rewardPoints: 260,
        target: 3,
      },
      deepWorkCafes
    ),

    // 14. 24/7 Night Owl
    makeBadge(
      {
        id: 'night-owl',
        title: '24/7 Night Owl',
        subtitle: 'Save 2 late-night or 24/7 coffee workspaces',
        category: 'Remote Work',
        tier: 'Silver',
        iconName: 'moon',
        description:
          'When the city sleeps, your productivity—and caffeine—is just hitting its stride.',
        lore: 'Earned by curating 24/7 hubs or tagging spaces with "24/7 Late Night".',
        howToEarn:
          'Add 2 cafes that are open 24/7 or tagged with the "24/7 Late Night" vibe.',
        rewardPoints: 200,
        target: 2,
      },
      twentyFourHourCafes
    ),

    // 15. Quiet Corner Seeker
    makeBadge(
      {
        id: 'quiet-corner-seeker',
        title: 'Quiet Sanctuary Seeker',
        subtitle: 'Curate 3 spots with a "Quiet & Focused" vibe',
        category: 'Vibe & Culture',
        tier: 'Silver',
        iconName: 'book',
        description:
          'You know every peaceful corner where the acoustics are gentle and concentration comes naturally.',
        lore: 'Ideal for deep reading, journaling, or uninterrupted study sessions.',
        howToEarn:
          'Tag 3 cafes with the "Quiet & Focused" vibe when adding them to your collection.',
        rewardPoints: 180,
        target: 3,
      },
      quietFocusCafes
    ),

    // 16. Cozy & Warm Regular
    makeBadge(
      {
        id: 'cozy-regular',
        title: 'Slow Morning Curator',
        subtitle: 'Curate 2 spots for "Unplug & Chill" or "Solo Reading"',
        category: 'Vibe & Culture',
        tier: 'Bronze',
        iconName: 'sun',
        description:
          'Not every cafe visit is about laptops—you treasure spaces meant for slow mornings and good books.',
        lore: 'Celebrates the art of slowing down over a warm cup.',
        howToEarn:
          'Mark 2 cafes as "Unplug & Chill" or recommend them for "Solo Reading".',
        rewardPoints: 150,
        target: 2,
      },
      Array.from(new Set([...unplugCafes, ...soloReadingCafes, ...cozyWarmCafes]))
    ),

    // 17. Social Connector
    makeBadge(
      {
        id: 'social-connector',
        title: 'Community Table Host',
        subtitle: 'Curate 2 cafes for Lively vibes or Team Catchups',
        category: 'Vibe & Culture',
        tier: 'Bronze',
        iconName: 'users',
        description:
          'Coffee is better shared. You have curated the best spots in town for conversations and team huddles.',
        lore: 'Always knows where to book a table when the group chat says "Let’s grab coffee."',
        howToEarn:
          'Tag 2 cafes with "Lively & Social" or "Team Catchup" in your collection.',
        rewardPoints: 150,
        target: 2,
      },
      socialCafes
    ),

    // 18. Pastry & Matcha Connoisseur
    makeBadge(
      {
        id: 'pastry-matcha-lover',
        title: 'Artisanal Pairing Pro',
        subtitle: 'Recommend Fresh Pastries or Matcha at 2 cafes',
        category: 'Vibe & Culture',
        tier: 'Bronze',
        iconName: 'heart',
        description:
          'Flaky croissants, ceremonial-grade matcha, and specialty bakes—you know the full menu beyond espresso.',
        lore: 'Because a great cup deserves an equally great bake.',
        howToEarn:
          'Select "Fresh Pastries" or "Matcha" under Recommendations for 2 cafes.',
        rewardPoints: 140,
        target: 2,
      },
      pastryMatchaCafes
    ),

    // 19. Signature Order Curator
    makeBadge(
      {
        id: 'signature-order-curator',
        title: 'Menu Insider',
        subtitle: 'Log a specific "Go-to order" on 3 cafes',
        category: 'Archivist',
        tier: 'Silver',
        iconName: 'feather',
        description:
          'You never forget the exact drink name that blew you away—from sea salt Spanish lattes to single-origin cold brews.',
        lore: 'Turns your personal directory into a menu playbook.',
        howToEarn:
          'Fill in the "Go-to order" field under Recommendations for 3 cafes in your collection.',
        rewardPoints: 210,
        target: 3,
      },
      mustOrderCafes
    ),

    // 20. Field Notes Chronicler
    makeBadge(
      {
        id: 'field-notes-chronicler',
        title: 'Field Notes Chronicler',
        subtitle: 'Write personal experience notes on 3 cafes',
        category: 'Archivist',
        tier: 'Gold',
        iconName: 'book',
        description:
          'Your directory is rich with personal stories, socket locations, and sensory notes from your visits.',
        lore: 'The gold standard of personal coffee journalism on ROOT.',
        howToEarn:
          'Add a Personal Note (Question 5) on at least 3 cafes in your collection (curated entries: ' +
          curatedEntries.length +
          ').',
        rewardPoints: 300,
        target: 3,
      },
      noteCafes
    ),
  ]
}

