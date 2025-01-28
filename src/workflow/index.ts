import { getEnv } from '../lib/gdi-api-node'
import type { WorkflowService } from './types'

export const createWorkflowServiceFromEnv = (): WorkflowService => ({
  doPickOnCollect: () =>
    Number(getEnv('PICK_ON_COLLECT', { fallback: '0' })) === 1,
})
