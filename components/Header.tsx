'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import CreatePollForm from './CreatePollForm';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='border-border bg-card sticky top-0 z-50 border-b shadow-sm'>
      <div className='mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <h1 className='text-2xl font-bold text-blue-600'>QuickPoll</h1>
            <p className='text-muted-foreground text-sm'>
              Real-time opinion polling
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              className='gap-2 bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => setIsOpen(true)}
            >
              <Plus className='h-4 w-4' />
              <span className='hidden sm:inline'>Create Poll</span>
            </Button>
          </div>
        </div>
      </div>
      <CreatePollForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </header>
  );
};

export default Header;
