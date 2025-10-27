'use client';
import React, { useState, useEffect } from 'react';
import PollCard from '@/components/PollCard';
import { getAllPollsMutationFn } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/context/websocket-provider';
import { IPoll } from '@/definition/interface';
import { toast } from 'sonner';

export default function Home() {
  const [polls, setPolls] = useState<IPoll[]>([]);
  const {
    connectToGeneral,
    disconnectFromGeneral,
    onNewPoll,
    onPollDeleted,
    isConnectedToGeneral
  } = useWebSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['get-all-polls'],
    queryFn: getAllPollsMutationFn
  });

  // Initialize polls from API data
  const displayPolls = polls.length > 0 ? polls : data?.data || [];

  // Connect to general WebSocket for new poll notifications
  useEffect(() => {
    connectToGeneral();

    // Set up event handlers
    onNewPoll((data) => {
      if (data.poll) {
        setPolls((prev) => [data.poll!, ...prev]);
        toast.success(`New poll created: "${data.poll!.question}"`);
      }
    });

    onPollDeleted((data) => {
      if (data.poll_id) {
        setPolls((prev) => prev.filter((poll) => poll.id !== data.poll_id));
        toast.info('A poll was deleted');
      }
    });

    return () => {
      disconnectFromGeneral();
    };
  }, [connectToGeneral, disconnectFromGeneral, onNewPoll, onPollDeleted]);

  if (isLoading) {
    return (
      <div className='mx-auto max-w-4xl p-6 pt-8'>
        <div className='text-muted-foreground text-center'>
          Loading polls...
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl space-y-4 p-6 pt-8'>
      {isConnectedToGeneral && (
        <div className='text-muted-foreground mb-4 text-center text-sm'>
          <span className='inline-flex items-center gap-2'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
            Connected - Real-time updates enabled
          </span>
        </div>
      )}

      {displayPolls.length === 0 ? (
        <div className='text-muted-foreground py-12 text-center'>
          <p className='mb-2 text-lg'>No polls available</p>
          <p className='text-sm'>Create a new poll to get started!</p>
        </div>
      ) : (
        displayPolls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            showVoting={true}
          />
        ))
      )}
    </div>
  );
}
