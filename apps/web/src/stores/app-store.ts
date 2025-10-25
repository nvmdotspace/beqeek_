import { create } from "zustand"

type AppStore = {
  dogRefreshCount: number
  incrementDogRefresh: () => void
  resetDogRefresh: () => void
  lastSubscriberMessage: string | null
  setSubscriberMessage: (message: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  dogRefreshCount: 0,
  incrementDogRefresh: () =>
    set((state) => ({ dogRefreshCount: state.dogRefreshCount + 1 })),
  resetDogRefresh: () => set({ dogRefreshCount: 0 }),
  lastSubscriberMessage: null,
  setSubscriberMessage: (message) => set({ lastSubscriberMessage: message }),
}))
