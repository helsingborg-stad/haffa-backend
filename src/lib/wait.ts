import fastq from 'fastq'

export const waitForAll = async <T>(
  tasks: T[],
  worker: (task: T) => Promise<any>,
  concurrency: number = 1
): Promise<void> => {
  const q = fastq.promise(worker, concurrency)
  tasks.forEach(task => q.push(task))
  await q.drained()
}

/**
 * Repeatedly invoke next action from factory until factory returns null
 * @param factory action to invoke or null (to terminate)
 * @returns
 */
export const waitRepeat = async (
  factory: () => Promise<(() => Promise<any>) | null>
): Promise<void> => {
  const action = await factory()
  if (!action) {
    return
  }
  await action()
  await waitRepeat(factory)
}
