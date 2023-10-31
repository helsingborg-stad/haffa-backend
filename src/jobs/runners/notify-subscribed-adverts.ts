import type { TaskRunnerSignature } from '../types'
/*
const collectAdverts: AsyncFunc<{
  user: HaffaUser
  subscription: AdvertSubscription
  services: Services
  collect: (advert: Advert) => void
}> = async ({ user, subscription, services: { adverts }, collect }) => {
  const { search, categories } = subscription.filter

  const found = await adverts.list(user, {
    ...(search && { search }),

    fields: {
      createdAt: {
        gt: subscription.lastNotifiedAt || subscription.createdAt,
      },
      ...(categories &&
        categories.length && {
          category: { in: categories },
        }),
    },
    restrictions: { canBeReserved: true },
  })
  found.adverts.forEach(collect)
}

const notifyUser: AsyncFunc<{ user: HaffaUser; services: Services }> = async ({
  user,
  services,
}) => {
  const subscriptions = await services.subscriptions.getAdvertSubscriptions(
    user
  )
  const foundAdvertIds = new Set<string>()
  const foundAdverts: Advert[] = []
  const collect = (advert: Advert) => {
    if (foundAdvertIds.has(advert.id)) {
      return
    }
    foundAdverts.push(advert)
  }
  await waitForAll(
    subscriptions.map(subscription => ({
      user,
      subscription,
      services,
      collect,
    })),
    collectAdverts
  )

	services.subscriptions.addAdvertSubscription

}
*/
export const notifySubscribedAdverts: TaskRunnerSignature = async services => {
  await services.subscriptions.notifyAllSubscriptions()
  return ''
  /*
  const { subscriptions, userMapper } = services
  const userEmails = await subscriptions.getSubscribingUsers()
  const mappedUsers = await userMapper.mapAndValidateEmails(userEmails)
  await waitForAll(
    mappedUsers.map(user => ({ services, user })),
    notifyUser
  )
  return ''
	*/
}
