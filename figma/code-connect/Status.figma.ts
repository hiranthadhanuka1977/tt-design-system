// url=https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool?node-id=62-117
// source=css/components.css
// component=Status
import figma from '@figma/code-connect/html'

const instance = figma.selectedInstance

const type = instance.getEnum('Type', {
  'To Do': 'todo',
  'In Progress': 'in-progress',
  'In Review': 'in-review',
  'Done': 'done',
  'Blocked': 'blocked',
})

const label = instance.getString('Label')

export default {
  id: 'status',
  example: figma.code`<span class="status status--${type}">${label}</span>`,
  metadata: {
    nestable: true,
    props: { type, label },
  },
}
