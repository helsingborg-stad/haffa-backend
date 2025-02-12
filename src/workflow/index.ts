import { getEnv } from '../lib/gdi-api-node'
import type { WorkflowService } from './types'

export const createWorkflowServiceFromEnv = (): WorkflowService => ({
  get pickOnCollect() {
    return Number(getEnv('PICK_ON_COLLECT', { fallback: '0' })) === 1
  },
  get unpickOnReturn() {
    return Number(getEnv('UNPICK_ON_RETURN', { fallback: '0' })) === 1
  },
})
