import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faCopy,
  faCheck,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

export interface QunixSftpDetailsProps {
  sftpHost?: string;
  sftpPort?: number | string;
  sftpUsername?: string;
  sftpUrl?: string;
  isDemo?: boolean;
  onCopy?: (text: string, label: string) => void;
  copiedField?: string | null;
}

export default function QunixSftpDetails({
  sftpHost = '127.0.0.1',
  sftpPort = 2022,
  sftpUsername = 'username.srv1',
  sftpUrl = 'sftp://username.srv1@127.0.0.1:2022',
  isDemo = false,
  onCopy,
  copiedField,
}: QunixSftpDetailsProps) {
  const handleCopy = (text: string, label: string) => {
    if (onCopy) {
      onCopy(text, label);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className='qunix-card-flat p-4 lg:p-5 flex flex-col justify-between h-full'>
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-neutral-400 m-0 flex items-center gap-2'>
            <FontAwesomeIcon icon={faShieldHalved} className='text-blue-400' />
            SFTP Details
          </h3>
          <span className='text-xs text-neutral-500 font-mono'>SSH / SFTP</span>
        </div>

        <div className='flex flex-col gap-2.5 text-xs'>
          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>Connection Address</span>
            <div
              className='flex items-center gap-1.5 font-mono text-neutral-200 cursor-pointer hover:text-blue-400 transition-colors'
              onClick={() => handleCopy(`${sftpHost}:${sftpPort}`, 'SFTP Address')}
              title='Click to copy SFTP address'
            >
              <span>{sftpHost}:{sftpPort}</span>
              <FontAwesomeIcon
                icon={copiedField === 'SFTP Address' ? faCheck : faCopy}
                className='text-[10px] text-neutral-500'
              />
            </div>
          </div>

          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>SFTP Username</span>
            <div
              className='flex items-center gap-1.5 font-mono text-neutral-200 cursor-pointer hover:text-blue-400 transition-colors'
              onClick={() => handleCopy(sftpUsername, 'SFTP Username')}
              title='Click to copy SFTP username'
            >
              <span>{sftpUsername}</span>
              <FontAwesomeIcon
                icon={copiedField === 'SFTP Username' ? faCheck : faCopy}
                className='text-[10px] text-neutral-500'
              />
            </div>
          </div>

          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>Password</span>
            <span className='text-neutral-500 italic'>Your account login password</span>
          </div>
        </div>
      </div>

      <div className='mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between'>
        <span className='text-[11px] text-neutral-500'>Full URI</span>
        <a
          href={isDemo ? '#open-sftp' : sftpUrl}
          onClick={(e) => {
            if (isDemo) {
              e.preventDefault();
            }
          }}
          className='px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer font-mono no-underline'
          title='Open SFTP client'
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} className='text-[10px]' />
          <span>Open</span>
        </a>
      </div>
    </div>
  );
}
