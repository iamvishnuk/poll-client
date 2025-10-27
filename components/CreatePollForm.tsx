'use client';
import z from 'zod';
import { Dispatch, SetStateAction } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from './ui/input-group';
import { PollSchema } from '@/schemas/poll';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet
} from './ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPollMutationFn } from '@/lib/api';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const CreatePollForm = ({ isOpen, setIsOpen }: Props) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createPollMutationFn
  });

  const form = useForm<z.infer<typeof PollSchema>>({
    resolver: zodResolver(PollSchema),
    defaultValues: {
      question: '',
      description: '',
      options: [{ value: '' }]
    }
  });

  const {
    fields: options,
    append: addOption,
    remove: removeOption
  } = useFieldArray({
    control: form.control,
    name: 'options'
  });

  const onSubmit = (values: z.infer<typeof PollSchema>) => {
    const data = {
      ...values,
      options: values.options.map((option) => option.value)
    };

    mutate(data, {
      onSuccess: () => {
        toast.success('Poll created successfully!');
        form.reset();
        queryClient.invalidateQueries({ queryKey: ['get-all-polls'] });
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error('Error', { description: error.message });
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-blue-600'>
            Create a New Poll
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name='question'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Poll Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder='What is your question?'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='description'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Poll Description <span className='text-xs'>(optional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder='What is your description?'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <FieldSet>
              <FieldLabel>Poll Options</FieldLabel>
              <FieldGroup>
                {options.map((option, index) => (
                  <Controller
                    key={option.id}
                    control={form.control}
                    name={`options.${index}.value`}
                    render={({ field, fieldState }) => (
                      <Field>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            placeholder={`Option ${index + 1}`}
                            aria-label={`Option ${index + 1} value`}
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupButton
                              onClick={() => removeOption(index)}
                              className='hover:text-red-600'
                            >
                              <Trash2 />
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
              </FieldGroup>
              <Button
                className='w-fit bg-blue-600 hover:cursor-pointer hover:bg-blue-700'
                onClick={() => addOption({ value: '' })}
                type='button'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Option
              </Button>
            </FieldSet>

            <FieldSeparator />
            <div className='flex justify-between gap-2'>
              <Button
                type='button'
                className='flex-1 hover:cursor-pointer hover:border-red-300 hover:bg-red-300 hover:text-red-600'
                variant='outline'
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-blue-600 text-white hover:cursor-pointer hover:bg-blue-700'
              >
                Create Poll
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollForm;
