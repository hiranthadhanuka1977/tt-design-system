// url=https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool?node-id=52-40
// source=css/components.css
// component=Button
import figma from '@figma/code-connect/html'

const instance = figma.selectedInstance

const style = instance.getEnum('Style', {
  'Primary': 'primary',
  'Secondary': 'secondary',
  'Subtle': 'subtle',
  'Danger': 'danger',
  'Danger Subtle': 'danger-subtle',
  'Link': 'link',
})

const size = instance.getEnum('Size', {
  'Small': 'sm',
  'Medium': 'md',
  'Large': 'lg',
})

const disabled = instance.getBoolean('Disabled')
const label = instance.getString('Label')
const iconOnly = instance.getBoolean('Icon Only')

const classes = [
  'btn',
  style ? `btn--${style}` : '',
  size && size !== 'md' ? `btn--${size}` : '',
  iconOnly ? 'btn--icon' : '',
  disabled ? 'is-disabled' : '',
].filter(Boolean).join(' ')

export default {
  id: 'button',
  example: figma.code`<button class="${classes}"${disabled ? ' disabled' : ''}>${label}</button>`,
  metadata: {
    nestable: true,
    props: { style, size, disabled, label, iconOnly },
  },
}
