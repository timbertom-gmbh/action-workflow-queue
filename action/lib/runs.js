/* eslint-disable camelcase */

// node modules
import { inspect } from 'util'

// packages
import core from '@actions/core'
import github from '@actions/github'

export default async function ({ octokit, run_id, before }) {
  // get current run of this workflow
  const { data: { workflow_runs } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
    ...github.context.repo
  })

  // find any instances of the same workflow
  const waiting_for = workflow_runs
    // limit to currently running ones
    .filter(run => ['in_progress', 'queued'].includes(run.status))
    // exclude this one
    .filter(run => run.id !== run_id)
    // get older runs
    .filter(run => new Date(run.created_at) < before)

  core.info(`found ${waiting_for.length} workflow runs`)
  core.debug(inspect(waiting_for.map(run => ({ id: run.id, name: run.name }))))

  return waiting_for
}
