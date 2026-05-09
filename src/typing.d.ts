declare var NativeModules: {
  LinkingModule?: {
    createURL(path: string, optionsJson: string): string
    openURL(url: string, callback: (ok: boolean) => void): void
    getInitialURL(callback: (url: string | null) => void): void
  }
}
