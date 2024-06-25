import HttpStatusCodes from 'http-status-codes'
import { profileGqlSchema } from './profile.gql.schema'
import type { Services } from '../types'
import { elevateUser, normalizeRoles } from '../login'
import { waitForAll } from '../lib'
import { waitRepeat } from '../lib/wait'
import type { RemoveProfileInput } from './types'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createProfileGqlModule = ({
  profiles,
  adverts,
}: Pick<Services, 'profiles' | 'adverts'>): GraphQLModule => ({
  schema: profileGqlSchema,
  resolvers: {
    Query: {
      profile: async ({ ctx }) => {
        const { user } = ctx
        if (user.guest) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return profiles.getProfile(user)
      },
    },
    Mutation: {
      updateProfile: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (user.guest) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        if (!normalizeRoles(user?.roles).canManageProfile) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return profiles.updateProfile(user, input)
      },

      removeProfile: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        const p = input as unknown as RemoveProfileInput
        if (user.guest) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        if (!normalizeRoles(user?.roles).canManageProfile) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        const effectiveUser = elevateUser(user, { canRemoveOwnAdverts: true })

        if (p?.removeAdverts) {
          await waitRepeat(async () => {
            const batch = await adverts.list(user, {
              restrictions: { createdByMe: true },
            })
            const ids = batch.adverts.map(({ id }) => id)
            if (ids.length === 0) {
              return null
            }
            return () =>
              waitForAll(ids, id => adverts.remove(effectiveUser, id))
          })
        }

        await profiles.deleteProfile(user)
        return { success: true }
      },
    },
  },
})
