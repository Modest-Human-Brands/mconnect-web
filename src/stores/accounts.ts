import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  connectImap,
  disconnectAccount,
  listAccounts,
  startOAuth,
  type EmailAccount,
  type EmailProvider,
  type ImapAccountInput,
} from '@/api/accounts'

function message(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<EmailAccount[]>([])
  const loaded = ref(false)
  const loadError = ref('')
  const busy = ref(false)
  const error = ref('')

  const forProvider = (provider: EmailProvider) =>
    accounts.value.find((a) => a.provider === provider)

  async function load(): Promise<void> {
    loadError.value = ''
    try {
      accounts.value = await listAccounts()
      loaded.value = true
    } catch (err) {
      loadError.value = message(err, 'Could not load accounts.')
    }
  }

  /** Leaves the app for the provider's consent page; the API redirects back to `redirectPath`. */
  async function connectOAuth(provider: 'google' | 'microsoft', redirectPath: string) {
    busy.value = true
    error.value = ''
    try {
      window.location.assign(await startOAuth(provider, redirectPath))
    } catch (err) {
      error.value = message(err, 'Could not start sign-in.')
      busy.value = false
    }
  }

  /** Returns true when the mailbox verified and was saved. */
  async function addImap(input: ImapAccountInput): Promise<boolean> {
    busy.value = true
    error.value = ''
    try {
      await connectImap(input)
      await load()
      return true
    } catch (err) {
      error.value = message(err, 'Could not connect the mailbox.')
      return false
    } finally {
      busy.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    busy.value = true
    error.value = ''
    try {
      await disconnectAccount(id)
      await load()
    } catch (err) {
      error.value = message(err, 'Could not disconnect.')
    } finally {
      busy.value = false
    }
  }

  return {
    accounts,
    loaded,
    loadError,
    busy,
    error,
    forProvider,
    load,
    connectOAuth,
    addImap,
    remove,
  }
})