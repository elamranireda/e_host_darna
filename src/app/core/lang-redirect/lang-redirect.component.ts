import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@app/services/language-service';

@Component({
  selector: 'app-lang-redirect',
  standalone: true,
  template: `<div>Redirecting...</div>`,
})
export class LangRedirectComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    // Récupérer le paramètre :id de l'URL
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        // Si pas d'ID, rediriger vers la page d'erreur
        this.router.navigate(['error-404']);
        return;
      }
      
      // Détecter la langue préférée
      const preferredLang = this.languageService.detectPreferredLanguage();
      
      // Rediriger vers la page d'accueil avec le préfixe ID et langue
      this.router.navigate([id, preferredLang]);
    });
  }
} 