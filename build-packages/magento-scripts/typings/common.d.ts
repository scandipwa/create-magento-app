import { CMAConfiguration, ServiceWithImage } from "./index"
import { ListrContext } from "./context"

export type MagentoVersionConfigurationFunction = (args: ListrContext['config']['baseConfig']) => MagentoVersionConfiguration

export type MagentoVersionConfiguration = CMAConfigurationWithMySQL &  {
    magentoVersion: string
    isDefault?: boolean
}

export type CMAConfigurationWithMySQL = Optional<CMAConfiguration, 'storeDomains' | 'host' | 'magento' | 'prefix' | 'ssl'> & {
    configuration: {
        mysql: Optional<ServiceWithImage, 'image'>
    }
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export interface ConfigPHPType {
    modules: Record<string, number>
    scopes?: {
        websites: {
            [websiteCode: string]: {
                website_id: string
                code: string
                name: string
                sort_order: string
                default_group_id: string
                is_default: string
            }
        }
        groups: {
            group_id: string
            website_id: string
            code: string
            name: string
            root_category_id: string
            default_store_id: string
        }[]
        stores: {
            [storeCode: string]: {
                store_id: string
                code: string
                website_id: string
                group_id: string
                name: string
                sort_order: string
                is_active: string
            }
        }
    }
    system?: any
}
