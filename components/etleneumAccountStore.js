/** @format */

import {Account} from 'etleneum'
import {readable} from 'svelte/store'

export const account = Account()
export default readable(account, set => account.subscribe(set))
