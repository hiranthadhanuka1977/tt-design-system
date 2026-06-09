// url=https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool?node-id=54-46
// source=css/components.css
// component=Input
import figma from '@figma/code-connect/html'

const instance = figma.selectedInstance

const size = instance.getEnum('Size', {
  'Small': 'sm',
  'Medium': 'md',
  'Large': 'lg',
})

const state = instance.getEnum('State', {
  'Default': 'default',
  'Focus': 'focus',
  'Error': 'error',
  'Disabled': 'disabled',
})

const placeholder = instance.getString('Placeholder')
const isTextarea = instance.getBoolean('Multiline')

const sizeClass = size && size !== 'md' ? ` input--${size}` : ''
const tag = isTextarea ? 'textarea' : 'input'
const attrs = state === 'disabled' ? ' disabled' : ''

export default {
  id: 'input',
  example: figma.code`<${tag} class="input${isTextarea ? ' textarea' : ''}${sizeClass}" placeholder="${placeholder}"${attrs}></${tag}>`,
  metadata: {
    nestable: true,
    props: { size, state, placeholder, isTextarea },
  },
}
