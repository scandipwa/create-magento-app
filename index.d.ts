declare global {
    interface NodeJS {
        isOutOfDateVersion?: boolean
        isOutOfDateVersionMessage?: string
    }
}
