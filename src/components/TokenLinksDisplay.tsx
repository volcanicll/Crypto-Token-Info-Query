import { BasicTokenInfo } from '@/types';

interface TokenLinksDisplayProps {
  links?: BasicTokenInfo['links'];
}

export const TokenLinksDisplay: React.FC<TokenLinksDisplayProps> = ({ links }) => {
  if (!links) return null;

  const linkCategories = [
    { title: 'Homepage', items: links.homepage },
    { title: 'Blockchain Explorers', items: links.blockchain_explorers },
    { title: 'Official Forums', items: links.official_forum_url },
    { title: 'Chat URLs', items: links.chat_url },
    { title: 'GitHub Repositories', items: links.github_repos },
  ];
  const singleLinks = [
     { title: 'Twitter', url: links.twitter_screen_name ? `https://twitter.com/${links.twitter_screen_name}` : undefined, name: links.twitter_screen_name},
     { title: 'Facebook', url: links.facebook_username ? `https://facebook.com/${links.facebook_username}`: undefined, name: links.facebook_username},
     { title: 'Reddit', url: links.subreddit_url, name: links.subreddit_url?.split('/').filter(Boolean).pop() },
  ];


  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Links & Resources</h3>
      <div className="space-y-3 text-sm">
        {linkCategories.map(category => category.items && category.items.length > 0 && (
          <div key={category.title}>
            <h4 className="font-medium text-gray-700">{category.title}:</h4>
            <ul className="list-disc list-inside pl-4">
              {category.items.filter(item => item).map((link, idx) => (
                <li key={idx}><a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
        {singleLinks.filter(sl => sl.url).map(sl => (
          <div key={sl.title}>
             <h4 className="font-medium text-gray-700">{sl.title}:</h4>
             <a href={sl.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sl.name || sl.url}</a>
          </div>
        ))}
      </div>
    </div>
  );
};
