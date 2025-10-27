'use client';

import { useState, useEffect } from 'react';
import { IPoll } from '@/definition/interface';
import { Card } from '@/components/ui/card';
import { TOption } from '@/definition/type';
import { useWebSocket } from '@/context/websocket-provider';
import { useMutation } from '@tanstack/react-query';
import { voteOnPollMutationFn } from '@/lib/api';
import { toast } from 'sonner';

type Props = {
  poll: IPoll;
  showVoting?: boolean;
};

const PollCard = ({ poll, showVoting = true }: Props) => {
  const [currentPoll, setCurrentPoll] = useState<IPoll>(poll);
  const [isVoting, setIsVoting] = useState(false);
  const {
    connectToPoll,
    disconnectFromPoll,
    onVoteUpdate,
    onPollDataReceived,
    isConnectedToPoll,
    connectionCount
  } = useWebSocket();

  // Connect to this poll's WebSocket when component mounts
  useEffect(() => {
    connectToPoll(poll.id);

    // Set up event handlers
    onVoteUpdate((data) => {
      if (data.poll_id === poll.id && data.all_options) {
        setCurrentPoll((prev) => ({
          ...prev,
          options: data.all_options!
        }));
        // toast.success(`Vote recorded for "${data.option_value}"`);
      }
    });

    onPollDataReceived((data) => {
      if (data.poll_id === poll.id && data.options) {
        setCurrentPoll((prev) => ({
          ...prev,
          options: data.options!
        }));
      }
    });

    return () => {
      disconnectFromPoll();
    };
  }, [
    poll.id,
    connectToPoll,
    disconnectFromPoll,
    onVoteUpdate,
    onPollDataReceived
  ]);

  const voteMutation = useMutation({
    mutationFn: (optionId: string) =>
      voteOnPollMutationFn(poll.id, { option_id: optionId }),
    onMutate: () => {
      setIsVoting(true);
    },
    onSuccess: (data) => {
      console.log('Vote submitted successfully:', data);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to submit vote';
      toast.error(errorMessage);
      console.error('Vote error:', error);
    },
    onSettled: () => {
      setIsVoting(false);
    }
  });

  const handleVote = (optionId: string) => {
    if (isVoting) return;
    voteMutation.mutate(optionId);
  };

  const totalVotes = currentPoll.options.reduce(
    (acc, option) => acc + option.vote,
    0
  );

  return (
    <Card className='border-border bg-card overflow-hidden border p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='mb-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-foreground text-xl font-bold'>
            {currentPoll.question}
          </h2>
          {isConnectedToPoll && (
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
              <span className='text-muted-foreground text-xs'>
                {connectionCount} watching
              </span>
            </div>
          )}
        </div>
        {currentPoll.description && (
          <p className='text-muted-foreground mt-1 text-sm'>
            {currentPoll.description}
          </p>
        )}
        <p className='text-muted-foreground mt-2 text-xs'>
          Total votes: {totalVotes}
        </p>
      </div>
      <div className='mb-6 space-y-3'>
        {currentPoll.options.map((option: TOption) => {
          const percentage =
            totalVotes > 0 ? (option.vote / totalVotes) * 100 : 0;

          return (
            <button
              key={option.id}
              onClick={() => showVoting && handleVote(option.id)}
              disabled={isVoting || !showVoting}
              className={`w-full text-left transition-all ${
                showVoting && !isVoting
                  ? 'cursor-pointer hover:shadow-sm'
                  : 'cursor-default'
              } ${isVoting ? 'opacity-50' : ''}`}
            >
              <div className='border-border bg-muted relative overflow-hidden rounded-lg border p-3'>
                <div
                  className={`absolute inset-0 bg-linear-to-r from-blue-200 to-blue-300 transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
                <div className='relative flex items-center justify-between'>
                  <span className='text-foreground font-medium'>
                    {option.value}
                  </span>
                  <span className='text-primary text-sm font-semibold'>
                    {percentage.toFixed(1)}% ({option.vote})
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {isVoting && (
        <div className='text-muted-foreground text-center text-sm'>
          Submitting vote...
        </div>
      )}
    </Card>
  );
};

export default PollCard;
