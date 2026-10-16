import React, { useState, useEffect } from 'react';
import { DiscussionEmbed, CommentCount } from 'disqus-react';
import { MessageSquare, MessageCircle, ExternalLink, Shield, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface TalkToUsProps {
  appUrl?: string;
}

interface ForumTopic {
  id: string;
  title: string;
  description: string;
  tag: string;
}

const FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'mas-exchanger-general',
    title: 'General Exchange Discussion & Feedback',
    description: 'Share your thoughts, ask questions about SingaRate, or discuss daily Singapore currency movements.',
    tag: 'General',
  },
  {
    id: 'mas-exchanger-money-changers',
    title: 'Best Money Changer Rates in Singapore',
    description: 'Crowdsource the best physical cash exchange rates around The Arcade (Raffles Place), Chinatown, Mustafa, and Katong.',
    tag: 'Money Changers',
  },
  {
    id: 'mas-exchanger-cards-travel',
    title: 'Multi-Currency Cards vs Bank FX Spreads',
    description: 'Compare YouTrip, Wise, Trust Bank, Revolut, DBS Multi-Currency, and credit card foreign transaction fees.',
    tag: 'Cards & Travel',
  },
  {
    id: 'mas-exchanger-feature-requests',
    title: 'Feature Requests & API Feedback',
    description: 'Suggest new Singapore-oriented financial features, alert integrations, or MAS API metrics.',
    tag: 'Features',
  },
];

export const TalkToUs: React.FC<TalkToUsProps> = ({ appUrl }) => {
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic>(FORUM_TOPICS[0]);
  const [showSsoDetails, setShowSsoDetails] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('https://mas-exchanger.local');

  // Dynamic current URL resolution
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // If hosted in AI studio preview or custom domain
      if (origin && origin !== 'null' && !origin.includes('file:')) {
        setBaseUrl(origin);
      } else if (appUrl) {
        setBaseUrl(appUrl);
      }
    }
  }, [appUrl]);

  const currentArticle = {
    url: `${baseUrl}/#talk-to-us/${selectedTopic.id}`,
    id: selectedTopic.id,
    title: `${selectedTopic.title} - SingaRate MAS Desk`,
  };

  const disqusShortname = 'mas-exchanger1';

  const disqusConfig = {
    url: currentArticle.url,
    identifier: currentArticle.id,
    title: currentArticle.title,
    language: 'en',
    // Single Sign-On (SSO) placeholders ready for when server-side credentials are provided
    remoteAuthS3: '',
    apiKey: '',
    sso: {
      name: 'SingaRate User',
      button: `${baseUrl}/favicon.ico`,
      icon: `${baseUrl}/favicon.ico`,
      url: `${baseUrl}/login`,
      logout: `${baseUrl}/logout`,
      profile_url: `${baseUrl}/profile/{username}`,
      width: '800',
      height: '400',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
                Community Discussion & Support
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 mt-1">
              Talk to Us
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-1.5">
              <span>Disqus Community Forum</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-neutral-700">shortname: {disqusShortname}</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Comments</span>
            </div>
          </div>

          {/* Comment Counter badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700">
              <MessageCircle className="w-4 h-4 text-rose-600" />
              <CommentCount shortname={disqusShortname} config={disqusConfig}>
                Comments
              </CommentCount>
            </div>
            <a
              href={`https://disqus.com/home/forums/${disqusShortname}/`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Disqus Portal</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
          </div>
        </div>

        {/* Channel / Topic Selector */}
        <div className="pt-6">
          <div className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wider">
            Discussion Channels
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FORUM_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              const topicConfig = {
                url: `${baseUrl}/#talk-to-us/${topic.id}`,
                identifier: topic.id,
                title: `${topic.title} - SingaRate MAS Desk`,
              };

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 text-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {topic.tag}
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        <CommentCount shortname={disqusShortname} config={topicConfig}>
                          0
                        </CommentCount>
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-snug">{topic.title}</div>
                    <div
                      className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {topic.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Discussion Section & Embed */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {selectedTopic.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {selectedTopic.description}
            </p>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            ID: <span className="text-neutral-700">{selectedTopic.id}</span>
          </div>
        </div>

        {/* Disqus Embed Container */}
        <div className="min-h-[420px] bg-neutral-50/40 rounded-xl p-4 border border-neutral-100">
          <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
        </div>

        {/* Fallback Notice for strict tracking protection / third-party cookies */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              If comments do not load, please ensure third-party cookies or browser privacy shields are not blocking Disqus.
            </span>
          </div>
          <a
            href={`https://${disqusShortname}.disqus.com`}
            target="_blank"
            rel="noreferrer"
            className="text-rose-600 hover:text-rose-700 font-medium whitespace-nowrap inline-flex items-center gap-1"
          >
            <span>Open forum on Disqus</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Single Sign-On (SSO) & Developer Integration Panel */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <button
          onClick={() => setShowSsoDetails(!showSsoDetails)}
          className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neutral-500" />
            <span>Disqus Single Sign-On (SSO) & Custom Auth Setup</span>
          </div>
          {showSsoDetails ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {showSsoDetails && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4 text-xs">
            <p className="text-neutral-600 leading-relaxed">
              SingaRate includes full configuration props for Disqus Single Sign-On (SSO). When you configure SSO on your Disqus Application settings (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200">https://disqus.com/api/applications/</code>), you can provide server-generated HMAC payloads to authenticate users automatically without requiring a separate Disqus account:
            </p>

            <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg font-mono text-[11px] overflow-x-auto">
              <code>{`// Embedded Disqus SSO Configuration in SingaRate:
<DiscussionEmbed
  shortname='${disqusShortname}'
  config={{
    url: '${currentArticle.url}',
    identifier: '${currentArticle.id}',
    title: '${currentArticle.title}',
    language: 'en',
    remoteAuthS3: '<SERVER_GENERATED_HMAC_AUTH>',
    apiKey: '<DISQUS_PUBLIC_API_KEY>',
    sso: {
      name: 'SingaRate',
      button: '${baseUrl}/favicon.ico',
      icon: '${baseUrl}/favicon.ico',
      url: '${baseUrl}/login',
      logout: '${baseUrl}/logout',
      profile_url: '${baseUrl}/profile/{username}',
      width: '800',
      height: '400',
    }
  }}
/>`}</code>
            </pre>

            <div className="flex items-center gap-2 text-neutral-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Standard social login (Google, Facebook, Twitter, Disqus) is active out-of-the-box in the embed above.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
