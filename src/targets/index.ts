export * as Targets from './Targets'

/**
 * Loaders are the method of resolving and loading files into the MEML web targeter.
 * The easiest way to add a new language to the web target, is to add a custom
 * loader. All loaders must implement {@Link ILoader} and all necessary
 * methods.
 *
 *
 *
 * Additionally, if you want to use a custom loader system (e.g. webpack), you
 * would implement ILoader, wipe {@Link MemlCore.globalLoaders} and add your
 * own loader
 *
 * @TODO Migrate linker.ts to a class that can be extended and overridden for additional support of other builders (e.g. webpack)
 */
export * as Loaders from './loaders'
