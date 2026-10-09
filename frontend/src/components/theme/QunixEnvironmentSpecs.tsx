import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export interface QunixEnvironmentSpecsProps {
  serverUuid?: string;
  hostNode?: string;
  eggName?: string;
  dockerImage?: string;
  isDemo?: boolean;
  onCopy?: (text: string, label: string) => void;
}

export default function QunixEnvironmentSpecs({
  serverUuid = '00000000-0000-0000-0000-000000000000',
  hostNode = 'Node-01',
  eggName = 'Standard',
  dockerImage = 'ghcr.io/pterodactyl/yolks:java_17',
  isDemo = false,
  onCopy,
}: QunixEnvironmentSpecsProps) {
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
            <FontAwesomeIcon icon={faLayerGroup} className='text-purple-400' />
            Environment & Specifications
          </h3>
          <span className='text-xs text-neutral-500 font-mono'>Infrastructure</span>
        </div>

        <div className='flex flex-col gap-2.5 text-xs'>
          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>Host Node</span>
            <span className='font-mono text-neutral-200 font-medium'>
              {hostNode}
            </span>
          </div>

          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>Template / Egg</span>
            <span className='font-mono text-neutral-200 font-medium'>
              {eggName}
            </span>
          </div>

          <div className='flex justify-between items-center py-1.5 border-b border-neutral-800/80'>
            <span className='text-neutral-400'>Docker Image</span>
            <span
              className='font-mono text-neutral-300 truncate max-w-[200px] cursor-pointer hover:text-white transition-colors'
              title={dockerImage}
              onClick={() => handleCopy(dockerImage, 'Docker Image')}
            >
              {dockerImage}
            </span>
          </div>

          <div className='flex justify-between items-center py-1.5'>
            <span className='text-neutral-400'>Server Identifier</span>
            <span
              className='font-mono text-neutral-400 truncate max-w-[200px] cursor-pointer hover:text-white transition-colors'
              title={serverUuid}
              onClick={() => handleCopy(serverUuid, 'Server Identifier')}
            >
              {serverUuid}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
