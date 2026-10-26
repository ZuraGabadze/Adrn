import { Language } from '../data/types';

export interface TranslationDictionary {
  nav: {
    home: string;
    gamemodes: string;
    ranks: string;
    join: string;
    staff: string;
    faq: string;
    discord: string;
    language: string;
    sound: string;
    playNow: string;
    admin: string;
  };
  loader: {
    buildingTerrain: string;
    loadingChunks: string;
    skip: string;
    tips: string[];
  };
  hero: {
    javaBadge: string;
    subtitle: string;
    copyIpCta: string;
    exploreRanksCta: string;
    scrollPrompt: string;
    bpmLabel: string;
    playersOnline: string;
    serverStatus: string;
    pingLabel: string;
    versionLabel: string;
    clickToCopy: string;
    splashes: string[];
  };
  stats: {
    liveTicker: string;
    onlinePlayers: string;
    activeMode: string;
    tpsStatus: string;
    nextEvent: string;
    recentBuyers: string;
  };
  gamemodes: {
    sectionTag: string;
    sectionTitle: string;
    sectionDesc: string;
    oneblockTab: string;
    smpTab: string;
    phasesTitle: string;
    worldSpecsTitle: string;
    worldSize: string;
    pvpRules: string;
    economy: string;
    raiding: string;
    mineInteractiveTitle: string;
    mineInteractiveHint: string;
    blocksMined: string;
    currentPhase: string;
    lastDrop: string;
    smpMapTitle: string;
    smpMapHint: string;
  };
  ranks: {
    sectionTag: string;
    sectionTitle: string;
    sectionDesc: string;
    lifetimeBadge: string;
    priceLabel: string; // KA: "ფასი"
    commandsLabel: string; // KA: "რანკის კომანდები"
    kitsLabel: string; // KA: "რანკის კიტები"
    incomeBoostLabel: string; // KA: "შემოსავლის ბუსტი"
    chatPrefixLabel: string; // KA: "ჩათ პრეფიქსი"
    includesTemplate: string; // KA: "ყველა {rank} რანკის კომანდები და შესაძლებლობები"
    newInThisTier: string;
    inheritedFrom: string;
    showInherited: string;
    hideInherited: string;
    buyRankCta: string;
    compareAllCta: string;
    hideCompareCta: string;
    featureMatrix: string;
    CopyCommandHint: string;
    commandCopied: string;
    kitClaimHint: string;
    incomeCalcTitle: string;
    incomeCalcBaseLabel: string;
    incomeCalcPerHour: string;
    chatPreviewTitle: string;
    chatPreviewInputPlaceholder: string;
    chatPreviewShowAll: string;
    chatPreviewSingle: string;
    upgradeCalcTitle: string;
    upgradeFromLabel: string;
    upgradeToLabel: string;
    upgradePayDiff: string;
    upgradeNowCta: string;
    commandExplorerTitle: string;
    commandExplorerSearch: string;
    worksOnBoth: string;
  };
  staff: {
    sectionTag: string;
    sectionTitle: string;
    sectionDesc: string;
    ownersWing: string;
    devsWing: string;
    replayPose: string;
    poseTimeline: string;
    favoriteBlock: string;
    skinLiveBadge: string;
    staffPass: string;
  };
  join: {
    sectionTag: string;
    sectionTitle: string;
    sectionDesc: string;
    javaOnlyNotice: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    serverNameField: string;
    serverAddressField: string;
    copyIpButton: string;
    faqTitle: string;
  };
  checkout: {
    modalTitle: string;
    step1Player: string;
    step2Coupon: string;
    step3Confirm: string;
    mcUsernameLabel: string;
    mcUsernamePlaceholder: string;
    usernameHint: string;
    upgradeToggleLabel: string;
    currentRankSelect: string;
    couponLabel: string;
    couponPlaceholder: string;
    applyCoupon: string;
    couponApplied: string;
    couponInvalid: string;
    summaryRank: string;
    summarySubtotal: string;
    summaryUpgradeCredit: string;
    summaryDiscount: string;
    summaryTotal: string;
    completePurchase: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    luckPermsLabel: string;
    closeModal: string;
  };
  toasts: {
    advancementMade: string;
    challengeComplete: string;
    goalReached: string;
    ipCopiedTitle: string;
    ipCopiedSub: string;
    rankSelectedTitle: string;
    commandCopiedTitle: string;
    konamiTitle: string;
    konamiSub: string;
    prMergedTitle: string;
    prMergedSub: string;
    blockMinedTitle: string;
    blockMinedSub: string;
  };
  footer: {
    disclaimer: string;
    rights: string;
    quickLinks: string;
    connectDiscord: string;
    adminHint: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      gamemodes: 'Modes',
      ranks: 'Ranks',
      join: 'Join',
      staff: 'Staff',
      faq: 'FAQ',
      discord: 'Discord',
      language: 'Lang',
      sound: 'Audio',
      playNow: 'PLAY NOW',
      admin: 'Admin',
    },
    loader: {
      buildingTerrain: 'Building terrain...',
      loadingChunks: 'Generating ADRENALINEE spawn chunks',
      skip: 'Skip Intro [ESC]',
      tips: [
        'Tip: Click adrenalinee.run anywhere to copy the server IP and collect XP orbs!',
        'Tip: OBSIDIAN rank grants 2.00x (+100%) income boost and /repair all!',
        'Tip: Press keys 1-9 on your keyboard to switch hotbar sections!',
      ],
    },
    hero: {
      javaBadge: 'MINECRAFT JAVA EDITION • 1.20.4 – 1.21.x',
      subtitle: 'High-voltage OneBlock & Competitive SMP. Climb 5 crystal ranks from EMERALD to OBSIDIAN.',
      copyIpCta: 'COPY IP: ADRENALINEE.RUN',
      exploreRanksCta: 'BROWSE RANKS (₾)',
      scrollPrompt: 'SCROLL TO ACCELERATE BPM',
      bpmLabel: 'HEART RATE',
      playersOnline: 'PLAYERS ONLINE',
      serverStatus: 'JAVA SERVER LIST',
      pingLabel: '20.0 TPS • 14ms',
      versionLabel: 'Java 1.21.x',
      clickToCopy: 'Click server entry to copy IP',
      splashes: [
        'Feel the rush!',
        'Now in ₾ GEL!',
        'OneBlock + SMP!',
        'Java Edition Only!',
        '2.00x Obsidian Boost!',
        '20.0 Locked TPS!',
      ],
    },
    stats: {
      liveTicker: 'SERVER TELEMETRY',
      onlinePlayers: 'Online Players',
      activeMode: 'Gamemodes',
      tpsStatus: 'Tick Rate',
      nextEvent: 'Next Warzone Crate',
      recentBuyers: 'Recent Store Unlocks',
    },
    gamemodes: {
      sectionTag: '01 // REALMS OF ADRENALINEE',
      sectionTitle: 'TWO WORLDS. ZERO LIMITS.',
      sectionDesc: 'Switch between our 6-phase evolutionary OneBlock sky realm and our 25,000-block economy SMP.',
      oneblockTab: 'ONEBLOCK',
      smpTab: 'SURVIVAL SMP',
      phasesTitle: 'ONEBLOCK EVOLUTION PHASES',
      worldSpecsTitle: 'SMP WORLD SPECIFICATIONS',
      worldSize: 'World Border',
      pvpRules: 'Combat Status',
      economy: 'Economy Engine',
      raiding: 'Claim Protection',
      mineInteractiveTitle: 'INTERACTIVE ONEBLOCK MINER',
      mineInteractiveHint: 'Click repeatedly on the center block to crack & mine it through all 6 phases!',
      blocksMined: 'Blocks Mined',
      currentPhase: 'Active Phase',
      lastDrop: 'Latest Drop',
      smpMapTitle: 'ISOMETRIC SMP CLAIM & SHOP MAP',
      smpMapHint: 'Hover over chunks to inspect Protected Claims, Spawn Plaza, and Player Chest Shops.',
    },
    ranks: {
      sectionTag: '02 // SERVER STORE & PERKS',
      sectionTitle: 'CHOOSE YOUR RANK',
      sectionDesc: 'All ranks are lifetime unlocks in Georgian Lari (₾) and work simultaneously on both OneBlock and SMP.',
      lifetimeBadge: 'LIFETIME UNLOCK',
      priceLabel: 'Price',
      commandsLabel: 'Rank Commands',
      kitsLabel: 'Rank Kits',
      incomeBoostLabel: 'Income Boost',
      chatPrefixLabel: 'Chat Prefix',
      includesTemplate: 'All {rank} rank commands and abilities',
      newInThisTier: 'NEW IN THIS TIER',
      inheritedFrom: 'INHERITED FROM LOWER RANKS',
      showInherited: 'Show all {count} inherited commands',
      hideInherited: 'Hide inherited commands',
      buyRankCta: 'UNLOCK RANK',
      compareAllCta: 'OPEN FULL RANK COMPARISON MATRIX',
      hideCompareCta: 'HIDE COMPARISON MATRIX',
      featureMatrix: 'COMPLETE CUMULATIVE COMMAND & PERK MATRIX',
      CopyCommandHint: 'Click to copy command',
      commandCopied: 'Copied command',
      kitClaimHint: 'Claim in-game via',
      incomeCalcTitle: 'INTERACTIVE INCOME BOOST CALCULATOR',
      incomeCalcBaseLabel: 'Your Base Hourly Grind',
      incomeCalcPerHour: 'coins / hr',
      chatPreviewTitle: 'LIVE MINECRAFT CHAT PREVIEW',
      chatPreviewInputPlaceholder: 'Enter your Minecraft username...',
      chatPreviewShowAll: 'Compare All 5 Ranks',
      chatPreviewSingle: 'Selected Rank Only',
      upgradeCalcTitle: 'RANK UPGRADE CALCULATOR (PAY DIFFERENCE ONLY)',
      upgradeFromLabel: 'Current Rank',
      upgradeToLabel: 'Target Rank',
      upgradePayDiff: 'Upgrade Price',
      upgradeNowCta: 'UPGRADE NOW',
      commandExplorerTitle: 'SERVER COMMAND EXPLORER (18 COMMANDS)',
      commandExplorerSearch: 'Search commands (e.g. /fly, /repair, anvil)...',
      worksOnBoth: 'Works on OneBlock & SMP',
    },
    staff: {
      sectionTag: '03 // THE ARCHITECTS',
      sectionTitle: '3D STAFF SHOWCASE',
      sectionDesc: 'Meet the Owners and Developers behind ADRENALINEE, rendered live in 3D with their real Minecraft Java skins and synchronized poses.',
      ownersWing: 'WING I // SERVER OWNERS (DUO SYNC)',
      devsWing: 'WING II // CORE DEVELOPERS (LIVE COMPILE)',
      replayPose: 'Replay Pose Sequence',
      poseTimeline: 'ACTIVE POSE',
      favoriteBlock: 'Signature Block',
      skinLiveBadge: 'LIVE JAVA SKIN',
      staffPass: 'OFFICIAL STAFF PASS',
    },
    join: {
      sectionTag: '04 // CONNECT TO SERVER',
      sectionTitle: 'HOW TO JOIN (JAVA EDITION)',
      sectionDesc: 'ADRENALINEE is an exclusive Minecraft Java Edition network. Follow these 4 steps to jump straight in.',
      javaOnlyNotice: 'JAVA EDITION 1.20.4 – 1.21.x ONLY',
      step1Title: '1. Launch Java Edition',
      step1Desc: 'Open the official Minecraft Launcher and start Java Edition 1.20.4 – 1.21.x.',
      step2Title: '2. Open Multiplayer',
      step2Desc: 'Click "Multiplayer" on the title screen, then click "Add Server" at the bottom.',
      step3Title: '3. Paste Server Address',
      step3Desc: 'Enter ADRENALINEE as the name and paste adrenalinee.run into Server Address.',
      step4Title: '4. Click Done & Join!',
      step4Desc: 'Double-click the ADRENALINEE server slot to spawn in the hub and choose OneBlock or SMP.',
      serverNameField: 'Server Name',
      serverAddressField: 'Server Address',
      copyIpButton: 'Copy Server Address (adrenalinee.run)',
      faqTitle: 'FREQUENTLY ASKED QUESTIONS',
    },
    checkout: {
      modalTitle: 'CHEST STORE CHECKOUT',
      step1Player: '1. Java Username',
      step2Coupon: '2. Upgrade / Coupon',
      step3Confirm: '3. Instant Delivery',
      mcUsernameLabel: 'Minecraft Java Username',
      mcUsernamePlaceholder: 'e.g. Saito',
      usernameHint: 'Case-sensitive Java username (3–16 characters). Skin loads automatically.',
      upgradeToggleLabel: 'I already own a rank (Upgrade & pay difference)',
      currentRankSelect: 'Select your current rank',
      couponLabel: 'Promo / Creator Code',
      couponPlaceholder: 'Try RUSH10 or GEORGIA15',
      applyCoupon: 'APPLY',
      couponApplied: 'Discount code applied!',
      couponInvalid: 'Invalid or expired code',
      summaryRank: 'Selected Rank',
      summarySubtotal: 'Base Price',
      summaryUpgradeCredit: 'Current Rank Credit',
      summaryDiscount: 'Promo Discount',
      summaryTotal: 'Total Due',
      completePurchase: 'COMPLETE UNLOCK',
      orderSuccessTitle: 'ADVANCEMENT MADE: RANK UNLOCKED!',
      orderSuccessDesc: 'Your LuckPerms rank package has been queued for instant execution on OneBlock & SMP.',
      luckPermsLabel: 'Executed Server Console Command:',
      closeModal: 'RETURN TO SERVER',
    },
    toasts: {
      advancementMade: 'Advancement Made!',
      challengeComplete: 'Challenge Complete!',
      goalReached: 'Goal Reached!',
      ipCopiedTitle: 'Copied the IP!',
      ipCopiedSub: 'adrenalinee.run ready to paste',
      rankSelectedTitle: 'Inspecting Rank',
      commandCopiedTitle: 'Command Copied!',
      konamiTitle: 'Overdrive Secret Found!',
      konamiSub: '240 BPM Crying Obsidian Mode Activated',
      prMergedTitle: 'Pull Request Merged!',
      prMergedSub: 'Jajo_1121 & godkissed shipped a build',
      blockMinedTitle: 'Phase Block Broken!',
      blockMinedSub: 'OneBlock regenerated with fresh loot',
    },
    footer: {
      disclaimer: 'Not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Synergies AB.',
      rights: '© 2025 ADRENALINEE Network (adrenalinee.run). All rights reserved.',
      quickLinks: 'HOTBAR NAVIGATION',
      connectDiscord: 'JOIN DISCORD COMMUNITY',
      adminHint: 'Staff Control Panel (#admin or Ctrl+Shift+A)',
    },
  },
  ka: {
    nav: {
      home: 'მთავარი',
      gamemodes: 'რეჟიმები',
      ranks: 'რანკები',
      join: 'შემოსვლა',
      staff: 'სტაფი',
      faq: 'კითხვები',
      discord: 'დისქორდი',
      language: 'ენა',
      sound: 'ხმა',
      playNow: 'ითამაშე',
      admin: 'ადმინი',
    },
    loader: {
      buildingTerrain: 'სამყაროს გენერაცია...',
      loadingChunks: 'იტვირთება ADRENALINEE-ს ჩანკები',
      skip: 'გამოტოვება [ESC]',
      tips: [
        'რჩევა: დააწკაპუნეთ adrenalinee.run-ზე IP-ის დასაკოპირებლად!',
        'რჩევა: OBSIDIAN რანკი გაძლევთ 2.00x (+100%) შემოსავლის ბუსტს და /repair all-ს!',
        'რჩევა: გამოიყენეთ კლავიშები 1-9 ჰოთბარის სექციებზე გადასასვლელად!',
      ],
    },
    hero: {
      javaBadge: 'MINECRAFT JAVA EDITION • 1.20.4 – 1.21.x',
      subtitle: 'უმაღლესი დონის OneBlock და SMP სერვერი. 5 უნიკალური რანკი EMERALD-იდან OBSIDIAN-მდე.',
      copyIpCta: 'IP-ის კოპირება: ADRENALINEE.RUN',
      exploreRanksCta: 'რანკების ნახვა (₾)',
      scrollPrompt: 'ჩამოსქროლეთ პულსის ასაჩქარებლად',
      bpmLabel: 'პულსი (BPM)',
      playersOnline: 'მოთამაშე ონლაინ',
      serverStatus: 'JAVA სერვერის სტატუსი',
      pingLabel: '20.0 TPS • 14ms',
      versionLabel: 'Java 1.21.x',
      clickToCopy: 'დააწკაპუნეთ ბარათზე IP-ის დასაკოპირებლად',
      splashes: [
        'იგრძენი ადრენალინი!',
        'ფასები ლარში (₾)!',
        'OneBlock + SMP!',
        'მხოლოდ Java Edition!',
        '2.00x ობსიდიანის ბუსტი!',
        'სტაბილური 20.0 TPS!',
      ],
    },
    stats: {
      liveTicker: 'სერვერის მონაცემები',
      onlinePlayers: 'მოთამაშე ონლაინ',
      activeMode: 'რეჟიმები',
      tpsStatus: 'სტაბილურობა',
      nextEvent: 'შემდეგი ივენთი',
      recentBuyers: 'ბოლო შენაძენები',
    },
    gamemodes: {
      sectionTag: '01 // თამაშის რეჟიმები',
      sectionTitle: 'ორი სამყარო. უსაზღვრო შესაძლებლობები.',
      sectionDesc: 'აირჩიეთ 6-ფაზიანი OneBlock კუნძული ან 25,000-ბლოკიანი ეკონომიკური SMP.',
      oneblockTab: 'ONEBLOCK',
      smpTab: 'SURVIVAL SMP',
      phasesTitle: 'ONEBLOCK-ის განვითარების 6 ფაზა',
      worldSpecsTitle: 'SMP სამყაროს პარამეტრები',
      worldSize: 'სამყაროს ზომა',
      pvpRules: 'PvP სტატუსი',
      economy: 'ეკონომიკა',
      raiding: 'ტერიტორიის დაცვა',
      mineInteractiveTitle: 'ინტერაქტიული ONEBLOCK მაინერი',
      mineInteractiveHint: 'დააწკაპუნეთ ბლოკზე მის გასატეხად და გაიარეთ 6-ვე ფაზა!',
      blocksMined: 'გათხრილი ბლოკი',
      currentPhase: 'მიმდინარე ფაზა',
      lastDrop: 'ბოლო ნადავლი',
      smpMapTitle: 'SMP-ის იზომეტრიული რუკა',
      smpMapHint: 'მიიტანეთ კურსორი ჩანკებზე დაცული მიწების, სპაუნისა და მაღაზიების სანახავად.',
    },
    ranks: {
      sectionTag: '02 // სერვერის მაღაზია',
      sectionTitle: 'აირჩიეთ თქვენი რანკი',
      sectionDesc: 'ყველა რანკი სამუდამოა, ფასები მოცემულია ლარში (₾) და მოქმედებს როგორც OneBlock, ისე SMP რეჟიმზე.',
      lifetimeBadge: 'სამუდამო სტატუსი',
      priceLabel: 'ფასი',
      commandsLabel: 'რანკის კომანდები',
      kitsLabel: 'რანკის კიტები',
      incomeBoostLabel: 'შემოსავლის ბუსტი',
      chatPrefixLabel: 'ჩათ პრეფიქსი',
      includesTemplate: 'ყველა {rank} რანკის კომანდები და შესაძლებლობები',
      newInThisTier: 'ახალი ამ რანკში',
      inheritedFrom: 'მემკვიდრეობით მიღებული კომანდები',
      showInherited: 'ყველა ({count}) წინა რანკის კომანდის ნახვა',
      hideInherited: 'წინა რანკის კომანდების დამალვა',
      buyRankCta: 'რანკის შეძენა',
      compareAllCta: 'რანკების სრული შედარების ცხრილი',
      hideCompareCta: 'ცხრილის დამალვა',
      featureMatrix: 'რანკების კომანდებისა და შესაძლებლობების სრული ცხრილი',
      CopyCommandHint: 'დააწკაპუნეთ კომანდის დასაკოპირებლად',
      commandCopied: 'კომანდა დაკოპირდა',
      kitClaimHint: 'აიღეთ თამაშში ბრძანებით',
      incomeCalcTitle: 'შემოსავლის ბუსტის კალკულატორი',
      incomeCalcBaseLabel: 'საბაზისო საათობრივი შემოსავალი',
      incomeCalcPerHour: 'მონეტა / სთ',
      chatPreviewTitle: 'ჩათ პრეფიქსის ცოცხალი გადახედვა',
      chatPreviewInputPlaceholder: 'შეიყვანეთ თქვენი Minecraft სახელი...',
      chatPreviewShowAll: '5-ვე რანკის შედარება',
      chatPreviewSingle: 'მხოლოდ არჩეული რანკი',
      upgradeCalcTitle: 'რანკის აფგრეიდის კალკულატორი (გადაიხადეთ მხოლოდ სხვაობა)',
      upgradeFromLabel: 'მიმდინარე რანკი',
      upgradeToLabel: 'სასურველი რანკი',
      upgradePayDiff: 'გადასახდელი სხვაობა',
      upgradeNowCta: 'აფგრეიდი ახლავე',
      commandExplorerTitle: 'სერვერის კომანდების კატალოგი (18 კომანდა)',
      commandExplorerSearch: 'მოძებნეთ კომანდა (მაგ. /fly, /repair, anvil)...',
      worksOnBoth: 'მოქმედებს OneBlock-სა და SMP-ზე',
    },
    staff: {
      sectionTag: '03 // სერვერის გუნდი',
      sectionTitle: '3D სტაფის შოუქეისი',
      sectionDesc: 'გაიცანით ADRENALINEE-ს მფლობელები და დეველოპერები რეალური Minecraft სკინებითა და 3D ანიმაციებით.',
      ownersWing: 'I ფრთა // სერვერის მფლობელები (OWNERS)',
      devsWing: 'II ფრთა // დეველოპერები (DEVELOPERS)',
      replayPose: 'ანიმაციის თავიდან ჩვენება',
      poseTimeline: 'მიმდინარე პოზა',
      favoriteBlock: 'საყვარელი ბლოკი',
      skinLiveBadge: 'ცოცხალი JAVA სკინი',
      staffPass: 'ოფიციალური სტაფის ბარათი',
    },
    join: {
      sectionTag: '04 // როგორ შემოვიდეთ',
      sectionTitle: 'სერვერზე შემოსვლა (JAVA EDITION)',
      sectionDesc: 'ADRENALINEE არის მხოლოდ Minecraft Java Edition სერვერი. მიჰყევით ამ 4 მარტივ ნაბიჯს:',
      javaOnlyNotice: 'მხოლოდ JAVA EDITION 1.20.4 – 1.21.x',
      step1Title: '1. ჩართეთ Java Edition',
      step1Desc: 'გახსენით Minecraft Launcher და ჩართეთ Java Edition 1.20.4 – 1.21.x ვერსია.',
      step2Title: '2. გახსენით Multiplayer',
      step2Desc: 'მთავარ მენიუში აირჩიეთ "Multiplayer" და დააწკაპუნეთ "Add Server" ღილაკს.',
      step3Title: '3. ჩაწერეთ სერვერის IP',
      step3Desc: 'Server Address ველში ჩასვით adrenalinee.run და შეინახეთ.',
      step4Title: '4. შემოდით და ითამაშეთ!',
      step4Desc: 'აირჩიეთ ADRENALINEE სიაში და შეუერთდით OneBlock ან SMP სამყაროს.',
      serverNameField: 'სერვერის სახელი (Server Name)',
      serverAddressField: 'სერვერის მისამართი (Server Address)',
      copyIpButton: 'IP-ის კოპირება (adrenalinee.run)',
      faqTitle: 'ხშირად დასმული კითხვები (FAQ)',
    },
    checkout: {
      modalTitle: 'სკივრის მაღაზია — შეკვეთა',
      step1Player: '1. მოთამაშე',
      step2Coupon: '2. აფგრეიდი / კუპონი',
      step3Confirm: '3. გააქტიურება',
      mcUsernameLabel: 'Minecraft Java სახელი (Username)',
      mcUsernamePlaceholder: 'მაგ. Saito',
      usernameHint: 'ჩაწერეთ ზუსტი Java ნიკი (3–16 სიმბოლო). თქვენი სკინი ავტომატურად ჩაიტვირთება.',
      upgradeToggleLabel: 'უკვე მაქვს რანკი (აფგრეიდი სხვაობის გადახდით)',
      currentRankSelect: 'აირჩიეთ მიმდინარე რანკი',
      couponLabel: 'პრომო კოდი',
      couponPlaceholder: 'სცადეთ RUSH10 ან GEORGIA15',
      applyCoupon: 'გამოყენება',
      couponApplied: 'ფასდაკლების კოდი გააქტიურდა!',
      couponInvalid: 'კოდი არასწორია ან ვადაგასულია',
      summaryRank: 'არჩეული რანკი',
      summarySubtotal: 'საბაზისო ფასი',
      summaryUpgradeCredit: 'მიმდინარე რანკის ჩათვლა',
      summaryDiscount: 'პრომო ფასდაკლება',
      summaryTotal: 'სულ გადასახდელი',
      completePurchase: 'შეძენის დასრულება',
      orderSuccessTitle: 'მიღწევა შესრულებულია: რანკი გააქტიურდა!',
      orderSuccessDesc: 'თქვენი რანკი მყისიერად გაიგზავნა OneBlock და SMP სერვერებზე.',
      luckPermsLabel: 'შესრულებული სერვერის ბრძანება:',
      closeModal: 'საიტზე დაბრუნება',
    },
    toasts: {
      advancementMade: 'მიღწევა შესრულებულია!',
      challengeComplete: 'გამოწვევა დაძლეულია!',
      goalReached: 'მიზანი მიღწეულია!',
      ipCopiedTitle: 'IP დაკოპირდა!',
      ipCopiedSub: 'adrenalinee.run მზადაა ჩასასმელად',
      rankSelectedTitle: 'რანკის დათვალიერება',
      commandCopiedTitle: 'კომანდა დაკოპირდა!',
      konamiTitle: 'საიდუმლო კოდი გააქტიურდა!',
      konamiSub: '240 BPM ოვერდრაივ რეჟიმი ჩართულია',
      prMergedTitle: 'კოდი წარმატებით შეერთდა!',
      prMergedSub: 'Jajo_1121 და godkissed-მა განახლება გაუშვეს',
      blockMinedTitle: 'ფაზის ბლოკი გატყდა!',
      blockMinedSub: 'OneBlock განახლდა ახალი რესურსებით',
    },
    footer: {
      disclaimer: 'Not affiliated with Mojang or Microsoft. არ არის დაკავშირებული Mojang-თან ან Microsoft-თან.',
      rights: '© 2025 ADRENALINEE Network (adrenalinee.run). ყველა უფლება დაცულია.',
      quickLinks: 'სწრაფი ნავიგაცია',
      connectDiscord: 'შემოგვიერთდით DISCORD-ზე',
      adminHint: 'სტაფის მართვის პანელი (#admin ან Ctrl+Shift+A)',
    },
  },
};
