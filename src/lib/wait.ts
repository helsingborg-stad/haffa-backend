import fastq from 'fastq'

export const waitForAll = async <T>(
  tasks: T[],
  worker: (task: T) => Promise<void>,
  concurrency: number = 1
): Promise<void> => {
  const q = fastq.promise(worker, concurrency)
  tasks.forEach(task => q.push(task))
  await q.drained()
}
