import React, { useState } from 'react';
import {
  Copy,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../i18n/translations';
import { getBlockDataUrl } from '../lib/textures';
import { audioEngine } from '../lib/audio';

export const WhyAndJoinSections: React.FC = () => {
  const db = useAppStore((s) => s.db);
  const language = useAppStore((s) => s.language);
  const copyIpWithFeedback = useAppStore((s) => s.copyIpWithFeedback);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const t = TRANSLATIONS[language];

  const [openFaqId, setOpenFaqId] = useState<string | null>(db.faq[0]?.id || null);

  const steps = [
    {
      num: '01',
      title: t.join.step1Title,
      desc: t.join.step1Desc,
      block: getBlockDataUrl('grass_top'),
    },
    {
      num: '02',
      title: t.join.step2Title,
      desc: t.join.step2Desc,
      block: getBlockDataUrl('cobblestone'),
    },
    {
      num: '03',
      title: t.join.step3Title,
      desc: t.join.step3Desc,
      block: getBlockDataUrl('emerald_block'),
    },
    {
      num: '04',
      title: t.join.step4Title,
      desc: t.join.step4Desc,
      block: getBlockDataUrl('obsidian'),
    },
  ];

  return (
    <>
      {/* HOW TO JOIN (4-Step Java Edition Guide + Authentic "Add Server" GUI Replica) */}
      <section
        id="join"
        className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mc-panel-dark text-[#25FF57] text-xs font-mono uppercase tracking-widest mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>{t.join.sectionTag}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white uppercase tracking-wider">
              {t.join.sectionTitle}
            </h2>
            <p className="text-zinc-300 mt-2 max-w-2xl text-base sm:text-lg">
              {t.join.sectionDesc}
            </p>
          </div>

          <div className="mc-panel-dark px-4 py-2 text-xs font-mono text-amber-300 font-bold uppercase self-start">
            [JAVA] {t.join.javaOnlyNotice}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 4 Steps Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="mc-panel-dark p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <img src={step.block} alt="" className="w-8 h-8 pixelated" />
                    <span className="text-xs font-mono text-[#25FF57] font-bold">
                      STEP {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Minecraft "Edit Server Info" Screen Replica (5 cols) */}
          <div
            className="lg:col-span-5 mc-panel-dark p-6 sm:p-7"
            style={{
              backgroundImage: `linear-gradient(rgba(10, 8, 18, 0.88), rgba(10, 8, 18, 0.92)), url(${getBlockDataUrl(
                'dirt'
              )})`,
              backgroundSize: '48px 48px',
            }}
          >
            <div className="text-center font-display font-bold text-white text-lg uppercase mb-5">
              Edit Server Info (Java Edition)
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-xs font-mono text-zinc-400 mb-1">
                  {t.join.serverNameField}
                </div>
                <div className="bg-black border-2 border-[#a0a0a0] px-3 py-2 font-mono text-sm text-white">
                  {db.settings.serverName} Network
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-zinc-400 mb-1">
                  {t.join.serverAddressField}
                </div>
                <div className="bg-black border-2 border-[#25FF57] px-3 py-2.5 font-mono text-base font-bold text-[#25FF57] flex items-center justify-between">
                  <span>{db.settings.serverIp}</span>
                  <span className="w-2 h-4 bg-white animate-pulse inline-block" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) =>
                copyIpWithFeedback(
                  t.toasts.advancementMade,
                  t.toasts.ipCopiedTitle,
                  t.toasts.ipCopiedSub,
                  e.clientX,
                  e.clientY
                )
              }
              className="w-full mc-btn py-3 px-4 font-display font-bold text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#25FF57]" />
              <span>{t.join.copyIpButton}</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        id="faq"
        className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mc-panel-dark text-[#8C6CFF] text-xs font-mono uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ // KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase">
            {t.join.faqTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {db.faq.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div key={item.id} className="mc-panel-dark overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playHoverTick();
                    setOpenFaqId(isOpen ? null : item.id);
                  }}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="font-display font-bold text-white text-sm sm:text-base">
                    {item.question[language]}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#25FF57] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-zinc-300 border-t border-white/10 leading-relaxed">
                    {item.answer[language]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER (with extra bottom padding for the 9-slot Hotbar) */}
      <footer
        id="footer-discord"
        className="relative z-10 border-t-2 border-[#2a223a] bg-[#06040d] pt-14 pb-36 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Col 1: Brand + Disclaimer */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={getBlockDataUrl('obsidian')}
                alt="ADRENALINEE"
                className="w-7 h-7 pixelated"
              />
              <span className="font-display font-bold text-xl text-white tracking-wider">
                {db.settings.serverName}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              {t.footer.disclaimer}
            </p>
            <p className="text-xs font-mono text-zinc-500">{t.footer.rights}</p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
              {t.footer.quickLinks}
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono text-zinc-300">
              <a href="#home" className="hover:text-[#25FF57]">
                1. {t.nav.home}
              </a>
              <a href="#gamemodes" className="hover:text-[#25FF57]">
                2. {t.nav.gamemodes}
              </a>
              <a href="#ranks" className="hover:text-[#25FF57]">
                3. {t.nav.ranks}
              </a>
              <a href="#join" className="hover:text-[#25FF57]">
                4. {t.nav.join}
              </a>
              <a href="#staff" className="hover:text-[#25FF57]">
                5. {t.nav.staff}
              </a>
              <a href="#faq" className="hover:text-[#25FF57]">
                6. {t.nav.faq}
              </a>
            </div>
          </div>

          {/* Col 3: Discord & Admin Trigger */}
          <div className="flex flex-col sm:items-end gap-3">
            <a
              href={db.settings.discordInvite}
              target="_blank"
              rel="noreferrer"
              className="mc-btn px-5 py-2.5 text-xs font-display font-bold text-white uppercase tracking-wider inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#008DFF]" />
              <span>{t.footer.connectDiscord}</span>
            </a>

            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.footer.adminHint}</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
