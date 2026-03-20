declare var NativeModules: {
  LinkingModule?: {
    createURL(path: string, optionsJson: string): string
    getInitialURL(callback: (url: string | null) => void): void
  }
}
