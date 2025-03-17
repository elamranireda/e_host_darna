import { ColorVariable } from './color-variables';

/**
 * Structure de la section 'theme' des configurations
 */
export interface AppThemeConfig {
  /**
   * Configuration des couleurs du thème
   */
  colors: {
    /**
     * Couleur primaire du thème
     */
    primary: string;
    
    /**
     * Couleur d'accentuation
     */
    accent: string;
    
    /**
     * Couleur de fond
     */
    background: string;
    
    /**
     * Couleur utilisée pour les avertissements
     */
    warn: string;
    
    /**
     * Toutes les palettes de couleurs disponibles
     */
    palettes: Record<string, ColorVariable>;
  };
  
  /**
   * Configuration des layouts
   */
  layouts: {
    /**
     * Layouts disponibles
     */
    available: string[];
    
    /**
     * Layout par défaut
     */
    default: string;
    
    /**
     * Configurations spécifiques pour chaque layout
     */
    configs: Record<string, {
      /**
       * Nom du layout
       */
      name: string;
      
      /**
       * Classe CSS à appliquer au body
       */
      bodyClass: string;
      
      /**
       * URL de l'image représentant le layout
       */
      imgSrc: string;
      
      /**
       * Type de layout (vertical/horizontal)
       */
      type: 'vertical' | 'horizontal';
      
      /**
       * Layout est boxed ou fluid
       */
      boxed: boolean;
      
      /**
       * Configuration spécifique pour le sidenav
       */
      sidenav?: {
        /**
         * État par défaut
         */
        defaultState: 'expanded' | 'collapsed';
        
        /**
         * Position
         */
        position?: 'left' | 'right';
      };
      
      /**
       * Configuration spécifique pour la barre d'outils
       */
      toolbar?: {
        /**
         * Position fixe ou non
         */
        fixed: boolean;
        
        /**
         * Position
         */
        position?: 'top' | 'bottom';
      };
    }>;
  };
} 