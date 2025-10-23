import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./App.css";

interface ReplyInfo {
  id?: string;
  text?: string | null;
}

interface Message {
  id?: string;
  sender: string;
  text?: string | null;
  image?: string | null;
  createdAt: number;
  replyTo?: ReplyInfo | null;
}

const PASSWORDS: { [key: string]: string } = {
  "mumu123": "mumu",
  "bubu123": "bubu",
};

// Picsum image helper
const getNewsImage = (seed: number) => `https://picsum.photos/seed/${seed}/400/250`;

// placeholder NEWS_DATA
const NEWS_DATA = [
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
    content: "Maintaining a balanced, healthy lifestyle while navigating the demands of a persistent work-from-home environment continues to be a significant challenge for millions of professionals. Health experts strongly recommend adopting several key strategies: firstly, establishing a dedicated, distraction-free workspace; secondly, incorporating short, frequent stretching breaks every hour to mitigate the risks of prolonged sitting; and thirdly, making hydration and mindful eating an absolute priority. Crucially, a proper ergonomic setup—including chair height, monitor alignment, and keyboard positioning—is essential to prevent the chronic long-term musculoskeletal issues that are becoming increasingly common among sedentary remote workers." 
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
    content: "Stock exchanges throughout the Asia-Pacific region reported exceptionally strong gains in today’s trading session, effectively leading a tentative global recovery after a period of prolonged uncertainty. This powerful positive momentum is primarily driven by the release of unexpectedly robust manufacturing data and the continuation of government-backed fiscal stimuli packages designed specifically to boost post-pandemic consumer spending and regional investment. While risks remain, investors are cautiously optimistic about the potential for sustained economic growth in the region." 
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
    content: "New, highly detailed data beamed back from the specialized Mars rover mission provides the strongest and most compelling geological evidence yet of a vast area of ancient liquid water activity on the surface of the red planet. This extraordinary finding significantly elevates the estimated probability of past or even current subterranean microbial life, immediately prompting mission control to reroute the rover’s exploration path to conduct deeper subsurface sampling and analysis in the newly identified area of interest." 
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
    content: "Official economic growth projections for several major South American nations have been significantly revised downwards. This is primarily amid persistent, high-level inflation rates and continued, disruptive political instability within key countries. The region’s deep economic reliance on raw commodity exports makes it inherently vulnerable to global price fluctuations and sharp demand changes, compounding local challenges and making recovery harder to achieve quickly." 
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
    content: "Automotive researchers have proudly announced a significant, industry-changing breakthrough in Electric Vehicle (EV) battery technology, successfully achieving a new record for **energy density and charge capacity**. This powerful innovation promises to deliver dramatically longer driving ranges and significantly faster charging times for future EV models, effectively removing two of the largest remaining obstacles to widespread global electric vehicle adoption by consumers." 
  },
  { 
    title: "The Therapeutic Benefits of Yoga for Chronic Stress", 
    snippet: "Ancient practice, modern relief: The science of mindfulness...", 
    content: "The therapeutic, mind-body benefits of incorporating yoga into a regular routine for managing chronic stress, anxiety, and mild depression are being increasingly and consistently validated by numerous medical and psychological studies. Experts now strongly suggest that integrating mindful movement, controlled breathwork, and meditation into one's daily schedule can lead to substantial improvements in emotional regulation, overall mood, and long-term psychological health and resilience." 
  },
  { 
    title: "Massive Infrastructure Investment Package Approved by Legislature", 
    snippet: "Government spending plans target transportation, broadband, and energy grids...", 
    content: "A massive, multi-year government package dedicated to public **infrastructure spending** has been decisively approved by the legislature. The funds are earmarked for vital projects, including desperately needed upgrades to national transportation networks, the expansion of high-speed broadband access to rural areas, and the comprehensive modernization of the aging national power grid. These projects are collectively expected to inject billions into the economy and create millions of new jobs." 
  },
  { 
    title: "The Lucrative Resurgence of Retro Gaming and Nostalgia", 
    snippet: "Old consoles and cartridges are becoming highly valuable collector's items...", 
    content: "The global market for vintage video game consoles, classic cartridges, and original arcade cabinets is experiencing an unexpected, massive boom, primarily driven by powerful consumer nostalgia and dedicated collectors seeking ultra-rare or mint-condition items. Resale values for certain classic games and hardware systems are skyrocketing, transforming a former niche hobby into a surprisingly lucrative investment opportunity for dedicated enthusiasts and speculators alike." 
  },
  { 
    title: "Deep Sea Exploration Uncovers New Marine Life Ecosystems", 
    snippet: "Scientists discover dozens of unknown species thriving in extreme conditions...", 
    content: "A recent, highly complex deep-sea expedition has successfully uncovered dozens of entirely **previously unknown species** of marine life thriving in the crushing depths near hydrothermal vents on the ocean floor. These extraordinary discoveries offer invaluable new insights into the nature of extreme life forms, the potential for chemosynthesis-based food chains, and the vast, unexplored biodiversity of the planet's least-understood ecosystems, pushing the boundaries of biological science." 
  },
  { 
    title: "The Geopolitics of Rare Earth Minerals", 
    snippet: "Supply chain risks in critical technology components...", 
    content: "The global supply chain for rare earth minerals, which are absolutely vital for the production of everything from advanced smartphones and electric vehicle batteries to specialized military technology, is currently facing extreme geopolitical scrutiny. Nations are scrambling to diversify their sourcing and develop new, domestic processing capabilities to mitigate the inherent risks associated with relying heavily on a small number of dominant producer countries. This competition is driving massive investment in both new extraction techniques and complex deep-sea mining exploration efforts, fundamentally reshaping international trade negotiations and strategic alliances." 
  },
  { 
    title: "Advancements in Personalized Cancer Immunotherapy", 
    snippet: "Tailored treatments show promising results in clinical trials...", 
    content: "Researchers have announced groundbreaking success in Phase III clinical trials for a new form of personalized cancer immunotherapy. Unlike traditional methods, this innovative approach utilizes a patient's own immune cells, genetically engineered to specifically recognize and target unique tumor antigens, providing a highly tailored and less toxic treatment path. The primary results show significantly improved long-term survival rates for patients with certain hard-to-treat solid tumors, marking a major turning point in oncological science and offering new hope where few options previously existed." 
  },
  { 
    title: "Urban Planning Embraces '15-Minute City' Concept", 
    snippet: "Reimagining city life to promote local living and sustainability...", 
    content: "Forward-thinking urban planners across the globe are increasingly adopting the '15-Minute City' model, a concept centered on ensuring residents can access all their essential needs—work, shopping, education, and leisure—within a short 15-minute walk or bike ride from home. This shift aims to reduce reliance on personal automobiles, dramatically lower carbon emissions, and foster stronger, more localized community bonds. The implementation requires significant zoning reforms and investment in pedestrian infrastructure, facing resistance in sprawling, car-centric metropolitan areas." 
  },
  { 
    title: "Global Microchip Shortage Persists for Key Industries", 
    snippet: "Automotive and consumer electronics production still severely hampered...", 
    content: "The persistent global shortage of semiconductors, or microchips, continues to place immense pressure on manufacturing sectors worldwide, particularly the automotive and high-end consumer electronics industries. While some relief was anticipated, ongoing geopolitical tensions, pandemic-related factory disruptions, and a massive surge in demand for data center components have sustained the crisis. This enduring scarcity is forcing companies to redesign products, prioritize high-margin goods, and sign long-term supply contracts at elevated prices, fundamentally altering their business models." 
  },
  { 
    title: "The Rise of Specialized Digital Art Collectibles", 
    snippet: "Beyond NFTs: new digital asset classes emerge in the blockchain space...", 
    content: "Moving past the initial hype surrounding simple non-fungible tokens (NFTs), the digital collectibles market is rapidly evolving into a more specialized and sophisticated ecosystem. New asset classes, including fractionalized ownership of high-value digital land in metaverses and smart contract-backed intellectual property rights for media assets, are gaining traction. These financial instruments are attracting serious institutional investors who see blockchain technology as a robust ledger for digital ownership, pushing the boundaries of what constitutes 'art' and 'asset'." 
  },
  { 
    title: "Understanding the Global Shift to Four-Day Work Weeks", 
    snippet: "Trial results show increased productivity and employee well-being...", 
    content: "Pilot programs for the four-day work week conducted across multiple nations and various industries are yielding consistent, positive data that challenges traditional labor models. The results overwhelmingly demonstrate that condensing work hours into four days often leads to increased employee productivity, higher morale, significantly reduced burnout rates, and a lower environmental footprint due to less commuting. However, successful implementation requires careful process re-engineering and is generally more challenging for sectors requiring continuous, 24/7 service or physical presence, such as healthcare and manufacturing." 
  },
  { 
    title: "New Satellite Constellations Revolutionize Global Internet Access", 
    snippet: "Low-Earth Orbit satellites connect remote, underserved populations...", 
    content: "A new generation of massive Low-Earth Orbit (LEO) satellite constellations is rapidly changing the landscape of global internet connectivity. These networks are capable of delivering high-speed, low-latency broadband to the most remote and previously underserved populations on Earth, effectively bridging the stubborn digital divide. While these projects hold immense promise for global education and commerce, they also introduce challenges related to space debris, light pollution for astronomical research, and the complex international regulation of orbital traffic." 
  },
  { 
    title: "Forensic Science Advances with Next-Generation DNA Sequencing", 
    snippet: "Solving cold cases using cutting-edge genetic technology...", 
    content: "Forensic science labs are increasingly utilizing next-generation DNA sequencing and advanced genetic genealogy techniques to analyze highly degraded or minimal biological samples, leading to breakthroughs in previously unsolvable cold cases. This technology can extract far more comprehensive information than traditional methods, generating genetic profiles that can be cross-referenced with public and private genealogical databases. This powerful new tool is revolutionizing criminal justice but is also sparking intense ethical and legal debates regarding personal privacy and data security." 
  },
  { 
    title: "Sustainable Architecture Focuses on Self-Healing Concrete", 
    snippet: "Innovative building materials promise reduced maintenance and longevity...", 
    content: "The sustainable architecture movement is exploring innovative materials, with 'self-healing' concrete standing out as a major breakthrough. This specialized concrete incorporates dormant bacteria that, when exposed to moisture (as in a crack), activate to produce limestone, effectively repairing the fissure autonomously. This technology promises to dramatically extend the lifespan of infrastructure like bridges and tunnels, significantly reducing maintenance costs and the carbon footprint associated with repeated repair and replacement cycles in construction." 
  },
  { 
    title: "E-Commerce Giants Face Regulatory Scrutiny on Market Power", 
    snippet: "Antitrust investigations target digital platforms globally...", 
    content: "Major global e-commerce and digital marketplace giants are currently facing intense, multi-jurisdictional regulatory scrutiny and high-profile antitrust investigations. Governments are concerned about the platforms' dominant market power, their control over essential data, and the potential for anti-competitive behavior that harms smaller businesses and limits consumer choice. The outcomes of these pivotal legal battles are expected to fundamentally redefine the rules of digital commerce and the necessary regulatory oversight for technology monopolies worldwide." 
  },
  { 
    title: "The Environmental Impact of Fast Fashion and Waste Management", 
    snippet: "Textile waste crisis demands urgent, large-scale industry change...", 
    content: "The environmental fallout from the 'fast fashion' business model—characterized by low cost, rapid production cycles, and high consumer turnover—has reached a crisis point, contributing massively to global textile waste and pollution. Landfills are overwhelmed, and the production process is highly resource-intensive, requiring vast amounts of water and chemicals. Consumers are now actively seeking transparency, forcing brands to invest in circularity, robust recycling programs, and durable, high-quality material sourcing to try and mitigate their colossal ecological footprint." 
  },
  { 
    title: "Deep Learning Models Advance Climate Change Forecasting", 
    snippet: "AI provides higher accuracy for long-term weather and climate models...", 
    content: "Climatologists are increasingly integrating sophisticated deep learning and AI models to significantly enhance the accuracy and resolution of long-term climate change forecasts and extreme weather event predictions. These models can process immense datasets—including historical weather patterns, ocean currents, and atmospheric composition—faster and more efficiently than traditional methods. This breakthrough in computational power allows policymakers and disaster management teams to plan more effectively for mitigation and adaptation strategies needed to protect vulnerable populations and infrastructure." 
  },
  { 
    title: "New Discoveries in Microplastic Remediation Technology", 
    snippet: "Innovative methods developed to clean oceans and drinking water...", 
    content: "Researchers have achieved promising laboratory results with innovative new technologies aimed at removing pervasive microplastic particles from marine environments and urban drinking water supplies. Methods being explored include specialized magnetic nanoparticles that attract plastic fragments and bio-engineered enzymes designed to rapidly break down common plastic polymers. Scaling these solutions from the lab to effective, large-scale industrial deployment remains the primary technical and economic challenge, but the initial progress is highly encouraging for global clean-up efforts." 
  },
  { 
    title: "Decentralized Finance (DeFi) Faces Critical Regulatory Hurdles", 
    snippet: "Governments weigh risks and benefits of blockchain-based lending...", 
    content: "The rapidly expanding sector of decentralized finance (DeFi), built upon blockchain technology for lending, borrowing, and trading without traditional intermediaries, is now confronting critical, complex regulatory scrutiny worldwide. Governments and financial authorities are struggling to categorize these novel instruments, balancing the potential for innovation and financial inclusion against the significant risks of consumer fraud, systemic instability, and money laundering. Clear, standardized international regulation is widely viewed as essential for the long-term stability and mainstream adoption of DeFi services." 
  },
  { 
    title: "The Psychology of Misinformation Spread on Social Media", 
    snippet: "Why false stories go viral: cognitive and algorithmic factors...", 
    content: "New research into cognitive psychology and algorithmic structure reveals key reasons why misinformation and emotionally charged false narratives spread so rapidly and effectively across major social media platforms. Studies indicate that content designed to evoke high-arousal emotions, such as anger or surprise, is disproportionately favored by platform algorithms and is more likely to be shared by users, often regardless of its veracity. Understanding these fundamental psychological and technical mechanisms is crucial for developing effective societal countermeasures." 
  },
  { 
    title: "The Revival of Vocational and Trade Education", 
    snippet: "Skills gap drives new investment in technical training programs...", 
    content: "After decades of emphasis on four-year university degrees, there is a pronounced, global revival of interest and investment in vocational and trade education programs. This shift is being driven by a severe and growing skills gap in essential technical fields, including plumbing, electrical work, specialized welding, and precision manufacturing. Governments and industry partners are collaborating to modernize curricula and offer apprenticeship programs, recognizing the high demand and excellent earning potential in these critical, hands-on careers." 
  },
  { 
    title: "New Discoveries in High-Temperature Superconductivity", 
    snippet: "Potential energy revolution with zero-loss power transmission...", 
    content: "Physicists have achieved a significant, repeatable breakthrough in high-temperature superconductivity, creating a material that conducts electricity with zero energy loss at conditions closer to ambient temperatures than previously possible. If successfully scaled and stabilized for industrial use, this technology could completely revolutionize global power transmission, making the construction of highly efficient, zero-loss electrical grids a reality and drastically reducing energy consumption worldwide." 
  },
  { 
    title: "The Impact of Augmented Reality on Retail Shopping", 
    snippet: "Virtual try-ons and interactive displays transform the consumer experience...", 
    content: "Augmented Reality (AR) technology is rapidly moving beyond simple novelty and is fundamentally transforming the modern retail shopping experience for consumers. Features like virtual try-ons for clothing and makeup, interactive digital displays for visualizing furniture in one's home, and in-store navigation tools are making purchasing decisions more informed and engaging. This blend of physical and digital commerce is boosting conversion rates for retailers and providing consumers with a rich, personalized experience, redefining the future of brick-and-mortar stores." 
  },
  { 
    title: "The Growing Geopolitical Tension in the Arctic Region", 
    snippet: "Militarization and resource claims intensify as ice melts...", 
    content: "The accelerated melting of Arctic sea ice, driven by global climate change, is opening up new international shipping lanes and previously inaccessible vast natural resource deposits, thereby intensifying geopolitical tension among surrounding nations. Major powers are increasing their military presence, staking conflicting territorial claims, and debating the legal status of the Northwest Passage. The region, once a scientific frontier, is fast becoming a critical zone for economic competition and international strategic posturing." 
  },
  { 
    title: "New Therapeutic Targets for Alzheimer's Disease Identified", 
    snippet: "Researchers focus on non-amyloid mechanisms of neurological decline...", 
    content: "Alzheimer's research is undergoing a significant paradigm shift, with scientists increasingly focusing on non-amyloid and non-tau protein mechanisms, such as neuroinflammation and metabolic dysfunction, as novel therapeutic targets. Recent laboratory breakthroughs involving gene editing and specialized small molecules have shown promise in slowing the progression of neurodegeneration in animal models. This new focus offers renewed optimism for developing genuinely effective treatments and prevention strategies for this devastating neurological disorder." 
  },
  { 
    title: "The Evolution of Ransomware Tactics and Enterprise Defense", 
    snippet: "Cybercriminals shift from simple encryption to 'double extortion' schemes...", 
    content: "The landscape of cybercrime, particularly concerning ransomware, is evolving at an alarming rate, moving beyond simple data encryption to sophisticated 'double extortion' schemes. Cybercriminals now commonly exfiltrate sensitive data before encrypting a network, threatening to publish the stolen information if the ransom is not paid, thereby dramatically increasing pressure on victim organizations. Enterprises are responding by adopting zero-trust architectures, investing in AI-driven threat detection, and prioritizing robust, air-gapped data backup strategies." 
  },
  { 
    title: "The Renaissance of Independent Music and Digital Distribution", 
    snippet: "Artists bypass major labels with direct-to-fan platforms...", 
    content: "The independent music scene is experiencing a robust renaissance, largely fueled by the proliferation of powerful, direct-to-fan digital distribution platforms and creator monetization tools. Artists are increasingly able to bypass traditional major record labels, retaining greater creative control and a larger share of their revenue by directly engaging with their global fan base. This trend is fostering a more diverse and experimental musical landscape, challenging the historical gatekeepers of the entertainment industry." 
  },
  { 
    title: "Impact of Lithium Extraction on Local Water Resources", 
    snippet: "The environmental cost of powering the electric vehicle boom...", 
    content: "The rapid global transition to electric vehicles (EVs) is driving unprecedented demand for lithium, a key component in EV batteries, but the extraction methods are raising significant environmental and ethical concerns. Large-scale lithium mining, particularly brine extraction, requires vast amounts of water in already arid regions, placing intense strain on local water resources and fragile ecosystems. Producers are under pressure from activists and regulators to develop and adopt more sustainable, closed-loop extraction methods to mitigate this crucial environmental impact." 
  },
  { 
    title: "AI Chatbots Enter University Classrooms and Academic Integrity Debates", 
    snippet: "Educators grapple with the reality of generative text tools...", 
    content: "The widespread availability and increasing sophistication of generative AI chatbots have created a profound challenge for academic integrity across university campuses worldwide. Educators are grappling with how to assess student work when tools can produce complex essays and code within seconds. Institutions are urgently revising curricula, moving away from traditional take-home essays toward in-class, verbally-defended, or creative, problem-solving assignments that require critical thinking AI models cannot yet replicate, while also exploring new AI detection software." 
  },
  { 
    title: "New Treaty Framework Proposed for Space Traffic Management", 
    snippet: "International body addresses orbital debris and collision risks...", 
    content: "The escalating number of satellite launches, particularly those involving massive LEO constellations, has created a severe risk of catastrophic orbital collisions and the production of uncontrollable space debris. An international working group has proposed a comprehensive new treaty framework aimed at standardizing launch procedures, mandating end-of-life de-orbiting plans, and creating an independent global body for real-time space traffic management. Securing consensus among leading spacefaring nations remains a complex diplomatic hurdle." 
  },
  { 
    title: "The Growing Popularity of Non-Alcoholic Spirits and Beverages", 
    snippet: "Wellness trend drives innovation in the sober drinking industry...", 
    content: "Driven by a sustained global focus on personal wellness, mindful consumption, and holistic health, the market for high-quality non-alcoholic spirits, wines, and beers is experiencing explosive growth. Consumers are seeking complex, adult flavor profiles without the effects of alcohol, prompting distillers and beverage companies to invest heavily in innovative de-alcoholization and specialized botanical extraction techniques. This sector is successfully rebranding 'sobriety' as a stylish, health-conscious lifestyle choice." 
  },
  { 
    title: "Advancements in Drone Technology for Logistics and Delivery", 
    snippet: "Last-mile supply chain logistics transformed by autonomous aerial vehicles...", 
    content: "Autonomous drone technology is rapidly maturing and is poised to completely transform 'last-mile' logistics, particularly in crowded urban environments and hard-to-reach rural areas. Companies are now moving from small-scale testing to establishing dedicated drone hubs and automated flight corridors for package delivery. Key challenges still include securing complex regulatory approval for Beyond Visual Line of Sight (BVLOS) operation, ensuring air traffic safety, and developing robust security protocols to prevent package theft and malicious interference." 
  },
  { 
    title: "The Financialization of Farmland and Global Food Security", 
    snippet: "Institutional investors change the nature of agricultural land ownership...", 
    content: "Institutional investors and large private equity funds are increasingly acquiring vast tracts of productive farmland globally, viewing it as a robust, inflation-proof tangible asset. This financialization of agriculture is sparking intense debate among policymakers and farmers regarding its potential impact on local food security, long-term environmental sustainability, and the ability of small family farms to compete. Regulatory bodies are examining measures to ensure that essential food production remains the priority over pure capital gains." 
  },
  { 
    title: "Breakthrough in Fusion Energy Ignition Point Confirmed", 
    snippet: "Scientists achieve sustained energy gain in magnetic confinement reactor...", 
    content: "In a landmark scientific achievement, a leading international research collaboration has confirmed that they have successfully reached and sustained the critical 'ignition' point in a magnetic confinement fusion reactor. For the first time, the fusion reaction produced more energy than was required to start the process, demonstrating a net energy gain. While commercially viable fusion power remains years away, this crucial proof-of-concept milestone revitalizes the prospect of a virtually limitless, clean energy source for future generations." 
  },
  { 
    title: "Ethical Concerns Rise Over Deepfake Audio Technology", 
    snippet: "Voice cloning used for sophisticated fraud and political disinformation...", 
    content: "The rapid development and accessibility of high-quality deepfake audio technology, capable of cloning an individual’s voice with startling accuracy from only a few seconds of sample audio, is raising profound ethical and security concerns. This technology is increasingly being leveraged by criminals for sophisticated voice-phishing fraud and by political actors for creating highly deceptive and persuasive disinformation campaigns. Governments and tech companies are urgently seeking solutions, including digital watermarking and biometric verification tools, to counter this evolving threat." 
  },
  { 
    title: "The Transformation of Healthcare through Remote Patient Monitoring", 
    snippet: "Wearable devices and AI analyze health data in real-time...", 
    content: "Remote Patient Monitoring (RPM) technology, which utilizes connected wearable devices and advanced AI algorithms to track vital health metrics like heart rate, glucose levels, and activity patterns in real-time, is fundamentally transforming healthcare delivery. This allows physicians to proactively intervene before a crisis occurs, significantly reducing hospital readmissions and improving outcomes for patients with chronic conditions. The next generation of RPM promises to fully integrate genetic data for highly personalized predictive healthcare." 
  },
  { 
    title: "Supply Chain Resilience Prioritized by Global Corporations", 
    snippet: "Shifting from 'just-in-time' to 'just-in-case' inventory strategies...", 
    content: "Following years of disruption from global events, major international corporations are fundamentally rethinking their supply chain strategies, pivoting away from the highly efficient 'just-in-time' model toward a more robust 'just-in-case' approach. This means prioritizing resilience, redundancy, and geographical diversification over absolute minimum cost. Companies are investing in localized manufacturing, building larger stockpiles of critical components, and using AI to map and predict risk factors in their global logistics networks." 
  },
  { 
    title: "New Archaeological Discoveries Challenge Early Human Migration Routes", 
    snippet: "Evidence found in unexpected locations rewrites history textbooks...", 
    content: "Recent archaeological excavations in unexpected, geographically isolated regions have uncovered compelling evidence that challenges the long-held consensus on the timeline and primary routes of early human migration out of Africa. Artifacts and ancient DNA analysis suggest multiple, distinct waves of migration occurred far earlier and followed more complex, circuitous paths than previously theorized. This major discovery is prompting a comprehensive reevaluation of anthropological textbooks and models of human dispersal across the globe." 
  }
];

