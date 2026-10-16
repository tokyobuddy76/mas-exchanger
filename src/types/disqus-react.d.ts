declare module 'disqus-react' {
  import * as React from 'react';

  export interface DisqusConfig {
    url?: string;
    identifier?: string;
    title?: string;
    language?: string;
    remoteAuthS3?: string;
    apiKey?: string;
    sso?: {
      name?: string;
      button?: string;
      icon?: string;
      url?: string;
      logout?: string;
      profile_url?: string;
      width?: string;
      height?: string;
    };
  }

  export interface DiscussionEmbedProps {
    shortname: string;
    config: DisqusConfig;
  }

  export interface CommentCountProps {
    shortname: string;
    config: DisqusConfig;
    children?: React.ReactNode;
    className?: string;
  }

  export class DiscussionEmbed extends React.Component<DiscussionEmbedProps> {}
  export class CommentCount extends React.Component<CommentCountProps> {}
  export class CommentEmbed extends React.Component<any> {}
  export class Recommendations extends React.Component<any> {}
}
