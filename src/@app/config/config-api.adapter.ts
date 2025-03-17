import { AppConfig, AppConfigName, AppConfigs } from './app-config.interface';
import { LanguageConfig } from './language.config';

// Interface pour les propriétés de couleur
interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  warn: string;
  palettes: Record<string, any>;
}

/**
 * Service to adapt API responses to expected format
 */
export class ConfigApiAdapter {
  /**
   * Adapts the raw config data to ensure it conforms to the AppConfig interface
   */
  static adaptConfig(config: any, colorVars: Record<string, any>): AppConfig {
    if (!config) {
      throw new Error('Configuration invalide reçue');
    }
    
    // Vérifier les propriétés essentielles
    if (!config.id || !config.style) {
      throw new Error('Propriétés essentielles manquantes dans la configuration reçue');
    }
    
    // Valeurs de couleurs par défaut
    const defaultColors = {
      primary: 'indigo',
      accent: 'blue',
      warn: 'red',
      background: 'gray',
      palettes: colorVars
    };

    // Layouts par défaut
    const defaultLayouts = {
      available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
      default: config.id,
      configs: {}
    };

    // Fusionner les couleurs et layouts existants avec les valeurs par défaut
    const mergedColors = config.theme?.colors ? {
      ...defaultColors,
      ...config.theme.colors,
      palettes: colorVars // Toujours s'assurer que les palettes sont disponibles
    } : defaultColors;

    const mergedLayouts = config.theme?.layouts ? {
      ...defaultLayouts,
      ...config.theme.layouts
    } : defaultLayouts;
    
    // Ensure all required properties exist and have the correct types
    const adaptedConfig: AppConfig = {
      ...config,
      // Ensure core properties exist
      name: config.name || config.id,
      bodyClass: config.bodyClass || `app-layout-${config.id}`,
      // Utiliser layout directement
      layout: config.layout || 'horizontal',
      style: {
        ...config.style,
        // Ensure proper enum values for style properties
        colorScheme: config.style?.colorScheme || 'light',
        themeClassName: config.style?.themeClassName || `app-theme-${config.id}`,
        borderRadius: config.style?.borderRadius || { value: 0.5, unit: 'rem' },
        button: {
          borderRadius: config.style?.button?.borderRadius || { value: 9999, unit: 'px' }
        }
      },
      // Définir le thème avec les valeurs fusionnées
      theme: {
        colors: mergedColors,
        layouts: mergedLayouts
      }
    };
    
    return adaptedConfig;
  }
  
  /**
   * Adapte la nouvelle structure centralisée du db.json et construit les configs individuelles
   */
  static adaptFromCentralizedFormat(data: any): { 
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig
  } {
    // Vérifier que la structure de base est présente
    if (!data || !data.theme) {
      throw new Error('Structure de configuration invalide dans db.json: theme manquante');
    }

    if (!data.theme.layouts) {
      console.warn('Structure de configuration dans db.json: layouts manquants, utilisation de valeurs par défaut');
      data.theme.layouts = {
        available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
        default: "apollo",
        configs: {}
      };
    }

    if (!data.theme.layouts.configs) {
      console.warn('Structure de configuration dans db.json: configs manquants, utilisation de valeurs par défaut');
      data.theme.layouts.configs = {};
    }

    if (!data.theme.colors) {
      throw new Error('Variables de couleur manquantes dans db.json');
    }
    
    if (!data.languageConfig) {
      throw new Error('Configuration linguistique manquante dans db.json');
    }
    
    const configs: AppConfigs = {} as AppConfigs;
    
    // Récupérer les variables de couleur depuis db.json
    const colorVars = data.theme.colors;
    
    // Vérifier que les couleurs sont valides
    if (!colorVars || Object.keys(colorVars).length === 0) {
      throw new Error('Variables de couleur manquantes ou invalides dans db.json');
    }
    
    // Récupérer la configuration linguistique depuis db.json
    const langConfig = data.languageConfig;
    
    // Vérifier que la config linguistique est valide
    if (!langConfig.defaultLanguage || !langConfig.supportedLanguages || langConfig.supportedLanguages.length === 0) {
      throw new Error('Configuration linguistique invalide dans db.json');
    }
    
    // S'assurer qu'il y a au moins une configuration
    if (Object.keys(data.theme.layouts.configs).length === 0) {
      throw new Error('Aucune configuration trouvée dans db.json. Au moins une configuration est obligatoire.');
    }
    
    // Pour chaque layout dans la section theme.layouts.configs
    Object.entries(data.theme.layouts.configs).forEach(([key, layoutConfig]) => {
      try {
        // Créer une config adaptée pour ce layout
        const config = this.adaptConfig(layoutConfig, colorVars);
        configs[key as AppConfigName] = config;
      } catch (error) {
        console.error(`Erreur lors de l'adaptation de la configuration ${key}:`, error);
        throw error;
      }
    });
    
    // Vérifier qu'au moins une configuration a été chargée
    if (Object.keys(configs).length === 0) {
      throw new Error('Aucune configuration valide n\'a été chargée depuis db.json');
    }
    
    return { 
      configs, 
      colorVariables: colorVars,
      languageConfig: langConfig
    };
  }
} 