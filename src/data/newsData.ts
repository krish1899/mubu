// Picsum image helper
export const getNewsImage = (seed: number) => `https://picsum.photos/seed/${seed}/400/250`;

export const PASSWORDS: { [key: string]: string } = {
  "mumu123": "mumu",
  "bubu123": "bubu",
};

// placeholder NEWS_DATA
export const NEWS_DATA = [
  { 
    title: "Global Markets See Sudden Dip After Central Bank Rate Decision", 
    snippet: "Market is volatile today, reacting to unexpected financial data...", 
    content: "Global financial markets experienced a sharp, unexpected decline this morning, a reaction primarily attributed to an unanticipated interest rate decision by a major central bank coupled with mixed economic indicators emerging from key industrialized nations. This combination has sparked a wave of selling, leading to high volatility across all major indices. Analysts are suggesting that investors should exercise extreme caution, closely monitor evolving geopolitical tensions that contribute to market nervousness, and brace for continued short-term fluctuations as liquidity tightens. The economic situation is under constant, intense review by regulatory bodies and central banks worldwide who are prepared to intervene to ensure stability." 
  },
  { 
    title: "Breakthrough AI Language Model Promises New Era of Automation", 
    snippet: "New AI tech released, setting a fresh industry standard...", 
    content: "The latest generative Artificial Intelligence model has successfully set a revolutionary new benchmark for natural language understanding, creative writing, and complex reasoning tasks. Developers and industry leaders are exceptionally enthusiastic about its verified potential to automate highly sophisticated writing and data summarization roles, revolutionize modern customer service interfaces, and unlock entirely new avenues for digital content creation that were previously unimaginable. Alongside this excitement, however, the ethical implications of mass deployment, including job displacement and data governance, are now the focus of a tense and intense industry-wide debate." 
  },
  { 
    title: "Ergonomics and Wellness Tips for the Remote Workforce", 
    snippet: "How to stay fit and healthy during prolonged work-from-home periods...", 
    content: "Maintaining a balanced, healthy lifestyle while navigating the demands of a persistent work-from-home environment continues to be a significant challenge for millions of professionals. Health experts strongly recommend adopting several key strategies: firstly, establishing a dedicated, distraction-free workspace; secondly, incorporating short, frequent stretching breaks every hour to mitigate the risks of prolonged sitting; and thirdly, making hydration and mindful eating an absolute priority. Crucially, a proper ergonomic setupâ€”including chair height, monitor alignment, and keyboard positioningâ€”is essential to prevent the chronic long-term musculoskeletal issues that are becoming increasingly common among sedentary remote workers." 
  },
  { 
    title: "Resilience in Emerging Markets Defies Global Economic Slowdown", 
    snippet: "Despite global jitters, several world markets are showing strength...", 
    content: "Against the backdrop of widespread global economic jitters and a forecast for sluggish growth in developed nations, several key emerging markets are displaying a surprising and notable degree of resilience. This positive momentum is being driven by powerful internal factors, including consistently strong domestic consumer demand and highly effective digital transformation initiatives that are being implemented across various sectors. These efforts appear to be successfully cushioning the local economies from the direct impact of international trade headwinds and volatile currency markets, suggesting a potential and crucial economic decoupling from developed-world economic cycles." 
  },
  { 
    title: "The Dominant Aesthetics of the Upcoming Fashion Season", 
    snippet: "Top fashion trends this week focus on sustainability and structure...", 
    content: "This season's major international fashion runways showcased a dramatic and compelling return to vibrant, bold color palettes alongside a strong industry commitment to sustainable, ethically-sourced materials. The currently dominant aesthetic leans heavily towards comfortable yet thoughtfully structured silhouettes, perfectly blending practicality with high fashion appeal. Furthermore, vintage-inspired accessories, especially oversized sunglasses and statement jewelry, are making a significant, noticeable comeback. Influencers and A-list celebrities are already rapidly adopting these runway looks, effectively setting the pace and dictating the direction for mainstream retail consumers." 
  },
  { 
    title: "Major Upsets Mark Continental Sports Tournament Quarter-Finals", 
    snippet: "Big matches this weekend result in thrilling, unexpected tournament outcomes...", 
    content: "The weekend's packed global sports schedule was dominated by a series of thrilling and unexpected upsets during the continental tournament quarter-finals. Several previously unheralded underdogs delivered stellar, career-defining performances on the pitch, sending genuine shockwaves through the entire tournament bracket and eliminating perennial favorites. Sports analysts are currently deep in discussion, dissecting the dramatic tactical shifts and individual moments of brilliance that led to these wholly unexpected results, promising an electric and highly unpredictable semi-final round for fans worldwide." 
  },
  { 
    title: "Hollywood Gearing Up for Record-Breaking Holiday Movie Slate", 
    snippet: "Celebrity news and gossip heats up ahead of major entertainment releases...", 
    content: "The global entertainment industry is currently gearing up for a packed and potentially record-breaking holiday season, featuring the release of several highly-anticipated blockbuster movies. Major studios are placing enormous emphasis on bankable star power, innovative visual effects, and original concepts to entice audiences back into physical theaters. Meanwhile, the off-screen world is just as busy; high-profile celebrity legal battles, unexpected separations, and social media gossip continue to dominate the trending chatter across all digital platforms." 
  },
  { 
    title: "New Exoplanet Discovery Confirmed in Habitable Zone", 
    snippet: "Exciting planetary news as astronomers find a promising new world...", 
    content: "A collaborative effort involving several major international observatories has successfully confirmed the discovery of a nearly Earth-sized exoplanet orbiting a relatively quiet distant star. Crucially, this new world resides squarely within the star's habitable zone, meaning surface liquid water could theoretically exist. This compelling finding significantly increases the estimated probability of past or even current microbial life, prompting immediate mission control planning to alter the exploration path and prioritize spectroscopic analysis to search for atmospheric biosignatures in the coming years." 
  },
  { 
    title: "Energy and Metal Commodity Prices Spike Globally", 
    snippet: "Inflation fears rise as raw material costs surge across the board...", 
    content: "Key global commodity markets, particularly those for essential energy resources and industrial metals, have witnessed significant, sustained price increases over the last month, reaching levels not seen in years. This sharp surge is directly fueling renewed concerns about global inflation and its predicted impact on consumer purchasing power and industrial production costs worldwide. Governments are now under intense pressure to consider releasing strategic reserves and implementing trade policies designed to immediately stabilize these rising costs and prevent a broader economic crisis." 
  },
  { 
    title: "Quantum Computing Achieves New Qubit Stability Milestone", 
    snippet: "Next tech frontier accelerated by a major computational breakthrough...", 
    content: "Researchers at a leading technological institute have successfully achieved a critical new milestone in **qubit stability and error correction**, which dramatically accelerates the previously estimated timeline for practical quantum computing applications. This advanced technology promises to entirely revolutionize areas like targeted drug discovery, complex material science, and military-grade cryptography. Although widespread commercial availability for consumer use remains several years in the future, the foundational technology is now proving its viability for complex research." 
  },
  { 
    title: "Companies Prioritize Mental Health with New Wellness Programs", 
    snippet: "Workplace wellness programs see a massive investment and revamp...", 
    content: "In a definitive shift in corporate culture, companies across all major industries are finally recognizing the paramount importance of comprehensive mental health and well-being support for their expansive employee base. New wellness programs, which now frequently offer confidential access to virtual therapy, professional counseling services, and fully flexible working arrangements, are being adopted globally to proactively combat employee burnout, reduce stress-related turnover, and significantly improve overall organizational productivity and morale." 
  },
  { 
    title: "Asian Stock Exchanges Lead Global Recovery Rally", 
    snippet: "Positive momentum in the East drives cautious optimism worldwide...", 
    content: "Stock exchanges throughout the Asia-Pacific region reported exceptionally strong gains in todayâ€™s trading session, effectively leading a tentative global recovery after a period of prolonged uncertainty. This powerful positive momentum is primarily driven by the release of unexpectedly robust manufacturing data and the continuation of government-backed fiscal stimuli packages designed specifically to boost post-pandemic consumer spending and regional investment. While risks remain, investors are cautiously optimistic about the potential for sustained economic growth in the region." 
  },
  { 
    title: "The Growing Movement Towards Sustainable Living and Minimalism", 
    snippet: "Eco-friendly home tips and consumer trends highlight environmental focus...", 
    content: "An increasing number of global consumers are actively and consciously turning towards sustainable and highly efficient practices in their daily lives. This ranges from simple actions like significantly reducing single-use plastic waste to complex undertakings such as installing advanced smart home energy systems and integrating rainwater harvesting. The broader movement towards mindful, minimalist consumption and the preference for durable, long-lasting goods reflects a rapidly growing environmental consciousness among all demographic groups, particularly younger consumers." 
  },
  { 
    title: "Summer Transfer Window Heats Up in European Football", 
    snippet: "Who is moving where? High-profile football rumors dominating sports media...", 
    content: "The summer football transfer window is reaching a fever pitch with several world-class players linked to potentially record-breaking moves across Europe's top leagues. Teams are currently engaging in aggressive, strategic restructuring of their squads, aiming to build a core team capable of achieving domestic and continental dominance in the forthcoming season. Speculation is running wild among fans and media, all of whom are eagerly awaiting the official confirmation of these monumental player transactions." 
  },
  { 
    title: "Independent Film Festival Showcases New Cinematic Talent", 
    snippet: "Hidden cinematic gems and surprising new directors take top honors...", 
    content: "The annual Independent Film Festival concluded over the weekend with several surprising and well-deserved winners across all major categories. Film critics are widely praising the innovative storytelling techniques, fresh perspectives, and unique visual styles demonstrated by a cohort of talented first-time and emerging directors. This highly successful event highlights a crucial and exciting shift in cinematic focus, often away from traditional, large-budget studio fare and towards more personal narratives." 
  },
  { 
    title: "Mars Rover Finds Strongest Evidence of Ancient Water Trace", 
    snippet: "Exciting planetary news as NASA confirms compelling geological findings...", 
    content: "New, highly detailed data beamed back from the specialized Mars rover mission provides the strongest and most compelling geological evidence yet of a vast area of ancient liquid water activity on the surface of the red planet. This extraordinary finding significantly elevates the estimated probability of past or even current subterranean microbial life, immediately prompting mission control to reroute the roverâ€™s exploration path to conduct deeper subsurface sampling and analysis in the newly identified area of interest." 
  },
  { 
    title: "Urgent Cybersecurity Alert Issued Following Software Flaw", 
    snippet: "Major vulnerability found in core operating system components...", 
    content: "A major new zero-day vulnerability, categorized as critical, has been detected in a suite of widely used operating systems and commercial software platforms. This discovery has led to the immediate issuance of an urgent, global cybersecurity advisory by government agencies. Users and businesses are strongly urged to apply the necessary security patches and updates immediately to prevent unauthorized access, potential data breaches, and the weaponization of the exploit by malicious actors operating globally." 
  },
  { 
    title: "Global Renewable Energy Capacity Jumps to Historic New High", 
    snippet: "Green power surge as solar and wind adoption breaks records...", 
    content: "Global installed capacity for photovoltaic solar and onshore/offshore wind energy reached an unprecedented record high last quarter, solidifying the trend toward cleaner power generation. Technological advancements in utility-scale **battery storage** are now rendering renewable sources demonstrably more reliable and increasingly cost-competitive with traditional fossil fuels, thus accelerating the worldwide energy transition far faster than previous forecasts predicted." 
  },
  { 
    title: "The Critical Importance of Prioritizing Quality Sleep Hygiene", 
    snippet: "Better rest, better life: Experts share essential health recommendations...", 
    content: "Leading sleep experts are continuing to emphasize that prioritizing consistent, high-quality sleep hygiene is an absolutely critical, foundational element for maintaining optimal physical health and sharp cognitive function. Recommended tips to improve rest include strictly limiting screen time from all electronic devices before bedtime, consistently maintaining a cool and dark bedroom environment, and adhering to a fixed, non-negotiable sleep schedule, even during weekend periods and vacations." 
  },
  { 
    title: "South American Economic Forecast Revised Downwards Amid Instability", 
    snippet: "Regional growth expected to slow due to internal political pressures...", 
    content: "Official economic growth projections for several major South American nations have been significantly revised downwards. This is primarily amid persistent, high-level inflation rates and continued, disruptive political instability within key countries. The regionâ€™s deep economic reliance on raw commodity exports makes it inherently vulnerable to global price fluctuations and sharp demand changes, compounding local challenges and making recovery harder to achieve quickly." 
  },
  { 
    title: "Embracing Minimalist Design for Enhanced Home Serenity", 
    snippet: "The 'less is more' philosophy dominates modern interior design...", 
    content: "The enduring philosophy of 'less is more' continues its strong dominance over contemporary interior design trends globally. Current aesthetics emphasize clean, unbroken lines, sophisticated neutral color palettes, and the incorporation of multi-functional, space-saving furniture. This purposeful design movement aims to actively create calm, uncluttered, and highly efficient living spaces that naturally promote both mental well-being and a sense of visual clarity for the occupants." 
  },
  { 
    title: "Basketball Playoff Quarter-Final Analysis and Projections", 
    snippet: "MVP race heats up as teams battle for continental supremacy...", 
    content: "The professional basketball playoffs are in full swing, defined by intense intra-city rivalries and a series of standout, high-stakes individual performances. The league MVP race is now considered tighter than ever before, with several leading candidates delivering career-defining games in the high-stakes, win-or-go-home environment. Analysts are closely watching how coaching decisions under pressure will ultimately shape the final outcome of the championship series." 
  },
  { 
    title: "New Platforms and Content Focus Intensify Streaming Wars", 
    snippet: "Digital media battle heats up with major studio moves and mergers...", 
    content: "The competition among global streaming services is rapidly reaching a fever pitch as new, well-funded contenders enter the digital media market and established players commit massive resources to acquiring and creating original, exclusive content. While subscribers are benefiting greatly from a significantly wider and more diverse variety of programming choices, they are also simultaneously facing growing subscription fatigue and higher monthly costs as a result." 
  },
  { 
    title: "First Feasibility Study on Asteroid Mining Released", 
    snippet: "Billion-dollar space venture sparks controversy and excitement...", 
    content: "A comprehensive preliminary feasibility study, commissioned by a private consortium, strongly suggests that asteroid mining for rare, precious metals could become an economically viable reality within the next two decades. While the technical and engineering challenges remain genuinely immense, the potential, multi-trillion-dollar payoff is currently fueling significant private investment in aerospace startups that are exclusively focused on resource extraction and deep-space logistics, signaling a new gold rush." 
  },
  { 
    title: "Global Shift in Data Privacy Regulation Affects Businesses", 
    snippet: "What consumers need to know about new online rights and protections...", 
    content: "A growing coalition of governments worldwide is actively enacting and enforcing far stricter data privacy regulations, which are designed to grant individual consumers substantially more control over their personal information and how it is utilized. Businesses must now adhere to complex, overlapping compliance standards across multiple jurisdictions, a requirement that is leading to major internal overhauls in their historical data collection, storage, and customer handling practices." 
  },
  { 
    title: "Electric Vehicle Battery Density Reaches New Record High", 
    snippet: "New record set promises longer EV driving ranges and faster charging...", 
    content: "Automotive researchers have proudly announced a significant, industry-changing breakthrough in Electric Vehicle (EV) battery technology, successfully achieving a new record for **energy density and charge capacity**. This powerful innovation promises…6690 tokens truncated…ain Resilience Prioritized by Global Corporations"
  },
  { 
    title: "New Archaeological Discoveries Challenge Early Human Migration Routes", 
    snippet: "Evidence found in unexpected locations rewrites history textbooks...", 
    content: "Recent archaeological excavations in unexpected, geographically isolated regions have uncovered compelling evidence that challenges the long-held consensus on the timeline and primary routes of early human migration out of Africa. Artifacts and ancient DNA analysis suggest multiple, distinct waves of migration occurred far earlier and followed more complex, circuitous paths than previously theorized. This major discovery is prompting a comprehensive reevaluation of anthropological textbooks and models of human dispersal across the globe." 
  }
];
