import { Icon as OfflineIcon, addCollection } from '@iconify/vue/offline'
import { iconCollections } from './collections'

let registered = false

const ensureCollections = () => {
  if (registered) return
  iconCollections.forEach((collection) => addCollection(collection))
  registered = true
}

ensureCollections()

export const Icon = OfflineIcon

export default Icon
