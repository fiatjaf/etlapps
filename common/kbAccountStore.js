/** @format */

import {readable} from 'svelte/store'
import {Contract} from 'etleneum'

export default readable({}, set => {
  Contract('cog4wt7q8n3')
    .state(
      `.identities | to_entries | map(select(.key != "_")) | map({key: .value, value: .key}) | from_entries`
    )
    .then(set)
  return () => {}
})