function NewsFeed({ sessionNews, imageSeeds, darkMode, setDarkMode, setAuthenticated }: any) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  


  return (
    <>
      <div className="news-top-bar">
        Top News
        <span className="menu-icon" onClick={() => setShowMenu((s) => !s)}>☰</span>
        {showMenu && (
          <div className="menu-dropdown" ref={menuRef}>
            <div onClick={() => { setAuthenticated(false); setShowMenu(false); }}>Logout</div>
            <div onClick={() => setDarkMode((prev: boolean) => !prev)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </div>
            <div>Profile</div>
            <div>Settings</div>
          </div>
        )}
      </div>

      <div className="news-feed">
        {sessionNews.map((card: any, idx: number) => (
          <div key={idx} className="news-card" onClick={() => navigate(`/news/${idx}`)}>
            <img src={getNewsImage(imageSeeds[idx])} alt="news" className="news-image" />
            <h3>{card.title}</h3>
            <p>{card.snippet}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function NewsDetail({ sessionNews, imageSeeds, username }: any) {
  const { id } = useParams();
  const idx = Number(id);
  const navigate = useNavigate();
  const isPrivateChatCard = idx === 8; // 9th card index

  const [chatVisible, setChatVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyInfo | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const screenEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement | null>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement | null>(null);
  
  const lastTypingRef = useRef<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // ---------- WebSocket ----------
// ---------- WebSocket with auto-reconnect & message queue ----------
const [loadingMessages, setLoadingMessages] = useState(true); // NEW: show loading
const messageQueue = useRef<Message[]>([]); // NEW: queue for messages that can't be sent
const reconnectTimer = useRef<number | null>(null);
 // NEW: auto-reconnect timer

useEffect(() => {
  let wsAlive = true; // flag to avoid multiple connects

  const connectWs = () => {
    if (!wsAlive) return;

    ws.current = new WebSocket("wss://mubu-backend-rpx8.onrender.com");

    ws.current.onopen = () => {
      // login
      ws.current?.send(JSON.stringify({ type: "login", username }));

      // flush queued messages
      messageQueue.current.forEach((m) => ws.current?.send(JSON.stringify(m)));
      messageQueue.current = [];
      setLoadingMessages(false); // first batch can now show
    };

    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "online-users") setOnlineUsers(parsed.users);

        if (parsed.type === "message") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === parsed.id)) return prev;
            return [...prev, parsed];
          });
          setLoadingMessages(false); // hide loading once first message arrives
        }

        if ((parsed as any).type === "typing" && (parsed as any).sender !== username) {
          const sender = (parsed as any).sender ?? null;
          setTypingUser(sender);
          clearTimeout(lastTypingRef.current as unknown as number); // NEW: cancel previous timeout
          lastTypingRef.current = setTimeout(() => setTypingUser(null), 2000) as unknown as number;
        }
      } catch {}
    };

    ws.current.onclose = () => {
      // attempt reconnect after 2s
      reconnectTimer.current = setTimeout(connectWs, 2000);
    };

    ws.current.onerror = () => {
      ws.current?.close(); // trigger onclose to reconnect
    };
  };

  connectWs();

  // cleanup
  return () => {
    wsAlive = false;
    ws.current?.close();
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
  };
}, [username]);

  useEffect(() => {
      const scrollToBottom = () => {
    if (screenEndRef.current && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      screenEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
    
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages,loadingMessages]);

  if (!sessionNews[idx]) return <p>Invalid news item.</p>;

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

// ---------- Handle send with queue ----------
const handleSend = () => {
  if (!newMessage.trim() && !imageFile) return;
  const tempId = crypto.randomUUID();

  const doSend = (imgData?: string | null) => {
    const messageToSend: Message & { type: string } = {
      type: "message",
      id: editingMessageId ?? tempId,
      sender: username,
      text: newMessage.trim() ? newMessage.trim() : null,
      image: imgData ?? null,
      createdAt: editingMessageId
        ? messages.find((m) => m.id === editingMessageId)?.createdAt || Date.now()
        : Date.now(),
      replyTo: replyTo ?? null,
    };

    if (editingMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessageId ? { ...m, text: messageToSend.text, image: messageToSend.image } : m
        )
      );
      setEditingMessageId(null);
    } else {
      setMessages((prev) => [...prev, messageToSend]);

      // NEW: send or queue if WS not open
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageToSend));
      } else {
        messageQueue.current.push(messageToSend);
      }
    }

    setNewMessage("");
    setImageFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setReplyTo(null);
    setShowMediaMenu(false);
  };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = () => doSend(reader.result as string);
    reader.readAsDataURL(imageFile);
  } else doSend(null);
};


  const onFileSelected = (file?: File | null) => {
    if (!file) return;
    if (previewUrl) try { URL.revokeObjectURL(previewUrl); } catch {}
    setPreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
    setShowMediaMenu(false);
  };

  const openCamera = () => { setShowMediaMenu(false); fileInputCameraRef.current?.click(); };
  const openGallery = () => { setShowMediaMenu(false); fileInputGalleryRef.current?.click(); };

  const shouldRenderMessage = (m: Message) => Boolean((m.text && m.text.trim()) || m.image);

  // ---------- Typing indicator throttle ----------
  const handleTyping = () => {
    const now = Date.now();
    if (ws.current?.readyState === WebSocket.OPEN && now - lastTypingRef.current > 1500) {
      ws.current.send(JSON.stringify({ type: "typing", sender: username }));
      lastTypingRef.current = now;
    }
  };
  
  useEffect(() => {
    if (replyTo) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      screenEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      
    }
    
  }, [replyTo]);

  

  return (
    <div className="news-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <img src={getNewsImage(imageSeeds[idx])} alt="news" className="news-detail-image" />
      <h2>{sessionNews[idx].title}</h2>
      <p>{sessionNews[idx].content}</p>

      {isPrivateChatCard && (
        <>
          {!chatVisible && (
            <div className="chat-unhide-wrap-inline">
              <button className="chat-unhide-btn" onClick={() => setChatVisible(true)} title="Unhide chat">🔓</button>
            </div>
          )}
          {chatVisible && (
            <div className="chat-container">
              <button className="chat-hide-btn" onClick={() => setChatVisible(false)} title="Hide chat">🔒</button>
              <div className="chat-box">
                {loadingMessages && <div className="loading-messages">Loading messages...</div>}
                

                {messages.map((msg) => {
                  const isMe = msg.sender === username;
                  if (!shouldRenderMessage(msg)) return null;

                  return (
                    <div key={msg.id} className={`message-group ${isMe ? "me" : msg.sender}`}>
                      {!isMe && (
                        <div className={`avatar message-avatar ${onlineUsers.includes(msg.sender) ? "online" : ""}`}>
                          {msg.sender[0].toUpperCase()}
                        </div>
                      )}
                      <div className="message-content-wrapper">
                        <div className="message-content">
                          {msg.replyTo && msg.replyTo.text && (
                            <div className="reply-preview-inside">
                              <div className="reply-bar" />
                              <div className="reply-text">{msg.replyTo.text}</div>
                            </div>
                          )}
                          <div className={`message ${isMe ? "me" : msg.sender}`}>
                            {msg.text && <div>{msg.text}</div>}
                            {msg.image && (
                              <img
                                src={msg.image ?? undefined}
                                alt="sent"
                                className="chat-image"
                                onClick={() => setEnlargedImage(msg.image ?? null)}
                              />
                            )}
                          </div>

                          <div className="message-buttons-wrapper">
                            {isMe && (
                              <div className="left-buttons">
                                <button
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMessageId(msg.id ?? null);
                                    setNewMessage(msg.text ?? "");
                                    if (msg.image) setPreviewUrl(msg.image);
                                  }}
                                  title="Edit"
                                >✏️</button>
                                <button
                                  className="delete-btn"
                                  onClick={() => setMessages((prev) => prev.filter((m) => m.id !== msg.id))}
                                  title="Delete"
                                >🚮</button>
                              </div>
                            )}
                            <div className="right-buttons">
                              <button
                                className="reply-btn"
                                onClick={() => setReplyTo({ id: msg.id, text: msg.text ?? (msg.image ? "Image" : "") })}
                                title="Reply"
                              >↩️</button>
                            </div>
                          </div>

                          <div className={`message-time ${isMe ? "time-right" : "time-left"}`}>{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typingUser && <div className="typing-indicator">{typingUser}...</div>}
                <div ref={chatEndRef} />
                
              </div>
              
              {replyTo && replyTo.text && (
                <div className="replying-bar">
                  <div className="replying-text">{replyTo.text}</div>
                  <button className="reply-cancel" onClick={() => setReplyTo(null)} title="Cancel reply">×</button>
                </div>
              )}

              <div className="input-area">
                
                <div className="input-box" onClick={() => setShowMediaMenu(false)}>
                  {previewUrl && (
                    <div className="image-preview">
                      <img src={previewUrl} alt="preview" />
                      <button
                        className="remove-preview"
                        onClick={() => { try { URL.revokeObjectURL(previewUrl); } catch {} setImageFile(null); setPreviewUrl(null); }}
                        title="Remove"
                      >×</button>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <div className="input-icons">
                    <div
                      className="camera-btn"
                      onClick={(e) => { e.stopPropagation(); setShowMediaMenu((s) => !s); }}
                      title="Choose image"
                    >📸</div>
                    {showMediaMenu && (
                      <div className="media-bubble" onClick={(e) => e.stopPropagation()}>
                        <div className="media-item" onClick={openCamera}>📸 Camera</div>
                        <div className="media-item" onClick={openGallery}>🖼️ Gallery</div>
                      </div>
                    )}
                    <button className="send-btn" onClick={handleSend} title="Send">🚀</button>
                  </div>
                </div>

                <input
                  ref={fileInputCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileSelected(file); e.currentTarget.value = ""; }}
                />
                <input
                  ref={fileInputGalleryRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileSelected(file); e.currentTarget.value = ""; }}
                />
              </div>
            </div>
            
          )}
          <div ref={screenEndRef} />
        </>
      )}
      {enlargedImage && (
        <div className="modal" onClick={() => setEnlargedImage(null)}>
          <img src={enlargedImage} alt="enlarged" className="modal-image" />
        </div>
      )}
      
    </div>
  );
  
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [sessionNews, setSessionNews] = useState<typeof NEWS_DATA>([]);
  const [imageSeeds, setImageSeeds] = useState<number[]>([]);

  useEffect(() => {
    if (!authenticated) return;
    const shuffled = [...NEWS_DATA].sort(() => 0.5 - Math.random());
    const newsCount = Math.min(NEWS_DATA.length, 10);
    setSessionNews(shuffled.slice(0, newsCount));
    setImageSeeds(Array.from({ length: newsCount }, () => Math.floor(Math.random() * 1000)));
  }, [authenticated]);

  const handleLogin = () => {
    if (PASSWORDS[password]) {
      setUsername(PASSWORDS[password]);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!authenticated) {
    return (
      <div className="login">
        <div className="login-box">
          <img src="/jujo.jpg" alt="Logo" className="login-logo" />
          <div style={{ textAlign: "center", marginBottom: 10, color: "#007bff", fontWeight: 500 }}>
            Login for 24 hours updated news
          </div>
          <h2>Enter Passcode</h2>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Enter</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={darkMode ? "app dark-mode" : "app"}>
        <Routes>
          <Route
            path="/"
            element={
              <NewsFeed
                sessionNews={sessionNews}
                imageSeeds={imageSeeds}
                username={username}
                authenticated={true}
                setAuthenticated={setAuthenticated}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
          <Route
            path="/news/:id"
            element={<NewsDetail sessionNews={sessionNews} imageSeeds={imageSeeds} username={username} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
