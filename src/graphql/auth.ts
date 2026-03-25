import { rule, shield } from "graphql-shield"

const isAuthenticated = rule()((_, __, { user }) => {
  return !!user
})

const permissions = shield({
  Query: {
    me: isAuthenticated,
  },
  Mutation: {
    bookOffer: isAuthenticated,
  },
  Subscription: {
    bookingStatusChanged: isAuthenticated,
  },
})
