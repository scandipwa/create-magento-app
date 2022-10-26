
declare namespace NodeJS {
    export interface ProcessEnv {
        PATH: string
        COMPOSER_AUTH?: string
    }

    export interface Process {
        isFirstStart?: number
        isOutOfDateVersion?: boolean
        isOutOfDateVersionMessage?: string[]
    }
}
