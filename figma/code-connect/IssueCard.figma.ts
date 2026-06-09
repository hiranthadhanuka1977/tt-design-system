// url=https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool?node-id=63-71
// source=css/components.css
// component=IssueCard
import figma from '@figma/code-connect/html'

const instance = figma.selectedInstance

const issueKey = instance.getString('Issue Key')
const title = instance.getString('Title')
const issueType = instance.getEnum('Issue Type', {
  'Epic': 'epic',
  'Story': 'story',
  'Task': 'task',
  'Bug': 'bug',
  'Subtask': 'subtask',
})
const priority = instance.getEnum('Priority', {
  'Highest': 'highest',
  'High': 'high',
  'Medium': 'medium',
  'Low': 'low',
  'Lowest': 'lowest',
})

export default {
  id: 'issue-card',
  example: figma.code`<div class="issue-card">
  <div class="issue-card__header">
    <span class="issue-type issue-type--${issueType}"><span class="issue-type__icon"></span> ${issueKey}</span>
    <span class="priority priority--${priority}">▲</span>
  </div>
  <div class="issue-card__title">${title}</div>
  <div class="issue-card__footer">
    <span class="avatar avatar--xs">JD</span>
  </div>
</div>`,
  metadata: {
    nestable: false,
    props: { issueKey, title, issueType, priority },
  },
}
