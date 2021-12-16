import { MenuItemsType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Trade'),
    icon: 'Swap',
    href: '/swap',
    showItemsOnMobile: false,
    items: [
      {
        label: t('Exchange'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
      },
    ],
  },
  {
    label: t('Farms'),
    href: '/farms',
    icon: 'Farms',
  },
  {
    label: t('SING Token'),
    href: '/buy-sing',
    icon: 'Trophy',
    items: [
      {
        label: t('Buy SING'),
        href: '/buy-sing',
      },
      {
        label: t('Lock & Transfer SING'),
        href: '/lock-transfer',
      },
      {
        label: t('Check Token Lock'),
        href: '/check-lock',
      },
    ],
  },
]

export default config
