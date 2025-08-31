
import { Octokit } from 'octokit'
import { graphql } from '@octokit/graphql'

export function makeOctokit(token: string) {
  const rest = new Octokit({ auth: token })
  const gql = graphql.defaults({ headers: { authorization: `token ${token}` } })
  return { rest, gql }
}
