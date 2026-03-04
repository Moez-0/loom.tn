export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled'

export function getTrialDaysRemaining(trialEndsAt: string | Date) {
  const trialEnd = new Date(trialEndsAt).getTime()
  const now = Date.now()
  const diff = trialEnd - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isTrialExpired(trialEndsAt: string | Date) {
  return getTrialDaysRemaining(trialEndsAt) < 0
}

export function getOwnerSubscriptionLabel(status: SubscriptionStatus, trialEndsAt: string | Date) {
  if (status === 'active') {
    return 'Active'
  }

  if (status === 'cancelled') {
    return 'Cancelled'
  }

  if (status === 'past_due') {
    return 'Past due'
  }

  const daysRemaining = getTrialDaysRemaining(trialEndsAt)
  if (daysRemaining < 0) {
    return 'Trial expired'
  }

  if (daysRemaining === 0) {
    return 'Trial ends today'
  }

  return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in trial`
}
