// url=https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool?node-id=50-44
// source=css/components.css
// component=Badge
import figma from '@figma/code-connect/html'

const instance = figma.selectedInstance

const style = instance.getEnum('Style', {
  'Default': 'default',
  'Brand': 'brand',
  'Success': 'success',
  'Warning': 'warning',
  'Danger': 'danger',
  'Info': 'info',
  'Discovery': 'discovery',
  'Outline': 'outline',
})

const hasDot = instance.getBoolean('Has Dot')
const label = instance.getString('Label')

const classes = [
  'badge',
  style ? `badge--${style}` : '',
  hasDot ? 'badge--dot' : '',
].filter(Boolean).join(' ')

export default {
  id: 'badge',
  example: figma.code`<span class="${classes}">${label}</span>`,
  metadata: {
    nestable: true,
    props: { style, hasDot, label },
  },
}
