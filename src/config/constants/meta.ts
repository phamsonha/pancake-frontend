import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'SingSingNetwork',
  description:
    'SingSingNetwork DEX',
  image: 'https://pancakeswap.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('SingSingNetwork')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('SingSingNetwork')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('SingSingNetwork')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('SingSingNetwork')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('SingSingNetwork')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('SingSingNetwork')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('SingSingNetwork')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('SingSingNetwork')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('SingSingNetwork')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('SingSingNetwork')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('SingSingNetwork')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('SingSingNetwork')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('SingSingNetwork')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('SingSingNetwork')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('SingSingNetwork')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('SingSingNetwork')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('SingSingNetwork')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('SingSingNetwork')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('SingSingNetwork Info & Analytics')}`,
        description: 'View statistics for SingSingNetwork exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('SingSingNetwork Info & Analytics')}`,
        description: 'View statistics for SingSingNetwork exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('SingSingNetwork Info & Analytics')}`,
        description: 'View statistics for SingSingNetwork exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('SingSingNetwork')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('SingSingNetwork')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Your Profile')} | ${t('SingSingNetwork')}`,
      }
    case '/pancake-squad':
      return {
        title: `${t('Pancake Squad')} | ${t('SingSingNetwork')}`,
      }
    default:
      return null
  }
}
