export interface GalleryItem {
  /**
   * URL de l'image source en pleine résolution
   */
  src: string;

  /**
   * URL de la miniature (optionnel)
   */
  thumb?: string;

  /**
   * Titre de l'image
   */
  title?: string;

  /**
   * Description de l'image
   */
  description?: string;

  /**
   * Ordre d'affichage dans la galerie
   */
  order: number;
} 